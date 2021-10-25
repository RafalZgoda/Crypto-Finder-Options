import axios from "axios";

export const useTopOptions = ({
  symbol,
  exerciceTimestamp,
  priceExpected,
  riskFreeRate,
  marketInfo,
}) => {
  return axios
    .post(
      `api/top-options`,
      { symbol, exerciceTimestamp, priceExpected, riskFreeRate, marketInfo },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data);
};
