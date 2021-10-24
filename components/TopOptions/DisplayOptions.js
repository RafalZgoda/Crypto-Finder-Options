/* This example requires Tailwind CSS v2.0+ */
import { MailIcon, PhoneIcon } from "@heroicons/react/solid";

export const DisplayOptions = ({ options = [], onSelectedOption }) => {
  console.log(options);
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {options.map((option, index) => (
        <li
          key={index}
          onClick={onSelectedOption(option)}
          className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200"
        >
          <div className="w-full flex items-center justify-between p-6 space-x-6">
            <div className="flex-1 ">
              <div className="flex items-left space-x-3">
                <span className="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                  {option.instrument_name}
                </span>
                <h3 className="text-gray-900 text-sm font-medium truncate">
                  ROI: {Math.round(option.ROI * 100)}%
                </h3>
              </div>
              <p className="mt-1 text-left text-gray-500 text-sm truncate">
                Estimated projected Price:{" "}
                {Math.round(option.estimatePredictedPrice)} $
              </p>
              <p className="mt-1 text-left text-gray-500 text-sm truncate">
                Current buying price: {Math.round(option.askPrice)} $
              </p>
              <p className="mt-1 text-left text-gray-500 text-sm truncate">
                Profit: {Math.round(option.profit)} $
              </p>
              <button className=" py-3 px-4 rounded-md shadow bg-green-500 text-white font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 focus:ring-offset-gray-900">
                Select option
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
