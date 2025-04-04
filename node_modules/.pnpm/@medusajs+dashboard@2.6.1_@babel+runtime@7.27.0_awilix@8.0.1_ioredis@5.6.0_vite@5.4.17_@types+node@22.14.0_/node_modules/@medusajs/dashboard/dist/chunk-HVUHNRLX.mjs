import {
  useCustomerGroups
} from "./chunk-S3MWIWV4.mjs";

// src/hooks/table/filters/use-customer-table-filters.tsx
import { useTranslation } from "react-i18next";
var useCustomerTableFilters = (exclude) => {
  const { t } = useTranslation();
  const isGroupsExcluded = exclude?.includes("groups");
  const { customer_groups } = useCustomerGroups(
    {
      limit: 1e3
    },
    {
      enabled: !isGroupsExcluded
    }
  );
  let filters = [];
  if (customer_groups && !isGroupsExcluded) {
    const customerGroupFilter = {
      key: "groups",
      label: t("customers.groups.label"),
      type: "select",
      multiple: true,
      options: customer_groups.map((s) => ({
        label: s.name,
        value: s.id
      }))
    };
    filters = [...filters, customerGroupFilter];
  }
  const hasAccountFilter = {
    key: "has_account",
    label: t("fields.account"),
    type: "select",
    options: [
      {
        label: t("customers.registered"),
        value: "true"
      },
      {
        label: t("customers.guest"),
        value: "false"
      }
    ]
  };
  const dateFilters = [
    { label: t("fields.createdAt"), key: "created_at" },
    { label: t("fields.updatedAt"), key: "updated_at" }
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date"
  }));
  filters = [...filters, hasAccountFilter, ...dateFilters];
  return filters;
};

export {
  useCustomerTableFilters
};
