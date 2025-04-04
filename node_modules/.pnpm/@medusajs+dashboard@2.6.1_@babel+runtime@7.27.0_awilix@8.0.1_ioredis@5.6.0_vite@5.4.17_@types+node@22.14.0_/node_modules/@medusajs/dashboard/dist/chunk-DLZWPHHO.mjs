// src/hooks/table/filters/use-customer-group-table-filters.tsx
import { useTranslation } from "react-i18next";
var useCustomerGroupTableFilters = () => {
  const { t } = useTranslation();
  let filters = [];
  const dateFilters = [
    { label: t("fields.createdAt"), key: "created_at" },
    { label: t("fields.updatedAt"), key: "updated_at" }
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date"
  }));
  filters = [...filters, ...dateFilters];
  return filters;
};

export {
  useCustomerGroupTableFilters
};
