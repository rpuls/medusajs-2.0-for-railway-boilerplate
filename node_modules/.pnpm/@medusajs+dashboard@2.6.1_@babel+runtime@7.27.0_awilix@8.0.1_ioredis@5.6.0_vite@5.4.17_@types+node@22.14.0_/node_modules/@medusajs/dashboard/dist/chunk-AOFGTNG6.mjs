// src/components/table/data-table/data-table-order-by/data-table-order-by.tsx
import { DescendingSorting } from "@medusajs/icons";
import { DropdownMenu, IconButton } from "@medusajs/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var initState = (params, prefix) => {
  const param = prefix ? `${prefix}_order` : "order";
  const sortParam = params.get(param);
  if (!sortParam) {
    return {
      dir: "asc" /* ASC */
    };
  }
  const dir = sortParam.startsWith("-") ? "desc" /* DESC */ : "asc" /* ASC */;
  const key = sortParam.replace("-", "");
  return {
    key,
    dir
  };
};
var DataTableOrderBy = ({
  keys,
  prefix
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState(initState(searchParams, prefix));
  const param = prefix ? `${prefix}_order` : "order";
  const { t } = useTranslation();
  const handleDirChange = (dir) => {
    setState((prev) => ({
      ...prev,
      dir
    }));
    updateOrderParam({
      key: state.key,
      dir
    });
  };
  const handleKeyChange = (value) => {
    setState((prev) => ({
      ...prev,
      key: value
    }));
    updateOrderParam({
      key: value,
      dir: state.dir
    });
  };
  const updateOrderParam = (state2) => {
    if (!state2.key) {
      setSearchParams((prev) => {
        prev.delete(param);
        return prev;
      });
      return;
    }
    const orderParam = state2.dir === "asc" /* ASC */ ? state2.key : `-${state2.key}`;
    setSearchParams((prev) => {
      prev.set(param, orderParam);
      return prev;
    });
  };
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenu.Trigger, { asChild: true, children: /* @__PURE__ */ jsx(IconButton, { size: "small", children: /* @__PURE__ */ jsx(DescendingSorting, {}) }) }),
    /* @__PURE__ */ jsxs(DropdownMenu.Content, { className: "z-[1]", align: "end", children: [
      /* @__PURE__ */ jsx(
        DropdownMenu.RadioGroup,
        {
          value: state.key,
          onValueChange: handleKeyChange,
          children: keys.map((key) => {
            const stringKey = String(key.key);
            return /* @__PURE__ */ jsx(
              DropdownMenu.RadioItem,
              {
                value: stringKey,
                onSelect: (event) => event.preventDefault(),
                children: key.label
              },
              stringKey
            );
          })
        }
      ),
      /* @__PURE__ */ jsx(DropdownMenu.Separator, {}),
      /* @__PURE__ */ jsxs(
        DropdownMenu.RadioGroup,
        {
          value: state.dir,
          onValueChange: handleDirChange,
          children: [
            /* @__PURE__ */ jsxs(
              DropdownMenu.RadioItem,
              {
                className: "flex items-center justify-between",
                value: "asc",
                onSelect: (event) => event.preventDefault(),
                children: [
                  t("general.ascending"),
                  /* @__PURE__ */ jsx(DropdownMenu.Label, { children: "1 - 30" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              DropdownMenu.RadioItem,
              {
                className: "flex items-center justify-between",
                value: "desc",
                onSelect: (event) => event.preventDefault(),
                children: [
                  t("general.descending"),
                  /* @__PURE__ */ jsx(DropdownMenu.Label, { children: "30 - 1" })
                ]
              }
            )
          ]
        }
      )
    ] })
  ] });
};

export {
  DataTableOrderBy
};
