import axios from "axios";
import { useQuery } from "react-query";

export const useMarketData = () => {
  return useQuery(["useMarketData"], () =>
    axios
      .get(`api/market-data`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.data)
  );
};
