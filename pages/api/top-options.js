var bs = require("black-scholes");
const axios = require("axios");
const bluebird = require("bluebird");
const moment = require("moment");
const _ = require("lodash");
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
// TODO post message deribit discord reddit
// TODO library for api
// async function getIndexPrice(currency) {
//   let pair;
//   if (currency === "BTC") pair = "btc_usd";
//   if (currency === "ETH") pair = "eth_usd";
//   const { data } = await axios.get(
//     URL_DERIBIT + "/api/v2/public/get_index_price?index_name=" + pair
//   );
//   return data.result.index_price;
// }
async function getVolatility(currency) {
  const { data } = await axios.get(
    URL_DERIBIT +
      "/api/v2/public/get_volatility_index_data?currency=" +
      currency +
      "&end_timestamp=" +
      Date.now() +
      "&resolution=60&start_timestamp=" +
      (Date.now() - 1000000) +
      ""
  );
  const volatilityInfo = data.result.data;
  const lastIndex = volatilityInfo.length - 1;
  const closeVolatility = volatilityInfo[lastIndex][4] / 100;
  console.log({ closeVolatility });
  return closeVolatility;
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

// async function getRiskFreeRate() {
//   const { data } = await axios.get(
//     "https://data.nasdaq.com/api/v3/datasets/USTREASURY/YIELD.json?api_key=" +
//       API_KEY_NASDAQ
//   );
//   const riskFreeRate = data.dataset.data[0][10] / 100 || 0.0166;
//   return riskFreeRate;
// }

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
  if (timeRemaining < 0) return 0;
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
      // if (option?.expirationTimestamp > expectedExerciceTimestamp) {
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
      // }
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
  let sortedCalls = options
    .sort(function (option1, option2) {
      return option2.expiration_timestamp - option1.expiration_timestamp;
    })
    .filter((option) => option.expiration_timestamp > exerciceTimestamp);

  const closest = (data, target) =>
    data.reduce((acc, obj) =>
      Math.abs(target - obj.expiration_timestamp) <
      Math.abs(target - acc.expiration_timestamp)
        ? obj
        : acc
    );

  let filteredCalls = [];
  // exerciceTimestamp ca vaut 1 janvier 2022
  for (i = 0; i < nearest; i++) {
    if (sortedCalls.length != 0) {
      const nearestExpirationTimestamp = closest(
        sortedCalls,
        exerciceTimestamp
      )["expiration_timestamp"];
      // 31 dec en timestamp
      filteredCalls.push(
        sortedCalls.filter(
          // tous les calls du 31 dec
          (option) => option.expiration_timestamp === nearestExpirationTimestamp
        )
      );

      sortedCalls = sortedCalls.filter(
        (option) => option.expiration_timestamp !== nearestExpirationTimestamp
      ); // retirer tous les call du 31 dec de l'array sortedCalls

      // recommencer l'opération pour trouver les calls du 6 janvier 2022
    }
  }
  return _.flatten(filteredCalls);
};

module.exports = async (req, res) => {
  let { symbol, exerciceTimestamp, priceExpected, riskFreeRate, marketInfo } =
    req.body;
  const beginTime = Date.now();
  try {
    console.log({ getOptions: Date.now() - beginTime });

    const options = await getOptions(symbol);
    console.log({ getOptions: Date.now() - beginTime });

    let calls = options.filter((option) => option.option_type === OPTION_TYPE);
    const nearestOptions = filterNearestOption(calls, 3, exerciceTimestamp); // 7 nearest expiration_timestamp options
    console.log({ nearestOptions });
    console.log({ nearestOptions: Date.now() - beginTime });
    // console.log({ nearestOptions });
    // const CURRENT_IV = await getVolatility(symbol);
    let detailledOptions = await getOrderBookAndEstimatePriceForOptions(
      nearestOptions,
      marketInfo.volatility,
      //CURRENT_IV,
      riskFreeRate,
      marketInfo.index
    );
    console.log({
      getOrderBookAndEstimatePriceForOptions: Date.now() - beginTime,
    });

    const bestOptions = await findBestOptionsForScenario(
      detailledOptions,
      exerciceTimestamp,
      priceExpected
    );

    // console.log({ bestOptions });
    console.log({ findBestOptionsForScenario: Date.now() - beginTime });

    return res.status(200).send(bestOptions);
    const bestOPtions = [
      {
        instrument_name: "BTC-25MAR22-70000-C",
        strike: 70000,
        underlyingPrice: 63818.32,
        exerciceTimestamp: 1635081492209,
        expirationTimestamp: 1648195200000,
        type: "call",
        riskFreeRate: 0.0166,
        mark_iv: 68.33,
        implied_volatility: 0.8623,
        askPriceCrypto: 0.1375,
        askPrice: 8775.019,
        estimatePrice: 11918.83813710379,
        overPrice: 0.7362310737892342,
        ROI: 0.44011883277216035,
        profit: 3862.05111983353,
        estimateExpectedPrice: 12637.07011983353,
      },
    ];
    return res.status(200).send(bestOPtions);
  } catch (error) {
    console.error({ error });
    return res.status(500).send(error);
  }
};
