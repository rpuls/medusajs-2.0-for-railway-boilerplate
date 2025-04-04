import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";
import {
  ConditionalTooltip
} from "./chunk-OC7BQLYI.mjs";

// src/components/table/table-cells/common/text-cell/text-cell.tsx
import { clx } from "@medusajs/ui";
import { jsx } from "react/jsx-runtime";
var TextCell = ({ text, align = "left", maxWidth = 220 }) => {
  if (!text) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  const stringLength = text.toString().length;
  return /* @__PURE__ */ jsx(ConditionalTooltip, { content: text, showTooltip: stringLength > 20, children: /* @__PURE__ */ jsx(
    "div",
    {
      className: clx("flex h-full w-full items-center gap-x-3 overflow-hidden", {
        "justify-start text-start": align === "left",
        "justify-center text-center": align === "center",
        "justify-end text-end": align === "right"
      }),
      style: {
        maxWidth
      },
      children: /* @__PURE__ */ jsx("span", { className: "truncate", children: text })
    }
  ) });
};
var TextHeader = ({ text, align = "left" }) => {
  return /* @__PURE__ */ jsx("div", { className: clx("flex h-full w-full items-center", {
    "justify-start text-start": align === "left",
    "justify-center text-center": align === "center",
    "justify-end text-end": align === "right"
  }), children: /* @__PURE__ */ jsx("span", { className: "truncate", children: text }) });
};

export {
  TextCell,
  TextHeader
};
