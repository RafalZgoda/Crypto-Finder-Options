import { useState } from "react";
// import axios from "axios";
import { useTopOptions } from "../../hooks/useTopOptions";
import { useMutation } from "react-query";
import { RadioGroup } from "@headlessui/react";
import OptionProfitTable from "../OptionProfitsTable/OptionProfitTable";
import moment from "moment";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// import DropdownButtonCrypto from "../DropdownButtonCrypto/DropdownButtonCrypto";
export default function TopOptions() {
  const [symbol, setSymbol] = useState("BTC");
  const [exerciceTimestamp, setExerciceTimestamp] = useState(
    moment("15122021", "DDMMYYYY").format("x")
  );
  const [pricePredicted, setPricePredicted] = useState("70000");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState();

  const { mutate, data, isSuccess } = useMutation(useTopOptions, {
    onSuccess: (data) => {
      console.log({ data });
      setOptions(data);
    },
    onError: () => {
      console.log("there was an error in useTopOptions");
    },
  });

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (symbol && exerciceTimestamp && pricePredicted) {
      mutate({
        symbol,
        exerciceTimestamp,
        pricePredicted,
      });
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

      <RadioGroup value={selected} onChange={setSelected}>
        <RadioGroup.Label className="sr-only">
          Top 5 Options order by ROI
        </RadioGroup.Label>
        <div className="space-y-4">
          {options?.map((option) => (
            <RadioGroup.Option
              key={option.instrument_name}
              value={option}
              className={({ active }) =>
                classNames(
                  active ? "ring-1 ring-offset-2 ring-indigo-500" : "",
                  "relative block rounded-lg border border-gray-300 bg-white shadow-sm px-6 py-4 cursor-pointer hover:border-gray-400 sm:flex sm:justify-between focus:outline-none"
                )
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label
                        as="p"
                        className="font-medium text-gray-900"
                      >
                        {option.instrument_name}
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="div"
                        className="text-gray-500"
                      >
                        <p className="sm:inline">
                          Estimated projected Price :{" "}
                          {Math.round(option.estimatePredictedPrice)} $ Current
                          buying price {Math.round(option.askPrice)} $
                        </p>{" "}
                        <span
                          className="hidden sm:inline sm:mx-1"
                          aria-hidden="true"
                        >
                          &middot;
                        </span>{" "}
                        <p className="sm:inline">
                          ROI {Math.round(option.ROI * 100, 0)} %
                        </p>
                      </RadioGroup.Description>
                    </div>
                  </div>
                  <RadioGroup.Description
                    as="div"
                    className="mt-2 flex text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right"
                  >
                    <div className="font-medium text-gray-900">
                      Profit :{option.profit}
                    </div>
                    <div className="ml-1 text-gray-500 sm:ml-0">$</div>
                  </RadioGroup.Description>
                  <div
                    className={classNames(
                      checked ? "border-indigo-500" : "border-transparent",
                      "absolute -inset-px rounded-lg border-2 pointer-events-none"
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      {selected && <OptionProfitTable option={selected} />}
    </div>
  );
}
