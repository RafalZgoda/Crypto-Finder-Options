import axios from "axios";

export const useTopOptions = ({
  symbol,
  exerciceTimestamp,
  pricePredicted,
}) => {
  return axios
    .post(
      `api/top-options`,
      { symbol, exerciceTimestamp, pricePredicted },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data);
};
