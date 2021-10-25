var bs = require("black-scholes");
const axios = require("axios");
const bluebird = require("bluebird");

const OPTION_TYPE = "call";
const URL_DERIBIT = "https://www.deribit.com";
// const URL_DERIBIT = "https://test.deribit.com";
const API_KEY_NASDAQ = "5zorJTCa6zk43iJr-TGC";

// TODO add the APIKEY deribit for rate limiter
// TODO manual settings
// TODO fix date picker
// TODO table price with 0
// TODO reduce call api by filter with sort timestamp
// TODO also reduce waiting by calling freeRisk, indexPrice, volatility at loading in hooks
// TODO show freeRisk, indexPrice, volatility
// TODO add in table show by $ profit or % roi
// TODO add call or put
// TODO add IV change

async function getIndexPrice(currency) {
  let pair;
  if (currency === "BTC") pair = "btc_usd";
  if (currency === "ETH") pair = "eth_usd";
  const { data } = await axios.get(
    URL_DERIBIT + "/api/v2/public/get_index_price?index_name=" + pair
  );
  console.log({ indexPrice: data.result.index_price });
  return data.result.index_price;
}
async function getVolatility(currency) {
  const { data } = await axios.get(
    URL_DERIBIT +
      "/api/v2/public/get_volatility_index_data?currency=" +
      currency +
      "&end_timestamp=" +
      Date.now() +
      "&resolution=60&start_timestamp=" +
      Date.now() +
      ""
  );
  console.log({ volatility60s: data.result.data });
  return data.result.data[0][4] / 100;
}

async function getOptions(currency) {
  const { data } = await axios.get(
    URL_DERIBIT +
      "/api/v2/public/get_instruments?currency=" +
      currency +
      "&expired=false&kind=option"
  );
  return data.result;
}

async function getRiskFreeRate() {
  const { data } = await axios.get(
    "https://data.nasdaq.com/api/v3/datasets/USTREASURY/YIELD.json?api_key=" +
      API_KEY_NASDAQ
  );
  console.log({ riskFreeRate: data.dataset.data[0][10] });
  const riskFreeRate = data.dataset.data[0][10] / 100 || 0.0166;
  return riskFreeRate;
}
async function getOrderBook(optionName) {
  const { data } = await axios.get(
    URL_DERIBIT +
      "/api/v2/public/get_order_book?depth=5&instrument_name=" +
      optionName
  );
  return data.result;
}

function estimateOptionPrice({
  underlyingPrice,
  strike,
  exerciceTimestamp,
  expirationTimestamp,
  implied_volatility,
  riskFreeRate,
  type,
}) {
  const timeToExpire = computeTimeToExpire(
    exerciceTimestamp,
    expirationTimestamp
  );
  const estimatePrice = bs.blackScholes(
    underlyingPrice,
    strike,
    timeToExpire,
    implied_volatility,
    riskFreeRate,
    type
  );
  return estimatePrice;
}

function computeTimeToExpire(exerciceTimestamp, expirationDate) {
  const timeRemaining = expirationDate - exerciceTimestamp;
  if (timeRemaining < 0) return;
  const timeToExpire = timeRemaining / 31536000000;
  return timeToExpire;
}

async function getOrderBookAndEstimatePriceForOptions(
  options,
  CURRENT_IV,
  RISK_FREE_RATE,
  indexPrice
) {
  let formattedCalls = await bluebird.Promise.map(
    options,
    async function (option) {
      try {
        const orderBook = await getOrderBook(option.instrument_name);
        const { underlying_price, best_ask_price } = orderBook;
        let formattedCall = {
          instrument_name: option.instrument_name,
          strike: option.strike,
          underlyingPrice: underlying_price,
          indexPrice,
          exerciceTimestamp: Date.now(),
          expirationTimestamp: option.expiration_timestamp,
          type: option.option_type,
          riskFreeRate: RISK_FREE_RATE,
          mark_iv: orderBook.mark_iv,
          implied_volatility: CURRENT_IV,
          askPriceCrypto: best_ask_price,
          askPrice: best_ask_price * indexPrice,
        };

        const estimatePrice = estimateOptionPrice(formattedCall);
        formattedCall = {
          ...formattedCall,
          estimatePrice,
          overPrice: (best_ask_price * indexPrice) / estimatePrice,
        };
        return formattedCall;
      } catch (error) {
        console.log(error);
      }
    },
    { concurrency: 2 }
  );
  formattedCalls = formattedCalls.filter((option) => option.askPrice !== 0);
  //   formattedCalls = formattedCalls.filter((option) => option.overPrice < 0.9);
  return formattedCalls;
}

function findBestOptionsForScenario(
  options,
  expectedExerciceTimestamp,
  expectedUnderlyingPrice
) {
  const optionsReturn = options
    .map((option) => {
      if (option?.expirationTimestamp > expectedExerciceTimestamp) {
        const estimateExpectedPrice = estimateOptionPrice({
          ...option,
          exerciceTimestamp: expectedExerciceTimestamp,
          underlyingPrice: expectedUnderlyingPrice,
        });
        return {
          ...option,
          ROI: (estimateExpectedPrice - option.askPrice) / option.askPrice,
          profit: estimateExpectedPrice - option.askPrice,
          estimateExpectedPrice,
        };
      }
    })
    .filter((clean) => !!clean);

  // return 5 bests options
  const bestOptions = optionsReturn
    .sort(function (option1, option2) {
      return option2.ROI - option1.ROI;
    })
    .slice(0, 5);

  return bestOptions;
}

const filterNearestOption = (options, nearest, exerciceTimestamp) => {
  // console.log({ calls });
  let sortedCalls = options.sort(function (option1, option2) {
    return option2.expiration_timestamp - option1.expiration_timestamp;
  });

  const closest = (data, target) =>
    data.reduce((acc, obj) =>
      Math.abs(target - obj.expiration_timestamp) <
      Math.abs(target - acc.expiration_timestamp)
        ? obj
        : acc
    );

  let filteredCalls = {};
  for (i = 0; i < nearest; i++) {
    const nearestExpirationTimestamp = closest(sortedCalls, exerciceTimestamp)[
      "expiration_timestamp"
    ];

    filteredCalls = {
      ...filteredCalls,
      nearestExpirationTimestamp: sortedCalls.filter(
        (option) => option.expiration_timestamp === nearestExpirationTimestamp
      ),
    };
    // filteredCalls = { nearestCalls, ...filteredCalls };
  }
  console.log({ filteredCalls: filteredCalls.nearestExpirationTimestamp });
};

module.exports = async (req, res) => {
  let { symbol, exerciceTimestamp, priceExpected } = req.body;

  try {
    const options = await getOptions(symbol);
    let calls = options.filter((option) => option.option_type === OPTION_TYPE);
    // const nearestCalls = filterNearestOption(calls, 4, exerciceTimestamp);
    const indexPrice = await getIndexPrice(symbol);
    const RISK_FREE_RATE = await getRiskFreeRate();
    const CURRENT_IV = await getVolatility(symbol);
    let detailledCalls = await getOrderBookAndEstimatePriceForOptions(
      calls,
      CURRENT_IV,
      RISK_FREE_RATE,
      indexPrice
    );
    let bestOptions = await findBestOptionsForScenario(
      detailledCalls,
      exerciceTimestamp,
      priceExpected
    );
    console.log({ bestOptions });
    return res.status(201).send(bestOptions);
  } catch (error) {
    console.error({ error });
    return res.status(500).send(error);
  }
};
