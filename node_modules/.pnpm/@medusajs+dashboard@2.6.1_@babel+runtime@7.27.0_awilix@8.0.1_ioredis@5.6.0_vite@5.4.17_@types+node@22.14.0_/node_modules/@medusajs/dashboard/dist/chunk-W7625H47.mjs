// src/hooks/table/filters/use-date-table-filters.tsx
import { useTranslation } from "react-i18next";
var useDateTableFilters = () => {
  const { t } = useTranslation();
  const dateFilters = [
    { label: t("fields.createdAt"), key: "created_at" },
    { label: t("fields.updatedAt"), key: "updated_at" }
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date"
  }));
  return dateFilters;
};

export {
  useDateTableFilters
};
