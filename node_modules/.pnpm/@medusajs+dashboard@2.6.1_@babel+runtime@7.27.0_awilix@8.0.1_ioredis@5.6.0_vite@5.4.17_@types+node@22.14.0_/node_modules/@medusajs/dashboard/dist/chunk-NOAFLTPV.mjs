import {
  useQueryParams
} from "./chunk-C76H5USB.mjs";

// src/routes/regions/common/hooks/use-countries.tsx
import { json } from "react-router-dom";
var acceptedOrderKeys = ["name", "code"];
var useCountries = ({
  countries,
  q,
  order = "name",
  limit,
  offset = 0
}) => {
  const data = countries.slice(offset, offset + limit);
  if (order) {
    const direction = order.startsWith("-") ? -1 : 1;
    const key = order.replace("-", "");
    if (!acceptedOrderKeys.includes(key)) {
      console.log("The key ${key} is not a valid order key");
      throw json(`The key ${key} is not a valid order key`, 500);
    }
    const sortKey = key === "code" ? "iso_2" : "name";
    data.sort((a, b) => {
      if (a[sortKey] === null && b[sortKey] === null) {
        return 0;
      }
      if (a[sortKey] === null) {
        return direction;
      }
      if (b[sortKey] === null) {
        return -direction;
      }
      return a[sortKey] > b[sortKey] ? direction : -direction;
    });
  }
  if (q) {
    const query = q.toLowerCase();
    const results = countries.filter(
      (c) => c.name.toLowerCase().includes(query) || c.iso_2.toLowerCase().includes(query)
    );
    return {
      countries: results,
      count: results.length
    };
  }
  return {
    countries: data,
    count: countries.length
  };
};

// src/routes/regions/common/hooks/use-country-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useCountryTableColumns = () => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      columnHelper.accessor("display_name", {
        header: t("fields.name"),
        cell: ({ getValue }) => getValue()
      }),
      columnHelper.accessor("iso_2", {
        header: t("fields.code"),
        cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "uppercase", children: getValue() })
      })
    ],
    [t]
  );
};

// src/routes/regions/common/hooks/use-country-table-query.tsx
var useCountryTableQuery = ({
  pageSize,
  prefix
}) => {
  const raw = useQueryParams(["order", "q", "offset"], prefix);
  const { offset, order, q } = raw;
  const searchParams = {
    limit: pageSize,
    offset: offset ? parseInt(offset, 10) : 0,
    order,
    q
  };
  return {
    searchParams,
    raw
  };
};

export {
  useCountries,
  useCountryTableColumns,
  useCountryTableQuery
};
