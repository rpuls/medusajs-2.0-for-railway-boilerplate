import {
  useSalesChannels
} from "./chunk-GX3K52WA.mjs";
import {
  useRegions
} from "./chunk-SY6HAFQV.mjs";

// src/hooks/table/filters/use-order-table-filters.tsx
import { useTranslation } from "react-i18next";
var useOrderTableFilters = () => {
  const { t } = useTranslation();
  const { regions } = useRegions({
    limit: 1e3,
    fields: "id,name"
  });
  const { sales_channels } = useSalesChannels({
    limit: 1e3,
    fields: "id,name"
  });
  let filters = [];
  if (regions) {
    const regionFilter = {
      key: "region_id",
      label: t("fields.region"),
      type: "select",
      options: regions.map((r) => ({
        label: r.name,
        value: r.id
      })),
      multiple: true,
      searchable: true
    };
    filters = [...filters, regionFilter];
  }
  if (sales_channels) {
    const salesChannelFilter = {
      key: "sales_channel_id",
      label: t("fields.salesChannel"),
      type: "select",
      multiple: true,
      searchable: true,
      options: sales_channels.map((s) => ({
        label: s.name,
        value: s.id
      }))
    };
    filters = [...filters, salesChannelFilter];
  }
  const paymentStatusFilter = {
    key: "payment_status",
    label: t("orders.payment.statusLabel"),
    type: "select",
    multiple: true,
    options: [
      {
        label: t("orders.payment.status.notPaid"),
        value: "not_paid"
      },
      {
        label: t("orders.payment.status.awaiting"),
        value: "awaiting"
      },
      {
        label: t("orders.payment.status.captured"),
        value: "captured"
      },
      {
        label: t("orders.payment.status.refunded"),
        value: "refunded"
      },
      {
        label: t("orders.payment.status.partiallyRefunded"),
        value: "partially_refunded"
      },
      {
        label: t("orders.payment.status.canceled"),
        value: "canceled"
      },
      {
        label: t("orders.payment.status.requiresAction"),
        value: "requires_action"
      }
    ]
  };
  const fulfillmentStatusFilter = {
    key: "fulfillment_status",
    label: t("orders.fulfillment.statusLabel"),
    type: "select",
    multiple: true,
    options: [
      {
        label: t("orders.fulfillment.status.notFulfilled"),
        value: "not_fulfilled"
      },
      {
        label: t("orders.fulfillment.status.fulfilled"),
        value: "fulfilled"
      },
      {
        label: t("orders.fulfillment.status.partiallyFulfilled"),
        value: "partially_fulfilled"
      },
      {
        label: t("orders.fulfillment.status.returned"),
        value: "returned"
      },
      {
        label: t("orders.fulfillment.status.partiallyReturned"),
        value: "partially_returned"
      },
      {
        label: t("orders.fulfillment.status.shipped"),
        value: "shipped"
      },
      {
        label: t("orders.fulfillment.status.partiallyShipped"),
        value: "partially_shipped"
      },
      {
        label: t("orders.fulfillment.status.canceled"),
        value: "canceled"
      },
      {
        label: t("orders.fulfillment.status.requiresAction"),
        value: "requires_action"
      }
    ]
  };
  const dateFilters = [
    { label: "Created At", key: "created_at" },
    { label: "Updated At", key: "updated_at" }
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date"
  }));
  filters = [
    ...filters,
    // TODO: enable when Payment, Fulfillments <> Orders are linked
    // paymentStatusFilter,
    // fulfillmentStatusFilter,
    ...dateFilters
  ];
  return filters;
};

export {
  useOrderTableFilters
};
