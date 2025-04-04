import {
  useProductTags
} from "./chunk-XCF3TZQZ.mjs";
import {
  useProductTypes
} from "./chunk-S4HBRQEC.mjs";
import {
  useSalesChannels
} from "./chunk-GX3K52WA.mjs";

// src/hooks/table/filters/use-product-table-filters.tsx
import { useTranslation } from "react-i18next";
var useProductTableFilters = (exclude) => {
  const { t } = useTranslation();
  const isProductTypeExcluded = exclude?.includes("product_types");
  const { product_types } = useProductTypes(
    {
      limit: 1e3,
      offset: 0
    },
    {
      enabled: !isProductTypeExcluded
    }
  );
  const isProductTagExcluded = exclude?.includes("product_tags");
  const { product_tags } = useProductTags({
    limit: 1e3,
    offset: 0
  });
  const isSalesChannelExcluded = exclude?.includes("sales_channel_id");
  const { sales_channels } = useSalesChannels(
    {
      limit: 1e3,
      fields: "id,name"
    },
    {
      enabled: !isSalesChannelExcluded
    }
  );
  const isCategoryExcluded = exclude?.includes("categories");
  const isCollectionExcluded = exclude?.includes("collections");
  let filters = [];
  if (product_types && !isProductTypeExcluded) {
    const typeFilter = {
      key: "type_id",
      label: t("fields.type"),
      type: "select",
      multiple: true,
      options: product_types.map((t2) => ({
        label: t2.value,
        value: t2.id
      }))
    };
    filters = [...filters, typeFilter];
  }
  if (product_tags && !isProductTagExcluded) {
    const tagFilter = {
      key: "tag_id",
      label: t("fields.tag"),
      type: "select",
      multiple: true,
      options: product_tags.map((t2) => ({
        label: t2.value,
        value: t2.id
      }))
    };
    filters = [...filters, tagFilter];
  }
  if (sales_channels) {
    const salesChannelFilter = {
      key: "sales_channel_id",
      label: t("fields.salesChannel"),
      type: "select",
      multiple: true,
      options: sales_channels.map((s) => ({
        label: s.name,
        value: s.id
      }))
    };
    filters = [...filters, salesChannelFilter];
  }
  const statusFilter = {
    key: "status",
    label: t("fields.status"),
    type: "select",
    multiple: true,
    options: [
      {
        label: t("products.productStatus.draft"),
        value: "draft"
      },
      {
        label: t("products.productStatus.proposed"),
        value: "proposed"
      },
      {
        label: t("products.productStatus.published"),
        value: "published"
      },
      {
        label: t("products.productStatus.rejected"),
        value: "rejected"
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
  filters = [...filters, statusFilter, ...dateFilters];
  return filters;
};

export {
  useProductTableFilters
};
