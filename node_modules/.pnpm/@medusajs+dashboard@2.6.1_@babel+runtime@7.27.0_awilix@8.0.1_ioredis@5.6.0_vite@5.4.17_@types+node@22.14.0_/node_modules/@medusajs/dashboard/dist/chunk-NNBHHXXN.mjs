import {
  getStylizedAmount
} from "./chunk-PDWBYQOW.mjs";
import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";

// src/components/table/table-cells/common/money-amount-cell/money-amount-cell.tsx
import { clx } from "@medusajs/ui";
import { jsx } from "react/jsx-runtime";
var MoneyAmountCell = ({
  currencyCode,
  amount,
  align = "left",
  className
}) => {
  if (typeof amount === "undefined" || amount === null) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  const formatted = getStylizedAmount(amount, currencyCode);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: clx(
        "flex h-full w-full items-center overflow-hidden",
        {
          "justify-start text-left": align === "left",
          "justify-end text-right": align === "right"
        },
        className
      ),
      children: /* @__PURE__ */ jsx("span", { className: "truncate", children: formatted })
    }
  );
};

export {
  MoneyAmountCell
};
