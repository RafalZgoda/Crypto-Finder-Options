var bs = require("black-scholes");
const axios = require("axios");
const bluebird = require("bluebird");

const OPTION_TYPE = "call";
const RISK_FREE_RATE = 0.0166;
const CURRENT_IV = 0.8623;
// const URL_DERIBIT = "https://www.deribit.com";
const URL_DERIBIT = "https://test.deribit.com";

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

async function getOrderBookAndEstimatePriceForOptions(options) {
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
    const options = await getOptions(symbol);
    let calls = options.filter((option) => option.option_type === OPTION_TYPE);
    let detailledCalls = await getOrderBookAndEstimatePriceForOptions(calls);
    let bestOption = await findBestOptionForScenario(
      detailledCalls,
      exerciceTimestamp,
      pricePredicted
    );
    console.log({ bestOption });
    return res.status(201).send(bestOption);
  } catch (error) {
    console.error({ error });
    return res.status(500).send(error);
  }
};
