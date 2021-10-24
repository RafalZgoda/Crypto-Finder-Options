import { RadioGroup } from "@headlessui/react";
import moment from "moment";
import { useState, useEffect } from "react";
import { useMutation } from "react-query";
// import axios from "axios";
import { useTopOptions } from "../../hooks/useTopOptions";
import OptionProfitTable from "../OptionProfitsTable/OptionProfitTable";

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
  const [isLoading, setIsLoading] = useState(false);

  const {
    mutate: searchOptions,
    data: optionsFound,
    error,
  } = useMutation(useTopOptions);

  useEffect(() => {
    if (optionsFound) {
      setOptions(optionsFound);
      setIsLoading(false);
    }
    if (error) {
      setIsLoading(false);
      console.log(error);
    }
  }, [optionsFound, error]);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (symbol && exerciceTimestamp && pricePredicted) {
      setIsLoading(true);
      searchOptions({
        symbol,
        exerciceTimestamp,
        pricePredicted,
      });
    }
  };

  return (
    <>
      <div className="mt-10 ">
        <div className="p-2 ">
          <input
            id="exerciceTimestamp"
            type="exerciceTimestamp"
            name="exerciceTimestamp"
            value={exerciceTimestamp}
            onChange={(event) => setExerciceTimestamp(event.target.value)}
            placeholder="Enter your exerciceTimestamp"
            className="  px-4 py-3 rounded-md border-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
          />
        </div>

        <div className="p-2 ">
          <input
            id="symbol"
            type="symbol"
            name="symbol"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            placeholder="Enter your symbol"
            className=" px-4 py-3 rounded-md border-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
          />
        </div>

        <div className="p-2">
          <input
            id="pricePredicted"
            type="pricePredicted"
            name="pricePredicted"
            value={pricePredicted}
            onChange={(event) => setPricePredicted(event.target.value)}
            placeholder="Enter your pricePredicted"
            className="  px-4 py-3 rounded-md border-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 focus:ring-offset-gray-900"
          />
        </div>

        {isLoading ? (
          <button className="  rounded-md border border-transparent px-5 py-3 bg-gray-800 text-base font-medium text-white shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-500 sm:px-10">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading
          </button>
        ) : (
          <button
            onClick={onSubmitHandler}
            className=" rounded-md border border-transparent px-5 py-3 bg-gray-700 text-base font-medium text-white shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-500 sm:px-10"
          >
            Search Options
          </button>
        )}

        <div className="mt-10">
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
                              {option.estimatePredictedPrice} /{" "}
                              {option.askPrice}
                            </p>
                            <span
                              className="hidden sm:inline sm:mx-1"
                              aria-hidden="true"
                            >
                              &middot;
                            </span>
                            <p className="sm:inline">{option.ROI}</p>
                          </RadioGroup.Description>
                        </div>
                      </div>
                      <RadioGroup.Description
                        as="div"
                        className="mt-2  text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right"
                      >
                        <div className="font-medium text-gray-900">
                          {option.profit}
                        </div>
                        <div className="ml-1 text-gray-500 sm:ml-0">/mo</div>
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
        </div>
      </div>
      {selected && <OptionProfitTable option={selected} />}
    </>
  );
}
