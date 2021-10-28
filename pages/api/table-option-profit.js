var lib = require("./library/lib");
const { estimateOptionPrice } = lib;

const MAX_HEADERS = 15;
const MAX_ROWS = 30;

function drawData(option, beginPrice, endPrice) {
  let data = {};
  let incrementPrice =
    Math.round((endPrice - beginPrice) / MAX_ROWS / 10, 0) * 10;
  let incrementDate = Math.round(
    (option.expirationTimestamp - Date.now()) / MAX_HEADERS,
    0
  );
  let initDate = Date.now();
  for (let price = beginPrice; price < endPrice; price += incrementPrice) {
    data[price] = {};
    let date = initDate;
    for (date; date < option.expirationTimestamp; date += incrementDate) {
      data[price][date] = estimateOptionPrice({
        ...option,
        exerciceTimestamp: date,
        underlyingPrice: Math.round(price, 0),
      });
    }
    data[price][date] = estimateOptionPrice({
      ...option,
      exerciceTimestamp: date + 1,
      underlyingPrice: Math.round(price, 0),
    });
  }
  return data;
}

module.exports = async (req, res) => {
  let { option, beginPrice: beginPrice, endPrice } = req.body;
  beginPrice = parseInt(beginPrice);
  endPrice = parseInt(endPrice);
  if (!option) {
    return res.status(422).send("Option not selected");
  }

  try {
    const response = drawData(option, beginPrice, endPrice);
    return res.status(200).send(response);
  } catch (error) {
    console.error({ error });
    return res.status(500).send(error);
  }
};
