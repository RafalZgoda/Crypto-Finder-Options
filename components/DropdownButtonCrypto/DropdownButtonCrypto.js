import { useState } from "react";
import { RadioGroup } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const cryptos = [
  { name: "BTC", isActive: true },
  { name: "ETH", isActive: true },
];
export default function DropdownButtonCrypto({ onSelection }) {
  const [selectedcrypto, setSelectedcrypto] = useState(cryptos[2]);

  const onSelectSymbol = (symbol) => {
    onSelection(symbol?.name);
    setSelectedcrypto(symbol);
  };
  return (
    <div className="relative inline-block text-left">
      <RadioGroup value={selectedcrypto} onChange={onSelectSymbol}>
        <RadioGroup.Label className="sr-only">Choose a crypto</RadioGroup.Label>
        <div className="grid grid-cols-2 gap-2">
          {cryptos.map((crypto) => (
            <RadioGroup.Option
              key={crypto.name}
              value={crypto}
              className={({ active, checked }) =>
                classNames(
                  crypto.isActive
                    ? "cursor-pointer focus:outline-none"
                    : "opacity-25 cursor-not-allowed",
                  active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                  checked
                    ? "bg-indigo-600 border-transparent text-white hover:bg-indigo-700"
                    : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
                  "border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase sm:flex-1"
                )
              }
              disabled={!crypto.isActive}
            >
              <RadioGroup.Label as="p">{crypto.name}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
