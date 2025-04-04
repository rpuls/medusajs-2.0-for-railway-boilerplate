import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";
import {
  useDate
} from "./chunk-DV5RB7II.mjs";

// src/components/table/table-cells/common/date-cell/date-cell.tsx
import { Tooltip } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var DateCell = ({ date }) => {
  const { getFullDate } = useDate();
  if (!date) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx(
    Tooltip,
    {
      className: "z-10",
      content: /* @__PURE__ */ jsx("span", { className: "text-pretty", children: `${getFullDate({
        date,
        includeTime: true
      })}` }),
      children: /* @__PURE__ */ jsx("span", { className: "truncate", children: getFullDate({ date, includeTime: false }) })
    }
  ) });
};
var DateHeader = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: t("fields.date") }) });
};

export {
  DateCell,
  DateHeader
};
