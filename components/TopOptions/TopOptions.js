import { useState } from "react";
// import axios from "axios";
import { useTopOptions } from "../../hooks/useTopOptions";
import { useMutation } from "react-query";

// import DropdownButtonCrypto from "../DropdownButtonCrypto/DropdownButtonCrypto";
export default function TopOptions() {
  const [symbol, setSymbol] = useState("BTC");
  const [exerciceTimestamp, setExerciceTimestamp] = useState("1635024911509");
  const [pricePredicted, setPricePredicted] = useState("70000");
  const [options, setOptions] = useState();
  const { mutate, data, isSuccess } = useMutation(useTopOptions, {
    onSuccess: (data) => {
      console.log({ data });
      setOptions(data);
    },
    onError: () => {
      console.log("there was an error in useTopOptions");
    },
  });

  const getTopOptions = () => {
    if (symbol && exerciceTimestamp && pricePredicted) {
      mutate({
        symbol,
        exerciceTimestamp,
        pricePredicted,
      });

      // axios.post("http://localhost:3000/api/top-options", {
      //   symbol,
      //   exerciceTimestamp,
      //   pricePredicted,
      // });
    }
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (symbol && exerciceTimestamp && pricePredicted) {
      getTopOptions();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="min-w-0 flex-1">
        <input
          id="exerciceTimestamp"
          type="exerciceTimestamp"
          name="exerciceTimestamp"
          value={exerciceTimestamp}
          onChange={(event) => setExerciceTimestamp(event.target.value)}
          placeholder="Enter your exerciceTimestamp"
          className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
        />
      </div>

      <div className="min-w-0 flex-1">
        <input
          id="symbol"
          type="symbol"
          name="symbol"
          value={symbol}
          onChange={(event) => setSymbol(event.target.value)}
          placeholder="Enter your symbol"
          className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
        />
      </div>

      <div className="min-w-0 flex-1">
        <input
          id="pricePredicted"
          type="pricePredicted"
          name="pricePredicted"
          value={pricePredicted}
          onChange={(event) => setPricePredicted(event.target.value)}
          placeholder="Enter your pricePredicted"
          className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
        />
      </div>

      {/* <DropdownButtonCrypto /> */}
      <div className="mt-3 sm:mt-0 sm:ml-3">
        <button
          onClick={onSubmitHandler}
          className="block w-full py-3 px-4 rounded-md shadow bg-yellow-500 text-white font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
        >
          submit
        </button>
      </div>
      {options?.map((option, index) => (
        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {option.instrument_name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {option.ROI}
          </td>
        </tr>
      ))}
    </div>
  );
}
