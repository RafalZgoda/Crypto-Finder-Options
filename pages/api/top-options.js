var bs = require("black-scholes");
const axios = require("axios");
const bluebird = require("bluebird");

const OPTION_TYPE = "call";
const CURRENT_IV = 0.8623;
// const URL_DERIBIT = "https://www.deribit.com";
const URL_DERIBIT = "https://test.deribit.com";
const API_KEY_NASDAQ = "5zorJTCa6zk43iJr-TGC";
// TODO add the APIKEY deribit for rate limiter
// TODO filter near terms options (by timestamp)
// TODO compute % profit for a future date and an underlying Price for a specific option
// TODO find the max % profit with the best option for a future date and an underlying Price
// TODO get Current IV and RISK FREE RATE for

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

async function getOrderBookAndEstimatePriceForOptions(options, RISK_FREE_RATE) {
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
          exerciceTimestamp: Date.now(),
          expirationTimestamp: option.expiration_timestamp,
          type: option.option_type,
          riskFreeRate: RISK_FREE_RATE,
          mark_iv: orderBook.mark_iv,
          implied_volatility: CURRENT_IV,
          askPriceBTC: best_ask_price,
          askPrice: best_ask_price * underlying_price,
        };

        const estimatePrice = estimateOptionPrice(formattedCall);
        formattedCall = {
          ...formattedCall,
          estimatePrice,
          overPrice: (best_ask_price * underlying_price) / estimatePrice,
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

function findBestOptionForScenario(
  options,
  predictedExerciceTimestamp,
  predictedUnderlyingPrice
) {
  const optionsReturn = options
    .map((option) => {
      if (option?.expirationTimestamp > predictedExerciceTimestamp) {
        const estimatePredictedPrice = estimateOptionPrice({
          ...option,
          exerciceTimestamp: predictedExerciceTimestamp,
          underlyingPrice: predictedUnderlyingPrice,
        });
        return {
          ...option,
          ROI: (estimatePredictedPrice - option.askPrice) / option.askPrice,
          profit: estimatePredictedPrice - option.askPrice,
          estimatePredictedPrice,
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

module.exports = async (req, res) => {
  let { symbol, exerciceTimestamp, pricePredicted } = req.body;

  try {
    const RISK_FREE_RATE = await getRiskFreeRate();
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
        askPriceBTC: 0.1375,
        askPrice: 8775.019,
        estimatePrice: 11918.83813710379,
        overPrice: 0.7362310737892342,
        ROI: 0.44011883277216035,
        profit: 3862.05111983353,
        estimatePredictedPrice: 12637.07011983353,
      },
      {
        instrument_name: "BTC-31DEC21-44000-C",
        strike: 44000,
        underlyingPrice: 62099.08,
        exerciceTimestamp: 1635081481718,
        expirationTimestamp: 1640937600000,
        type: "call",
        riskFreeRate: 0.0166,
        mark_iv: 100.97,
        implied_volatility: 0.8623,
        askPriceBTC: 0.329,
        askPrice: 20430.59732,
        estimatePrice: 20039.249064361662,
        overPrice: 1.0195290878605987,
        ROI: 0.27497997493515614,
        profit: 5618.005138963868,
        estimatePredictedPrice: 26048.60245896387,
      },
      {
        instrument_name: "BTC-31DEC21-48000-C",
        strike: 48000,
        underlyingPrice: 62101.35,
        exerciceTimestamp: 1635081485047,
        expirationTimestamp: 1640937600000,
        type: "call",
        riskFreeRate: 0.0166,
        mark_iv: 100.96,
        implied_volatility: 0.8623,
        askPriceBTC: 0.28,
        askPrice: 17388.378,
        estimatePrice: 17108.186594666797,
        overPrice: 1.0163776215429254,
        ROI: 0.27128646064326106,
        profit: 4717.231523947146,
        estimatePredictedPrice: 22105.609523947147,
      },
      {
        instrument_name: "BTC-31DEC21-40000-C",
        strike: 40000,
        underlyingPrice: 62133.2,
        exerciceTimestamp: 1635081502486,
        expirationTimestamp: 1640937600000,
        type: "call",
        riskFreeRate: 0.0166,
        mark_iv: 100.83,
        implied_volatility: 0.8623,
        askPriceBTC: 0.384,
        askPrice: 23859.1488,
        estimatePrice: 23295.797122004296,
        overPrice: 1.0241825456774596,
        ROI: 0.2587185965385433,
        profit: 6172.805492140269,
        estimatePredictedPrice: 30031.954292140268,
      },
      {
        instrument_name: "BTC-31DEC21-36000-C",
        strike: 36000,
        underlyingPrice: 62101.35,
        exerciceTimestamp: 1635081484715,
        expirationTimestamp: 1640937600000,
        type: "call",
        riskFreeRate: 0.0166,
        mark_iv: 100.96,
        implied_volatility: 0.8623,
        askPriceBTC: 0.4355,
        askPrice: 27045.137925,
        estimatePrice: 26748.784079490495,
        overPrice: 1.0110791520328108,
        ROI: 0.25814310616739183,
        profit: 6981.51591068503,
        estimatePredictedPrice: 34026.65383568503,
      },
    ];
    return res.status(201).send(bestOPtions);
    const options = await getOptions(symbol);
    let calls = options.filter((option) => option.option_type === OPTION_TYPE);
    let detailledCalls = await getOrderBookAndEstimatePriceForOptions(
      calls,
      RISK_FREE_RATE
    );
    let bestOption = await findBestOptionForScenario(
      detailledCalls,
      exerciceTimestamp,
      pricePredicted
    );
    console.log({ bestOption });
  } catch (error) {
    console.error({ error });
    return res.status(500).send(error);
  }
};
