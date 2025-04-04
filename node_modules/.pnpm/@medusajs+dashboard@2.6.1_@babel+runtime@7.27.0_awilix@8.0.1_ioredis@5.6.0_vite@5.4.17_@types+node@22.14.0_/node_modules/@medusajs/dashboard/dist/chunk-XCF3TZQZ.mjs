import {
  ordersQueryKeys
} from "./chunk-6EJHOUIV.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/product-variants.tsx
import { useQuery } from "@tanstack/react-query";
var PRODUCT_VARIANT_QUERY_KEY = "product_variant";
var productVariantQueryKeys = queryKeysFactory(
  PRODUCT_VARIANT_QUERY_KEY
);
var useVariants = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.productVariant.list(query),
    queryKey: productVariantQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};

// src/hooks/api/refund-reasons.tsx
import { useQuery as useQuery2 } from "@tanstack/react-query";
var REFUND_REASON_QUERY_KEY = "refund-reason";
var refundReasonQueryKeys = queryKeysFactory(REFUND_REASON_QUERY_KEY);
var useRefundReasons = (query, options) => {
  const { data, ...rest } = useQuery2({
    queryFn: () => sdk.admin.refundReason.list(query),
    queryKey: [],
    ...options
  });
  return { ...data, ...rest };
};

// src/hooks/api/tags.tsx
import {
  useMutation,
  useQuery as useQuery3
} from "@tanstack/react-query";
var TAGS_QUERY_KEY = "tags";
var productTagsQueryKeys = queryKeysFactory(TAGS_QUERY_KEY);
var useProductTag = (id, query, options) => {
  const { data, ...rest } = useQuery3({
    queryKey: productTagsQueryKeys.detail(id, query),
    queryFn: async () => sdk.admin.productTag.retrieve(id),
    ...options
  });
  return { ...data, ...rest };
};
var useProductTags = (query, options) => {
  const { data, ...rest } = useQuery3({
    queryKey: productTagsQueryKeys.list(query),
    queryFn: async () => sdk.admin.productTag.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateProductTag = (query, options) => {
  return useMutation({
    mutationFn: async (data) => sdk.admin.productTag.create(data, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: productTagsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateProductTag = (id, query, options) => {
  return useMutation({
    mutationFn: async (data) => sdk.admin.productTag.update(id, data, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: productTagsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: productTagsQueryKeys.detail(data.product_tag.id, query)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteProductTag = (id, options) => {
  return useMutation({
    mutationFn: async () => sdk.admin.productTag.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: productTagsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: productTagsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// src/hooks/api/fulfillment.tsx
import { useMutation as useMutation2 } from "@tanstack/react-query";
var FULFILLMENTS_QUERY_KEY = "fulfillments";
var fulfillmentsQueryKeys = queryKeysFactory(FULFILLMENTS_QUERY_KEY);

// src/hooks/api/notification.tsx
import { useQuery as useQuery4 } from "@tanstack/react-query";
var NOTIFICATION_QUERY_KEY = "notification";
var notificationQueryKeys = queryKeysFactory(NOTIFICATION_QUERY_KEY);
var useNotifications = (query, options) => {
  const { data, ...rest } = useQuery4({
    queryFn: () => sdk.admin.notification.list(query),
    queryKey: notificationQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};

// src/hooks/api/payment-collections.tsx
import { useMutation as useMutation3 } from "@tanstack/react-query";
var PAYMENT_COLLECTION_QUERY_KEY = "payment-collection";
var paymentCollectionQueryKeys = queryKeysFactory(
  PAYMENT_COLLECTION_QUERY_KEY
);
var useMarkPaymentCollectionAsPaid = (orderId, paymentCollectionId, options) => {
  return useMutation3({
    mutationFn: (payload) => sdk.admin.paymentCollection.markAsPaid(paymentCollectionId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: paymentCollectionQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  notificationQueryKeys,
  useNotifications,
  useMarkPaymentCollectionAsPaid,
  productVariantQueryKeys,
  useVariants,
  useRefundReasons,
  productTagsQueryKeys,
  useProductTag,
  useProductTags,
  useCreateProductTag,
  useUpdateProductTag,
  useDeleteProductTag
};
