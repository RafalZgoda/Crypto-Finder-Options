import { RadioGroup } from "@headlessui/react";
import moment from "moment";
import { useState, useEffect } from "react";
import { useMutation } from "react-query";
import { useTopOptions } from "../../hooks/useTopOptions";
import OptionProfitTable from "../OptionProfitsTable/OptionProfitTable";
import DropdownButtonCrypto from "../DropdownButtonCrypto/DropdownButtonCrypto";
import DayPicker from "react-day-picker";
import "react-day-picker/lib/style.css";
import DayPickerInput from "react-day-picker/DayPickerInput";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function numberWithSpaces(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function TopOptions() {
  const [symbol, setSymbol] = useState("BTC");
  const [exerciceTimestamp, setExerciceTimestamp] = useState("");
  const [priceExpected, setPriceExpected] = useState("");
  const [budget, setBudget] = useState("");
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
      setSelected(optionsFound[0]);
      setIsLoading(false);
    }
    if (error) {
      setIsLoading(false);
      console.log(error);
    }
  }, [optionsFound, error]);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    console.log(symbol && exerciceTimestamp && priceExpected);
    if (symbol && exerciceTimestamp && priceExpected) {
      setIsLoading(true);
      searchOptions({
        symbol,
        exerciceTimestamp: moment(exerciceTimestamp).format("x"),
        priceExpected,
      });
    }
  };
  const handleDayClick = (day) => {
    setExerciceTimestamp(day);
  };

  return (
    <>
      <div className="mt-10 ">
        <DropdownButtonCrypto
          onSelection={(symbol) => {
            setSymbol(symbol);
          }}
        />
        <div className="p-2 ">
          <DayPickerInput
            selectedDays={new Date(exerciceTimestamp)}
            onDayClick={handleDayClick}
            disabledDays={[
              {
                before: new Date(),
              },
            ]}
            fromMonth={new Date()}
            inputProps={{
              style: {
                borderRadius: "0.375rem",
                padding: "0.5rem",
                borderWidth: "2px",

                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              },
            }}
            onDayChange={handleDayClick}
          />
        </div>

        <div className="p-2">
          <input
            id="priceExpected"
            type="number"
            value={priceExpected}
            onChange={(event) => setPriceExpected(event.target.value)}
            placeholder="Predicted price ($)"
            className="  px-4 py-3 rounded-md border-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-offset-indigo-900"
          />
        </div>
        <div className="p-2">
          <input
            id="budget"
            type="number"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="Budget ($)"
            className="  px-4 py-3 rounded-md border-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-offset-indigo-900"
          />
        </div>
        {isLoading ? (
          <div className="min-w-0 flex justify-center">
            <button className="flex rounded-md border border-transparent px-5 py-3 bg-gray-800 text-base font-medium text-white shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-500 sm:px-10">
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
            </button>
          </div>
        ) : (
          <button
            onClick={onSubmitHandler}
            disabled={!symbol || !exerciceTimestamp}
            className="rounded-md border border-transparent px-5 py-3 bg-gray-700 text-base font-medium text-white shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-500 sm:px-10"
          >
            Search Top Options
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
                            className="flex-shrink-0 inline-block px-2 py-0.5 text-grey-800 text-xs font-medium bg-green-100 rounded-full"
                          >
                            {option.instrument_name}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="div"
                            className="text-gray-500"
                          >
                            <p className="sm:inline">
                              {Math.round(budget / option.askPrice)} x @
                              {option.askPriceCrypto} {symbol}
                              {/* {Math.round(option.askPriceCrypto)} */}
                            </p>
                            <p className="sm:inline"></p>
                          </RadioGroup.Description>
                        </div>
                      </div>
                      <RadioGroup.Description
                        as="div"
                        className="mt-2  text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right"
                      >
                        <div className="font-medium text-left text-gray-900">
                          ROI :{" "}
                          <span className="text-green-400">
                            {Math.round(option.ROI * 100, 1)} %{" "}
                          </span>
                        </div>
                        <div className="ml-1 text-gray-500  text-left sm:ml-0">
                          {" "}
                          Profit :{" "}
                          {numberWithSpaces(
                            Math.round(
                              Math.round(budget / option.askPrice) *
                                option.profit
                            )
                          )}{" "}
                          $
                        </div>
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
      {selected && (
        <OptionProfitTable
          option={selected}
          symbol={symbol}
          priceExpected={priceExpected}
          budget={budget}
        />
      )}
    </>
  );
}
