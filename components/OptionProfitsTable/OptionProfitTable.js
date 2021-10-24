import { useState } from "react";
import { useMutation } from "react-query";
import { useOptionTableProfit } from "../../hooks/useOptionTableProfit";
import moment from "moment";

export default function OptionsProfitTable(option) {
  const [beginPrice, , setBeginPrice] = useState("50000");
  const [endPrice, setEndPrice] = useState("120000");
  const [tableData, setTableData] = useState([]);

  const { mutate, data, isSuccess } = useMutation(useOptionTableProfit, {
    onSuccess: (data) => {
      // console.log({ data });
      setTableData(data);
      Object.entries(tableData)?.map((time) => {
        const toto = Object.keys(time[1]).map((key) => {
          // console.log(time[1][key]);
          return time[1][key];
        });
        console.log({ toto });
      });

      // Object.entries(tableData[Object.keys(tableData)[0]]).map((key) => {
      //   console.log(key[0]);
      // });
      // Object.entries(tableData)?.map((time, index) => {
      //   // console.log(time);
      //   const toto = Object.keys(time[1]).map((key) => {
      //     // console.log(tableData[time[0]][key]);
      //     return tableData[time[0]][key];
      //   });
      //   console.log(toto);
      // }); // Object.entries(data)?.map((time, index) => {
      //   console.log(Object.keys(time[1]).map((key) => time[1][key]));
      //   // console.log(index);
      //   // Object.entries(time[1])?.map((prices) => {
      //   //   console.log(prices);
      //   // });
      // });
    },
    onError: () => {
      console.log("there was an error in useTopOptions");
    },
  });

  // const fusion = function (tableData) {
  //   Object.entries(tableData)?.map((time) => {
  //     return Object.keys(time[1]).map((key) => {
  //       return tableData[time[0]][key];
  //     });
  //   });
  // };

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

  return (
    <div className="flex flex-col">
      <div className="min-w-0 flex-1">
        <input
          id="beginPrice"
          type="beginPrice"
          name="beginPrice"
          value={beginPrice}
          onChange={(event) => setBeginPrice(event.target.value)}
          placeholder="Enter your beginPrice"
          className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
        />
      </div>

      <div className="min-w-0 flex-1">
        <input
          id="endPrice"
          type="endPrice"
          name="endPrice"
          value={endPrice}
          onChange={(event) => setEndPrice(event.target.value)}
          placeholder="Enter your endPrice"
          className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
        />
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-3">
        <button
          onClick={onSubmitHandler}
          className="block w-full py-3 px-4 rounded-md shadow bg-yellow-500 text-white font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
        >
          Show table
        </button>
      </div>

      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {tableData &&
                  Object.entries(tableData[Object.keys(tableData)[0]]).map(
                    (key) => (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {moment(parseInt(key[0])).format("DD/MM")}
                      </th>
                    )
                  )}
              </thead>
              {/* {tableData &&
                Object.entries(tableData)?.map((time) =>
                  Object.keys(time[1]).map((key) => (
                    <tbody>
                      <tr
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <th> {tableData[time[0]][key]}</th>
                        </td>
                      </tr>
                    </tbody>
                  ))
                )} */}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
