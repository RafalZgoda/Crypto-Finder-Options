import { useState, useEffect } from "react";
import { useMutation } from "react-query";
import { useOptionTableProfit } from "../../hooks/useOptionTableProfit";
import moment from "moment";

export default function OptionsProfitTable({
  option,
  symbol,
  priceExpected,
  budget,
}) {
  const [beginPrice, setBeginPrice] = useState(
    Math.round(option.indexPrice / 10) * 10
  );
  const [endPrice, setEndPrice] = useState(priceExpected);
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

  function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  return (
    <>
      {headers && prices && tableData && (
        <>
          {" "}
          <span className="text-xl mt-10 "> Price range</span>
          <div className="grid grid-cols-2 gap-4 ">
            <input
              id="beginPrice"
              type="beginPrice"
              name="beginPrice"
              value={beginPrice}
              onChange={(event) => setBeginPrice(event.target.value)}
              placeholder="Enter your beginPrice"
              className=" px-4 py-3 rounded-md border-4 text-base text-gray-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 focus:ring-offset-green-900"
            />

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
        </>
      )}
      <button
        onClick={onSubmitHandler}
        className=" py-3 px-4 mt-10 rounded-md shadow bg-green-500 text-white font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 focus:ring-offset-gray-900"
      >
        Show table
      </button>
      {headers && prices && tableData && (
        <div className="flex flex-col text-xs mt-10 ">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table>
                <thead className="bg-red-50">
                  <tr key={Math.random()}>
                    <th className="sm:p-2  bg-gray-200">{symbol} </th>
                    {headers?.map((time, index) => (
                      <th className="sm:p-2 bg-gray-100" key={index}>
                        {moment(parseInt(time)).format("DD/MM")}
                      </th>
                    ))}
                  </tr>
                </thead>
                {prices && (
                  <tbody>
                    {prices?.map((price, index) => (
                      <tr key={index}>
                        <td className="sm:p-2 bg-gray-100">
                          {numberWithSpaces(price)}
                        </td>
                        {Object?.values(tableData[price]).flatMap((key, i) => (
                          <td
                            className={
                              key > 10
                                ? "bg-green-300	sm:p-2"
                                : "bg-red-300	sm:p-2"
                            }
                            key={i}
                          >
                            {numberWithSpaces(
                              Math.round(
                                key * Math.round(budget / option.askPrice)
                              )
                            )}
                            $
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
