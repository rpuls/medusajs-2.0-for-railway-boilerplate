import {
  useSelectedParams
} from "./chunk-M3VFKDXJ.mjs";
import {
  useDate
} from "./chunk-DV5RB7II.mjs";

// src/components/table/data-table/data-table-filter/data-table-filter.tsx
import { Button, clx as clx6 } from "@medusajs/ui";
import { Popover as RadixPopover6 } from "radix-ui";
import { useCallback as useCallback3, useEffect as useEffect3, useMemo as useMemo2, useRef, useState as useState5 } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation as useTranslation5 } from "react-i18next";

// src/components/table/data-table/data-table-filter/context.tsx
import { createContext, useContext } from "react";
var DataTableFilterContext = createContext(null);
var useDataTableFilterContext = () => {
  const ctx = useContext(DataTableFilterContext);
  if (!ctx) {
    throw new Error(
      "useDataTableFacetedFilterContext must be used within a DataTableFacetedFilter"
    );
  }
  return ctx;
};

// src/components/table/data-table/data-table-filter/date-filter.tsx
import { EllipseMiniSolid } from "@medusajs/icons";
import { DatePicker, Text as Text2, clx as clx2 } from "@medusajs/ui";
import isEqual from "lodash/isEqual";
import { Popover as RadixPopover2 } from "radix-ui";
import { useMemo, useState } from "react";
import { t } from "i18next";
import { useTranslation as useTranslation2 } from "react-i18next";

// src/components/table/data-table/data-table-filter/filter-chip.tsx
import { XMarkMini } from "@medusajs/icons";
import { Text, clx } from "@medusajs/ui";
import { Popover as RadixPopover } from "radix-ui";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var FilterChip = ({
  hadPreviousValue,
  label,
  value,
  readonly,
  hasOperator,
  onRemove
}) => {
  const { t: t2 } = useTranslation();
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-ui-bg-field transition-fg shadow-borders-base text-ui-fg-subtle flex cursor-default select-none items-stretch overflow-hidden rounded-md", children: [
    !hadPreviousValue && /* @__PURE__ */ jsx(RadixPopover.Anchor, {}),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: clx(
          "flex items-center justify-center whitespace-nowrap px-2 py-1",
          {
            "border-r": !!(value || hadPreviousValue)
          }
        ),
        children: /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", leading: "compact", children: label })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center overflow-hidden", children: [
      hasOperator && !!(value || hadPreviousValue) && /* @__PURE__ */ jsx("div", { className: "border-r p-1 px-2", children: /* @__PURE__ */ jsx(
        Text,
        {
          size: "small",
          weight: "plus",
          leading: "compact",
          className: "text-ui-fg-muted",
          children: t2("general.is")
        }
      ) }),
      !!(value || hadPreviousValue) && /* @__PURE__ */ jsx(
        RadixPopover.Trigger,
        {
          asChild: true,
          className: clx(
            "flex-1 cursor-pointer overflow-hidden border-r p-1 px-2",
            {
              "hover:bg-ui-bg-field-hover": !readonly,
              "data-[state=open]:bg-ui-bg-field-hover": !readonly
            }
          ),
          children: /* @__PURE__ */ jsx(
            Text,
            {
              size: "small",
              leading: "compact",
              weight: "plus",
              className: "truncate text-nowrap",
              children: value || "\xA0"
            }
          )
        }
      )
    ] }),
    !readonly && !!(value || hadPreviousValue) && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleRemove,
        className: clx(
          "text-ui-fg-muted transition-fg flex items-center justify-center p-1",
          "hover:bg-ui-bg-subtle-hover",
          "active:bg-ui-bg-subtle-pressed active:text-ui-fg-base"
        ),
        children: /* @__PURE__ */ jsx(XMarkMini, {})
      }
    )
  ] });
};
var filter_chip_default = FilterChip;

