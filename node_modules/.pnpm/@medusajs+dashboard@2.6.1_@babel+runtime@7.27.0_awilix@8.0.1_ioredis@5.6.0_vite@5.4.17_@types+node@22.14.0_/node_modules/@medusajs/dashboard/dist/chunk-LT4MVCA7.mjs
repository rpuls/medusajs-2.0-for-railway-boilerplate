// src/hooks/table/filters/use-region-table-filters.tsx
import { useTranslation } from "react-i18next";
var useRegionTableFilters = () => {
  const { t } = useTranslation();
  const dateFilters = [
    { label: t("fields.createdAt"), key: "created_at" },
    { label: t("fields.updatedAt"), key: "updated_at" }
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date"
  }));
  const filters = [...dateFilters];
  return filters;
};

export {
  useRegionTableFilters
};
