import {
  useDate
} from "./chunk-DV5RB7II.mjs";

// src/components/common/date-range-display/date-range-display.tsx
import { Text, clx } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var DateRangeDisplay = ({
  startsAt,
  endsAt,
  showTime = false
}) => {
  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;
  const { t } = useTranslation();
  const { getFullDate } = useDate();
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "shadow-elevation-card-rest bg-ui-bg-component text-ui-fg-subtle flex items-center gap-x-3 rounded-md px-3 py-1.5", children: [
      /* @__PURE__ */ jsx(Bar, { date: startDate }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Text, { weight: "plus", size: "small", children: t("fields.startDate") }),
        /* @__PURE__ */ jsx(Text, { size: "small", className: "tabular-nums", children: startDate ? getFullDate({
          date: startDate,
          includeTime: showTime
        }) : "-" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "shadow-elevation-card-rest bg-ui-bg-component text-ui-fg-subtle flex items-center gap-x-3 rounded-md px-3 py-1.5", children: [
      /* @__PURE__ */ jsx(Bar, { date: endDate }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", children: t("fields.endDate") }),
        /* @__PURE__ */ jsx(Text, { size: "small", className: "tabular-nums", children: endDate ? getFullDate({
          date: endDate,
          includeTime: showTime
        }) : "-" })
      ] })
    ] })
  ] });
};
var Bar = ({ date }) => {
  const now = /* @__PURE__ */ new Date();
  const isDateInFuture = date && date > now;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: clx("bg-ui-tag-neutral-icon h-8 w-1 rounded-full", {
        "bg-ui-tag-orange-icon": isDateInFuture
      })
    }
  );
};

export {
  DateRangeDisplay
};
