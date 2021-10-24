import { useState, useEffect } from "react";
import { useMutation } from "react-query";
import { useOptionTableProfit } from "../../hooks/useOptionTableProfit";
import moment from "moment";

export default function OptionsProfitTable({ option, symbol }) {
  const [beginPrice, , setBeginPrice] = useState("50000");
  const [endPrice, setEndPrice] = useState("120000");
  const [tableData, setTableData] = useState();
  const [headers, setHeaders] = useState();
  const [prices, setPrices] = useState();

  const {
    mutate,
    data: optionsTableProfit,
    isSuccess,
  } = useMutation(useOptionTableProfit);

  useEffect(() => {
    if (optionsTableProfit && isSuccess) {
      console.log(optionsTableProfit);
      const pricesFound = Object.keys(optionsTableProfit);
      const headersDates = Object.keys(optionsTableProfit[pricesFound[0]]);

      // const headersDates = pricesFound.flatMap((price) => {
      //   return Object.keys(optionsTableProfit[price]);
      // });
      setPrices(pricesFound);
      setHeaders(headersDates);
      setTableData(optionsTableProfit);
    }
  }, [optionsTableProfit, isSuccess]);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (option && beginPrice && endPrice) {
      mutate({
        option,
        beginPrice,
        endPrice,
      });
    }
  };

  console.log({ tableData });
  console.log({ headers });
  console.log({ prices });
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mt-10 ">
        <span className="underline text-xl">Begin Price</span>
        <input
          id="beginPrice"
          type="beginPrice"
          name="beginPrice"
          value={beginPrice}
          onChange={(event) => setBeginPrice(event.target.value)}
          placeholder="Enter your beginPrice"
          className=" px-4 py-3 rounded-md border-4 text-base text-gray-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 focus:ring-offset-green-900"
        />
        <span className="underline text-xl">End Price</span>

        <input
          id="endPrice"
          type="endPrice"
          name="endPrice"
          value={endPrice}
          onChange={(event) => setEndPrice(event.target.value)}
          placeholder="Enter your endPrice"
          className="block w-full px-4 py-3 rounded-md border-4  text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 focus:ring-offset-green-900"
        />
      </div>
      <button
        onClick={onSubmitHandler}
        className=" py-3 px-4 mt-10 rounded-md shadow bg-green-500 text-white font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 focus:ring-offset-gray-900"
      >
        Show table
      </button>
      {headers && prices && tableData && (
        <div className="mt-10">
          <table>
            <thead className="bg-red-50">
              <tr key={Math.random()}>
                {symbol}
                {headers?.map((time) => (
                  <th>{moment(parseInt(time)).format("DD/MM")}</th>
                ))}
              </tr>
            </thead>
            {prices && (
              <tbody>
                {prices?.map((price, index) => (
                  <tr key={index}>
                    {price}

                    {Object?.values(tableData[price]).flatMap((key, i) => (
                      <td key={i}>{Math.round(key)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      )}
    </>
  );
}
