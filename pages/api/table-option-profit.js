var bs = require("black-scholes");
const moment = require("moment");

const MAX_HEADERS = 30;
const MAX_ROWS = 30;

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

function drawData(option, beginPrice, endPrice) {
  let data = {};
  let incrementPrice = Math.round((endPrice - beginPrice) / MAX_ROWS, 2);
  let incrementDate = Math.round(
    (option.expirationTimestamp - Date.now()) / MAX_HEADERS,
    0
  );

  console.log(incrementPrice, incrementDate);
  console.log(beginPrice, endPrice);
  for (let price = beginPrice; price < endPrice; price += incrementPrice) {
    data[price] = [];
    for (
      let date = Date.now();
      date < option.expirationTimestamp;
      date += incrementDate
    ) {
      const readableDate = moment(date).format("DDMM");
      console.log(readableDate);
      data[price][date] = estimateOptionPrice({
        ...option,
        exerciceTimestamp: date,
        underlyingPrice: Math.round(price, 0),
      });
    }
  }
  // format table
  return data;
}

module.exports = async (req, res) => {
  let { option, beginPrice, endPrice } = req.body;

  console.log({ option });
  if (!option) {
    return res.status(422).send("Option not selected");
  }

  try {
    const response = drawData(option, beginPrice, endPrice);
    return res.status(201).send(response);
  } catch (error) {
    console.error({ error });
    return res.status(500).send(error);
  }
};