// src/components/table/data-table/data-table-filter/date-filter.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var DateFilter = ({
  filter,
  prefix,
  readonly,
  openOnMount
}) => {
  const [open, setOpen] = useState(openOnMount);
  const [showCustom, setShowCustom] = useState(false);
  const { getFullDate } = useDate();
  const { key, label } = filter;
  const { removeFilter } = useDataTableFilterContext();
  const selectedParams = useSelectedParams({ param: key, prefix });
  const presets = usePresets();
  const handleSelectPreset = (value) => {
    selectedParams.add(JSON.stringify(value));
    setShowCustom(false);
  };
  const handleSelectCustom = () => {
    selectedParams.delete();
    setShowCustom((prev) => !prev);
  };
  const currentValue = selectedParams.get();
  const currentDateComparison = parseDateComparison(currentValue);
  const customStartValue = getDateFromComparison(currentDateComparison, "$gte");
  const customEndValue = getDateFromComparison(currentDateComparison, "$lte");
  const handleCustomDateChange = (value, pos) => {
    const key2 = pos === "start" ? "$gte" : "$lte";
    const dateValue = value ? value.toISOString() : void 0;
    selectedParams.add(
      JSON.stringify({
        ...currentDateComparison || {},
        [key2]: dateValue
      })
    );
  };
  const getDisplayValueFromPresets = () => {
    const preset = presets.find((p) => isEqual(p.value, currentDateComparison));
    return preset?.label;
  };
  const formatCustomDate = (date) => {
    return date ? getFullDate({ date }) : void 0;
  };
  const getCustomDisplayValue = () => {
    const formattedDates = [customStartValue, customEndValue].map(
      formatCustomDate
    );
    return formattedDates.filter(Boolean).join(" - ");
  };
  const displayValue = getDisplayValueFromPresets() || getCustomDisplayValue();
  const [previousValue, setPreviousValue] = useState(
    displayValue
  );
  const handleRemove = () => {
    selectedParams.delete();
    removeFilter(key);
  };
  let timeoutId = null;
  const handleOpenChange = (open2) => {
    setOpen(open2);
    setPreviousValue(displayValue);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!open2 && !currentValue.length) {
      timeoutId = setTimeout(() => {
        removeFilter(key);
      }, 200);
    }
  };
  return /* @__PURE__ */ jsxs2(RadixPopover2.Root, { modal: true, open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsx2(
      filter_chip_default,
      {
        hadPreviousValue: !!previousValue,
        label,
        value: displayValue,
        onRemove: handleRemove,
        readonly
      }
    ),
    !readonly && /* @__PURE__ */ jsx2(RadixPopover2.Portal, { children: /* @__PURE__ */ jsxs2(
      RadixPopover2.Content,
      {
        "data-name": "date_filter_content",
        align: "start",
        sideOffset: 8,
        collisionPadding: 24,
        className: clx2(
          "bg-ui-bg-base text-ui-fg-base shadow-elevation-flyout h-full max-h-[var(--radix-popper-available-height)] w-[300px] overflow-auto rounded-lg"
        ),
        onInteractOutside: (e) => {
          if (e.target instanceof HTMLElement) {
            if (e.target.attributes.getNamedItem("data-name")?.value === "filters_menu_content") {
              e.preventDefault();
            }
          }
        },
        children: [
          /* @__PURE__ */ jsxs2("ul", { className: "w-full p-1", children: [
            presets.map((preset) => {
              const isSelected = selectedParams.get().includes(JSON.stringify(preset.value));
              return /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsxs2(
                "button",
                {
                  className: "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base data-[disabled]:text-ui-fg-disabled txt-compact-small relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors data-[disabled]:pointer-events-none",
                  type: "button",
                  onClick: () => {
                    handleSelectPreset(preset.value);
                  },
                  children: [
                    /* @__PURE__ */ jsx2(
                      "div",
                      {
                        className: clx2(
                          "transition-fg flex h-5 w-5 items-center justify-center",
                          {
                            "[&_svg]:invisible": !isSelected
                          }
                        ),
                        children: /* @__PURE__ */ jsx2(EllipseMiniSolid, {})
                      }
                    ),
                    preset.label
                  ]
                }
              ) }, preset.label);
            }),
            /* @__PURE__ */ jsx2("li", { children: /* @__PURE__ */ jsxs2(
              "button",
              {
                className: "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base data-[disabled]:text-ui-fg-disabled txt-compact-small relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors data-[disabled]:pointer-events-none",
                type: "button",
                onClick: handleSelectCustom,
                children: [
                  /* @__PURE__ */ jsx2(
                    "div",
                    {
                      className: clx2(
                        "transition-fg flex h-5 w-5 items-center justify-center",
                        {
                          "[&_svg]:invisible": !showCustom
                        }
                      ),
                      children: /* @__PURE__ */ jsx2(EllipseMiniSolid, {})
                    }
                  ),
                  t("filters.date.custom")
                ]
              }
            ) })
          ] }),
          showCustom && /* @__PURE__ */ jsxs2("div", { className: "border-t px-1 pb-3 pt-1", children: [
            /* @__PURE__ */ jsxs2("div", { children: [
              /* @__PURE__ */ jsx2("div", { className: "px-2 py-1", children: /* @__PURE__ */ jsx2(Text2, { size: "xsmall", leading: "compact", weight: "plus", children: t("filters.date.from") }) }),
              /* @__PURE__ */ jsx2("div", { className: "px-2 py-1", children: /* @__PURE__ */ jsx2(
                DatePicker,
                {
                  modal: true,
                  maxValue: customEndValue,
                  value: customStartValue,
                  onChange: (d) => handleCustomDateChange(d, "start")
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs2("div", { children: [
              /* @__PURE__ */ jsx2("div", { className: "px-2 py-1", children: /* @__PURE__ */ jsx2(Text2, { size: "xsmall", leading: "compact", weight: "plus", children: t("filters.date.to") }) }),
              /* @__PURE__ */ jsx2("div", { className: "px-2 py-1", children: /* @__PURE__ */ jsx2(
                DatePicker,
                {
                  modal: true,
                  minValue: customStartValue,
                  value: customEndValue || void 0,
                  onChange: (d) => {
                    handleCustomDateChange(d, "end");
                  }
                }
              ) })
            ] })
          ] })
        ]
      }
    ) })
  ] });
};
var today = /* @__PURE__ */ new Date();
today.setHours(0, 0, 0, 0);
var usePresets = () => {
  const { t: t2 } = useTranslation2();
  return useMemo(
    () => [
      {
        label: t2("filters.date.today"),
        value: {
          $gte: today.toISOString()
        }
      },
      {
        label: t2("filters.date.lastSevenDays"),
        value: {
          $gte: new Date(
            today.getTime() - 7 * 24 * 60 * 60 * 1e3
          ).toISOString()
          // 7 days ago
        }
      },
      {
        label: t2("filters.date.lastThirtyDays"),
        value: {
          $gte: new Date(
            today.getTime() - 30 * 24 * 60 * 60 * 1e3
          ).toISOString()
          // 30 days ago
        }
      },
      {
        label: t2("filters.date.lastNinetyDays"),
        value: {
          $gte: new Date(
            today.getTime() - 90 * 24 * 60 * 60 * 1e3
          ).toISOString()
          // 90 days ago
        }
      },
      {
        label: t2("filters.date.lastTwelveMonths"),
        value: {
          $gte: new Date(
            today.getTime() - 365 * 24 * 60 * 60 * 1e3
          ).toISOString()
          // 365 days ago
        }
      }
    ],
    [t2]
  );
};
var parseDateComparison = (value) => {
  return value?.length ? JSON.parse(value.join(",")) : null;
};
var getDateFromComparison = (comparison, key) => {
  return comparison?.[key] ? new Date(comparison[key]) : void 0;
};

// src/components/table/data-table/data-table-filter/number-filter.tsx
import { EllipseMiniSolid as EllipseMiniSolid2 } from "@medusajs/icons";
import { Input, Label, clx as clx3 } from "@medusajs/ui";
import { debounce } from "lodash";
import {
  Popover as RadixPopover3,
  RadioGroup as RadixRadioGroup
} from "radix-ui";
import { useCallback, useEffect, useState as useState2 } from "react";
import { useTranslation as useTranslation3 } from "react-i18next";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var NumberFilter = ({
  filter,
  prefix,
  readonly,
  openOnMount
}) => {
  const { t: t2 } = useTranslation3();
  const [open, setOpen] = useState2(openOnMount);
  const { key, label } = filter;
  const { removeFilter } = useDataTableFilterContext();
  const selectedParams = useSelectedParams({
    param: key,
    prefix,
    multiple: false
  });
  const currentValue = selectedParams.get();
  const [previousValue, setPreviousValue] = useState2(
    currentValue
  );
  const [operator, setOperator] = useState2(
    getOperator(currentValue)
  );
  const debouncedOnChange = useCallback(
    debounce((e, operator2) => {
      const value = e.target.value;
      const curr = JSON.parse(currentValue?.join(",") || "{}");
      const isCurrentNumber = !isNaN(Number(curr));
      const handleValue = (operator3) => {
        if (!value && isCurrentNumber) {
          selectedParams.delete();
          return;
        }
        if (curr && !value) {
          delete curr[operator3];
          selectedParams.add(JSON.stringify(curr));
          return;
        }
        if (!curr) {
          selectedParams.add(JSON.stringify({ [operator3]: value }));
          return;
        }
        selectedParams.add(JSON.stringify({ ...curr, [operator3]: value }));
      };
      switch (operator2) {
        case "eq":
          if (!value) {
            selectedParams.delete();
          } else {
            selectedParams.add(value);
          }
          break;
        case "lt":
        case "gt":
          handleValue(operator2);
          break;
      }
    }, 500),
    [selectedParams, currentValue]
  );
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);
  let timeoutId = null;
  const handleOpenChange = (open2) => {
    setOpen(open2);
    setPreviousValue(currentValue);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!open2 && !currentValue.length) {
      timeoutId = setTimeout(() => {
        removeFilter(key);
      }, 200);
    }
  };
  const handleRemove = () => {
    selectedParams.delete();
    removeFilter(key);
  };
  const operators = [
    {
      operator: "exact",
      label: t2("filters.compare.exact")
    },
    {
      operator: "range",
      label: t2("filters.compare.range")
    }
  ];
  const GT_KEY = `${key}-gt`;
  const LT_KEY = `${key}-lt`;
  const EQ_KEY = key;
  const displayValue = parseDisplayValue(currentValue, t2);
  const previousDisplayValue = parseDisplayValue(previousValue, t2);
  return /* @__PURE__ */ jsxs3(RadixPopover3.Root, { modal: true, open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsx3(
      filter_chip_default,
      {
        hasOperator: true,
        hadPreviousValue: !!previousDisplayValue,
        label,
        value: displayValue,
        onRemove: handleRemove,
        readonly
      }
    ),
    !readonly && /* @__PURE__ */ jsx3(RadixPopover3.Portal, { children: /* @__PURE__ */ jsxs3(
      RadixPopover3.Content,
      {
        "data-name": "number_filter_content",
        align: "start",
        sideOffset: 8,
        collisionPadding: 24,
        className: clx3(
          "bg-ui-bg-base text-ui-fg-base shadow-elevation-flyout max-h-[var(--radix-popper-available-height)] w-[300px] divide-y overflow-y-auto rounded-lg outline-none"
        ),
        onInteractOutside: (e) => {
          if (e.target instanceof HTMLElement) {
            if (e.target.attributes.getNamedItem("data-name")?.value === "filters_menu_content") {
              e.preventDefault();
            }
          }
        },
        children: [
          /* @__PURE__ */ jsx3("div", { className: "p-1", children: /* @__PURE__ */ jsx3(
            RadixRadioGroup.Root,
            {
              value: operator,
              onValueChange: (val) => setOperator(val),
              className: "flex flex-col items-start",
              orientation: "vertical",
              autoFocus: true,
              children: operators.map((o) => /* @__PURE__ */ jsxs3(
                RadixRadioGroup.Item,
                {
                  value: o.operator,
                  className: "txt-compact-small hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed transition-fg grid w-full grid-cols-[20px_1fr] gap-2 rounded-[4px] px-2 py-1.5 text-left outline-none",
                  children: [
                    /* @__PURE__ */ jsx3("div", { className: "size-5", children: /* @__PURE__ */ jsx3(RadixRadioGroup.Indicator, { children: /* @__PURE__ */ jsx3(EllipseMiniSolid2, {}) }) }),
                    /* @__PURE__ */ jsx3("span", { className: "w-full", children: o.label })
                  ]
                },
                o.operator
              ))
            }
          ) }),
          /* @__PURE__ */ jsx3("div", { children: operator === "range" ? /* @__PURE__ */ jsxs3("div", { className: "px-1 pb-3 pt-1", children: [
            /* @__PURE__ */ jsx3("div", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsx3(Label, { size: "xsmall", weight: "plus", htmlFor: GT_KEY, children: t2("filters.compare.greaterThan") }) }),
            /* @__PURE__ */ jsx3("div", { className: "px-2 py-0.5", children: /* @__PURE__ */ jsx3(
              Input,
              {
                name: GT_KEY,
                size: "small",
                type: "number",
                defaultValue: getValue(currentValue, "gt"),
                onChange: (e) => debouncedOnChange(e, "gt")
              }
            ) }),
            /* @__PURE__ */ jsx3("div", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsx3(Label, { size: "xsmall", weight: "plus", htmlFor: LT_KEY, children: t2("filters.compare.lessThan") }) }),
            /* @__PURE__ */ jsx3("div", { className: "px-2 py-0.5", children: /* @__PURE__ */ jsx3(
              Input,
              {
                name: LT_KEY,
                size: "small",
                type: "number",
                defaultValue: getValue(currentValue, "lt"),
                onChange: (e) => debouncedOnChange(e, "lt")
              }
            ) })
          ] }, "range") : /* @__PURE__ */ jsxs3("div", { className: "px-1 pb-3 pt-1", children: [
            /* @__PURE__ */ jsx3("div", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsx3(Label, { size: "xsmall", weight: "plus", htmlFor: EQ_KEY, children: label }) }),
            /* @__PURE__ */ jsx3("div", { className: "px-2 py-0.5", children: /* @__PURE__ */ jsx3(
              Input,
              {
                name: EQ_KEY,
                size: "small",
                type: "number",
                defaultValue: getValue(currentValue, "eq"),
                onChange: (e) => debouncedOnChange(e, "eq")
              }
            ) })
          ] }, "exact") })
        ]
      }
    ) })
  ] });
};
var parseDisplayValue = (value, t2) => {
  const parsed = JSON.parse(value?.join(",") || "{}");
  let displayValue = "";
  if (typeof parsed === "object") {
    const parts = [];
    if (parsed.gt) {
      parts.push(t2("filters.compare.greaterThanLabel", { value: parsed.gt }));
    }
    if (parsed.lt) {
      parts.push(
        t2("filters.compare.lessThanLabel", {
          value: parsed.lt
        })
      );
    }
    displayValue = parts.join(` ${t2("filters.compare.andLabel")} `);
  }
  if (typeof parsed === "number") {
    displayValue = parsed.toString();
  }
  return displayValue;
};
var parseValue = (value) => {
  if (!value) {
    return void 0;
  }
  const val = value.join(",");
  if (!val) {
    return void 0;
  }
  return JSON.parse(val);
};
var getValue = (value, key) => {
  const parsed = parseValue(value);
  if (typeof parsed === "object") {
    return parsed[key];
  }
  if (typeof parsed === "number" && key === "eq") {
    return parsed;
  }
  return void 0;
};
var getOperator = (value) => {
  const parsed = parseValue(value);
  return typeof parsed === "object" ? "range" : "exact";
};

