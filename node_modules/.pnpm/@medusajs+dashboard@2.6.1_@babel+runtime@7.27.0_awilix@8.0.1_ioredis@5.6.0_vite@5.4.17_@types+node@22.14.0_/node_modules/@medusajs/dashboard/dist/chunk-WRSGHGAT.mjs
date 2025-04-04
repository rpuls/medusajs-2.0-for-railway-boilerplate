import {
  useQueryParams
} from "./chunk-C76H5USB.mjs";

// src/hooks/table/query/use-customer-table-query.tsx
var useCustomerTableQuery = ({
  prefix,
  pageSize = 20
}) => {
  const queryObject = useQueryParams(
    [
      "offset",
      "q",
      "has_account",
      "groups",
      "order",
      "created_at",
      "updated_at"
    ],
    prefix
  );
  const { offset, groups, created_at, updated_at, has_account, q, order } = queryObject;
  const searchParams = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    groups: groups?.split(","),
    has_account: has_account ? has_account === "true" : void 0,
    order,
    created_at: created_at ? JSON.parse(created_at) : void 0,
    updated_at: updated_at ? JSON.parse(updated_at) : void 0,
    q
  };
  return {
    searchParams,
    raw: queryObject
  };
};

export {
  useCustomerTableQuery
};
