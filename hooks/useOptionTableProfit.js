import axios from "axios";

export const useOptionTableProfit = ({ option, beginPrice, endPrice }) => {
  return axios
    .post(
      `api/table-option-profit`,
      { option, beginPrice, endPrice },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data);
};