// src/components/table/data-table/data-table-filter/select-filter.tsx
import { CheckMini, EllipseMiniSolid as EllipseMiniSolid3, XMarkMini as XMarkMini2 } from "@medusajs/icons";
import { clx as clx4 } from "@medusajs/ui";
import { Command } from "cmdk";
import { Popover as RadixPopover4 } from "radix-ui";
import { useState as useState3 } from "react";
import { useTranslation as useTranslation4 } from "react-i18next";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var SelectFilter = ({
  filter,
  prefix,
  readonly,
  multiple,
  searchable,
  options,
  openOnMount
}) => {
  const [open, setOpen] = useState3(openOnMount);
  const [search, setSearch] = useState3("");
  const [searchRef, setSearchRef] = useState3(null);
  const { t: t2 } = useTranslation4();
  const { removeFilter } = useDataTableFilterContext();
  const { key, label } = filter;
  const selectedParams = useSelectedParams({ param: key, prefix, multiple });
  const currentValue = selectedParams.get();
  const labelValues = currentValue.map((v) => options.find((o) => o.value === v)?.label).filter(Boolean);
  const [previousValue, setPreviousValue] = useState3(labelValues);
  const handleRemove = () => {
    selectedParams.delete();
    removeFilter(key);
  };
  let timeoutId = null;
  const handleOpenChange = (open2) => {
    setOpen(open2);
    setPreviousValue(labelValues);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!open2 && !currentValue.length) {
      timeoutId = setTimeout(() => {
        removeFilter(key);
      }, 200);
    }
  };
  const handleClearSearch = () => {
    setSearch("");
    if (searchRef) {
      searchRef.focus();
    }
  };
  const handleSelect = (value) => {
    const isSelected = selectedParams.get().includes(String(value));
    if (isSelected) {
      selectedParams.delete(String(value));
    } else {
      selectedParams.add(String(value));
    }
  };
  const normalizedValues = labelValues ? Array.isArray(labelValues) ? labelValues : [labelValues] : null;
  const normalizedPrev = previousValue ? Array.isArray(previousValue) ? previousValue : [previousValue] : null;
  return /* @__PURE__ */ jsxs4(RadixPopover4.Root, { modal: true, open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsx4(
      filter_chip_default,
      {
        hasOperator: true,
        hadPreviousValue: !!normalizedPrev?.length,
        readonly,
        label,
        value: normalizedValues?.join(", "),
        onRemove: handleRemove
      }
    ),
    !readonly && /* @__PURE__ */ jsx4(RadixPopover4.Portal, { children: /* @__PURE__ */ jsx4(
      RadixPopover4.Content,
      {
        hideWhenDetached: true,
        align: "start",
        sideOffset: 8,
        collisionPadding: 8,
        className: clx4(
          "bg-ui-bg-base text-ui-fg-base shadow-elevation-flyout z-[1] h-full max-h-[200px] w-[300px] overflow-hidden rounded-lg outline-none"
        ),
        onInteractOutside: (e) => {
          if (e.target instanceof HTMLElement) {
            if (e.target.attributes.getNamedItem("data-name")?.value === "filters_menu_content") {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        },
        children: /* @__PURE__ */ jsxs4(Command, { className: "h-full", children: [
          searchable && /* @__PURE__ */ jsx4("div", { className: "border-b p-1", children: /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-[1fr_20px] gap-x-2 rounded-md px-2 py-1", children: [
            /* @__PURE__ */ jsx4(
              Command.Input,
              {
                ref: setSearchRef,
                value: search,
                onValueChange: setSearch,
                className: "txt-compact-small placeholder:text-ui-fg-muted bg-transparent outline-none",
                placeholder: "Search"
              }
            ),
            /* @__PURE__ */ jsx4("div", { className: "flex h-5 w-5 items-center justify-center", children: /* @__PURE__ */ jsx4(
              "button",
              {
                disabled: !search,
                onClick: handleClearSearch,
                className: clx4(
                  "transition-fg text-ui-fg-muted focus-visible:bg-ui-bg-base-pressed rounded-md outline-none",
                  {
                    invisible: !search
                  }
                ),
                children: /* @__PURE__ */ jsx4(XMarkMini2, {})
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsx4(Command.Empty, { className: "txt-compact-small flex items-center justify-center p-1", children: /* @__PURE__ */ jsx4("span", { className: "w-full px-2 py-1 text-center", children: t2("general.noResultsTitle") }) }),
          /* @__PURE__ */ jsx4(Command.List, { className: "h-full max-h-[163px] min-h-[0] overflow-auto p-1 outline-none", children: options.map((option) => {
            const isSelected = selectedParams.get().includes(String(option.value));
            return /* @__PURE__ */ jsxs4(
              Command.Item,
              {
                className: "bg-ui-bg-base hover:bg-ui-bg-base-hover aria-selected:bg-ui-bg-base-pressed focus-visible:bg-ui-bg-base-pressed text-ui-fg-base data-[disabled]:text-ui-fg-disabled txt-compact-small relative flex cursor-pointer select-none items-center gap-x-2 rounded-md px-2 py-1.5 outline-none transition-colors data-[disabled]:pointer-events-none",
                value: option.label,
                onSelect: () => {
                  handleSelect(option.value);
                },
                children: [
                  /* @__PURE__ */ jsx4(
                    "div",
                    {
                      className: clx4(
                        "transition-fg flex h-5 w-5 items-center justify-center",
                        {
                          "[&_svg]:invisible": !isSelected
                        }
                      ),
                      children: multiple ? /* @__PURE__ */ jsx4(CheckMini, {}) : /* @__PURE__ */ jsx4(EllipseMiniSolid3, {})
                    }
                  ),
                  option.label
                ]
              },
              String(option.value)
            );
          }) })
        ] })
      }
    ) })
  ] });
};

// src/components/table/data-table/data-table-filter/string-filter.tsx
import { Input as Input2, Label as Label2, clx as clx5 } from "@medusajs/ui";
import { debounce as debounce2 } from "lodash";
import { Popover as RadixPopover5 } from "radix-ui";
import { useCallback as useCallback2, useEffect as useEffect2, useState as useState4 } from "react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var StringFilter = ({
  filter,
  prefix,
  readonly,
  openOnMount
}) => {
  const [open, setOpen] = useState4(openOnMount);
  const { key, label } = filter;
  const { removeFilter } = useDataTableFilterContext();
  const selectedParams = useSelectedParams({ param: key, prefix });
  const query = selectedParams.get();
  const [previousValue, setPreviousValue] = useState4(
    query?.[0]
  );
  const debouncedOnChange = useCallback2(
    debounce2((e) => {
      const value = e.target.value;
      if (!value) {
        selectedParams.delete();
      } else {
        selectedParams.add(value);
      }
    }, 500),
    [selectedParams]
  );
  useEffect2(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);
  let timeoutId = null;
  const handleOpenChange = (open2) => {
    setOpen(open2);
    setPreviousValue(query?.[0]);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!open2 && !query.length) {
      timeoutId = setTimeout(() => {
        removeFilter(key);
      }, 200);
    }
  };
  const handleRemove = () => {
    selectedParams.delete();
    removeFilter(key);
  };
  return /* @__PURE__ */ jsxs5(RadixPopover5.Root, { modal: true, open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsx5(
      filter_chip_default,
      {
        hasOperator: true,
        hadPreviousValue: !!previousValue,
        label,
        value: query?.[0],
        onRemove: handleRemove,
        readonly
      }
    ),
    !readonly && /* @__PURE__ */ jsx5(RadixPopover5.Portal, { children: /* @__PURE__ */ jsx5(
      RadixPopover5.Content,
      {
        hideWhenDetached: true,
        align: "start",
        sideOffset: 8,
        collisionPadding: 8,
        className: clx5(
          "bg-ui-bg-base text-ui-fg-base shadow-elevation-flyout z-[1] h-full max-h-[200px] w-[300px] overflow-hidden rounded-lg outline-none"
        ),
        onInteractOutside: (e) => {
          if (e.target instanceof HTMLElement) {
            if (e.target.attributes.getNamedItem("data-name")?.value === "filters_menu_content") {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        },
        children: /* @__PURE__ */ jsxs5("div", { className: "px-1 pb-3 pt-1", children: [
          /* @__PURE__ */ jsx5("div", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsx5(Label2, { size: "xsmall", weight: "plus", htmlFor: key, children: label }) }),
          /* @__PURE__ */ jsx5("div", { className: "px-2 py-0.5", children: /* @__PURE__ */ jsx5(
            Input2,
            {
              name: key,
              size: "small",
              defaultValue: query?.[0] || void 0,
              onChange: debouncedOnChange
            }
          ) })
        ] })
      }
    ) })
  ] });
};

// src/components/table/data-table/data-table-filter/data-table-filter.tsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var DataTableFilter = ({
  filters,
  readonly,
  prefix
}) => {
  const { t: t2 } = useTranslation5();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState5(false);
  const [activeFilters, setActiveFilters] = useState5(
    getInitialFilters({ searchParams, filters, prefix })
  );
  const availableFilters = filters.filter(
    (f) => !activeFilters.find((af) => af.key === f.key)
  );
  const initialMount = useRef(true);
  useEffect3(() => {
    if (initialMount.current) {
      const params = new URLSearchParams(searchParams);
      filters.forEach((filter) => {
        const key = prefix ? `${prefix}_${filter.key}` : filter.key;
        const value = params.get(key);
        if (value && !activeFilters.find((af) => af.key === filter.key)) {
          if (filter.type === "select") {
            setActiveFilters((prev) => [
              ...prev,
              {
                ...filter,
                multiple: filter.multiple,
                options: filter.options,
                openOnMount: false
              }
            ]);
          } else {
            setActiveFilters((prev) => [
              ...prev,
              { ...filter, openOnMount: false }
            ]);
          }
        }
      });
    }
    initialMount.current = false;
  }, [activeFilters, filters, prefix, searchParams]);
  const addFilter = (filter) => {
    setOpen(false);
    setActiveFilters((prev) => [...prev, { ...filter, openOnMount: true }]);
  };
  const removeFilter = useCallback3((key) => {
    setActiveFilters((prev) => prev.filter((f) => f.key !== key));
  }, []);
  const removeAllFilters = useCallback3(() => {
    setActiveFilters([]);
  }, []);
  return /* @__PURE__ */ jsx6(
    DataTableFilterContext.Provider,
    {
      value: useMemo2(
        () => ({
          removeFilter,
          removeAllFilters
        }),
        [removeAllFilters, removeFilter]
      ),
      children: /* @__PURE__ */ jsxs6("div", { className: "max-w-2/3 flex flex-wrap items-center gap-2", children: [
        activeFilters.map((filter) => {
          switch (filter.type) {
            case "select":
              return /* @__PURE__ */ jsx6(
                SelectFilter,
                {
                  filter,
                  prefix,
                  readonly,
                  options: filter.options,
                  multiple: filter.multiple,
                  searchable: filter.searchable,
                  openOnMount: filter.openOnMount
                },
                filter.key
              );
            case "date":
              return /* @__PURE__ */ jsx6(
                DateFilter,
                {
                  filter,
                  prefix,
                  readonly,
                  openOnMount: filter.openOnMount
                },
                filter.key
              );
            case "string":
              return /* @__PURE__ */ jsx6(
                StringFilter,
                {
                  filter,
                  prefix,
                  readonly,
                  openOnMount: filter.openOnMount
                },
                filter.key
              );
            case "number":
              return /* @__PURE__ */ jsx6(
                NumberFilter,
                {
                  filter,
                  prefix,
                  readonly,
                  openOnMount: filter.openOnMount
                },
                filter.key
              );
            default:
              break;
          }
        }),
        !readonly && availableFilters.length > 0 && /* @__PURE__ */ jsxs6(RadixPopover6.Root, { modal: true, open, onOpenChange: setOpen, children: [
          /* @__PURE__ */ jsx6(RadixPopover6.Trigger, { asChild: true, id: "filters_menu_trigger", children: /* @__PURE__ */ jsx6(Button, { size: "small", variant: "secondary", children: t2("filters.addFilter") }) }),
          /* @__PURE__ */ jsx6(RadixPopover6.Portal, { children: /* @__PURE__ */ jsx6(
            RadixPopover6.Content,
            {
              className: clx6(
                "bg-ui-bg-base text-ui-fg-base shadow-elevation-flyout z-[1] h-full max-h-[200px] w-[300px] overflow-auto rounded-lg p-1 outline-none"
              ),
              "data-name": "filters_menu_content",
              align: "start",
              sideOffset: 8,
              collisionPadding: 8,
              onCloseAutoFocus: (e) => {
                const hasOpenFilter = activeFilters.find(
                  (filter) => filter.openOnMount
                );
                if (hasOpenFilter) {
                  e.preventDefault();
                }
              },
              children: availableFilters.map((filter) => {
                return /* @__PURE__ */ jsx6(
                  "div",
                  {
                    className: "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base data-[disabled]:text-ui-fg-disabled txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors data-[disabled]:pointer-events-none",
                    role: "menuitem",
                    onClick: () => {
                      addFilter(filter);
                    },
                    children: filter.label
                  },
                  filter.key
                );
              })
            }
          ) })
        ] }),
        !readonly && activeFilters.length > 0 && /* @__PURE__ */ jsx6(ClearAllFilters, { filters, prefix })
      ] })
    }
  );
};
var ClearAllFilters = ({ filters, prefix }) => {
  const { removeAllFilters } = useDataTableFilterContext();
  const [_, setSearchParams] = useSearchParams();
  const handleRemoveAll = () => {
    setSearchParams((prev) => {
      const newValues = new URLSearchParams(prev);
      filters.forEach((filter) => {
        newValues.delete(prefix ? `${prefix}_${filter.key}` : filter.key);
      });
      return newValues;
    });
    removeAllFilters();
  };
  return /* @__PURE__ */ jsx6(
    "button",
    {
      type: "button",
      onClick: handleRemoveAll,
      className: clx6(
        "text-ui-fg-muted transition-fg txt-compact-small-plus rounded-md px-2 py-1",
        "hover:text-ui-fg-subtle",
        "focus-visible:shadow-borders-focus"
      ),
      children: "Clear all"
    }
  );
};
var getInitialFilters = ({
  searchParams,
  filters,
  prefix
}) => {
  const params = new URLSearchParams(searchParams);
  const activeFilters = [];
  filters.forEach((filter) => {
    const key = prefix ? `${prefix}_${filter.key}` : filter.key;
    const value = params.get(key);
    if (value) {
      if (filter.type === "select") {
        activeFilters.push({
          ...filter,
          multiple: filter.multiple,
          options: filter.options,
          openOnMount: false
        });
      } else {
        activeFilters.push({ ...filter, openOnMount: false });
      }
    }
  });
  return activeFilters;
};

export {
  DataTableFilter
};
