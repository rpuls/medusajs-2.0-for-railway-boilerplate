// src/hooks/table/filters/use-promotion-table-filters.tsx
import { useTranslation } from "react-i18next";
var usePromotionTableFilters = () => {
  const { t } = useTranslation();
  let filters = [
    { label: t("fields.createdAt"), key: "created_at", type: "date" },
    { label: t("fields.updatedAt"), key: "updated_at", type: "date" }
  ];
  return filters;
};

export {
  usePromotionTableFilters
};
