const axios = require("axios");
const URL_DERIBIT = "https://www.deribit.com";
// const URL_DERIBIT = "https://test.deribit.com";
const API_KEY_NASDAQ = "5zorJTCa6zk43iJr-TGC";

async function getIndexPrice(currency) {
  let pair;
  if (currency === "BTC") pair = "btc_usd";
  if (currency === "ETH") pair = "eth_usd";
  const { data } = await axios.get(
    URL_DERIBIT + "/api/v2/public/get_index_price?index_name=" + pair
  );
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
      (Date.now() - 1000000) +
      ""
  );
  const volatilityInfo = data.result.data;
  const lastIndex = volatilityInfo.length - 1;
  const closeVolatility = volatilityInfo[lastIndex][4] / 100;
  return closeVolatility;
}

async function getRiskFreeRate() {
  const { data } = await axios.get(
    "https://data.nasdaq.com/api/v3/datasets/USTREASURY/YIELD.json?api_key=" +
      API_KEY_NASDAQ
  );
  const riskFreeRate = data.dataset.data[0][10] / 100 || 0.0166;
  return riskFreeRate;
}

module.exports = async (req, res) => {
  const symbols = ["BTC", "ETH"];
  try {
    const RISK_FREE_RATE = await getRiskFreeRate();
    const marketInfos = await Promise.all(
      symbols.map(async (symbol) => {
        return {
          index: await getIndexPrice(symbol),
          volatility: await getVolatility(symbol),
          symbol,
        };
      })
    );
    return res.status(200).send({ RISK_FREE_RATE, marketInfos });
  } catch (error) {
    console.error({ error });
    return res.status(500).send(error);
  }
};
