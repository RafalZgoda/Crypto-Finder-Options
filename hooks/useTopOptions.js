import axios from "axios";

export const useTopOptions = ({ symbol, exerciceTimestamp, priceExpected }) => {
  return axios
    .post(
      `api/top-options`,
      { symbol, exerciceTimestamp, priceExpected },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data);
};
