import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/promotions.tsx
import {
  useMutation as useMutation2,
  useQuery as useQuery2
} from "@tanstack/react-query";

// src/hooks/api/campaigns.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var REGIONS_QUERY_KEY = "campaigns";
var campaignsQueryKeys = queryKeysFactory(REGIONS_QUERY_KEY);
var useCampaign = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryKey: campaignsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.campaign.retrieve(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useCampaigns = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.campaign.list(query),
    queryKey: campaignsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateCampaign = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.campaign.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateCampaign = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.campaign.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.details() });
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.details() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteCampaign = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.campaign.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.details() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddOrRemoveCampaignPromotions = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.campaign.batchPromotions(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.details() });
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// src/hooks/api/promotions.tsx
var PROMOTIONS_QUERY_KEY = "promotions";
var promotionsQueryKeys = {
  ...queryKeysFactory(PROMOTIONS_QUERY_KEY),
  // TODO: handle invalidations properly
  listRules: (id, ruleType, query) => [PROMOTIONS_QUERY_KEY, id, ruleType, query],
  listRuleAttributes: (ruleType, promotionType) => [
    PROMOTIONS_QUERY_KEY,
    ruleType,
    promotionType
  ],
  listRuleValues: (ruleType, ruleValue, query) => [PROMOTIONS_QUERY_KEY, ruleType, ruleValue, query]
};
var usePromotion = (id, options) => {
  const { data, ...rest } = useQuery2({
    queryKey: promotionsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.promotion.retrieve(id),
    ...options
  });
  return { ...data, ...rest };
};
var usePromotionRules = (id, ruleType, query, options) => {
  const { data, ...rest } = useQuery2({
    queryKey: promotionsQueryKeys.listRules(id, ruleType, query),
    queryFn: async () => sdk.admin.promotion.listRules(id, ruleType, query),
    ...options
  });
  return { ...data, ...rest };
};
var usePromotions = (query, options) => {
  const { data, ...rest } = useQuery2({
    queryKey: promotionsQueryKeys.list(query),
    queryFn: async () => sdk.admin.promotion.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var usePromotionRuleAttributes = (ruleType, promotionType, options) => {
  const { data, ...rest } = useQuery2({
    queryKey: promotionsQueryKeys.listRuleAttributes(ruleType, promotionType),
    queryFn: async () => sdk.admin.promotion.listRuleAttributes(ruleType, promotionType),
    ...options
  });
  return { ...data, ...rest };
};
var usePromotionRuleValues = (ruleType, ruleValue, query, options) => {
  const { data, ...rest } = useQuery2({
    queryKey: promotionsQueryKeys.listRuleValues(
      ruleType,
      ruleValue,
      query || {}
    ),
    queryFn: async () => sdk.admin.promotion.listRuleValues(ruleType, ruleValue, query),
    ...options
  });
  return { ...data, ...rest };
};
var useDeletePromotion = (id, options) => {
  return useMutation2({
    mutationFn: () => sdk.admin.promotion.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: promotionsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCreatePromotion = (options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.promotion.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdatePromotion = (id, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.promotion.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var usePromotionAddRules = (id, ruleType, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.promotion.addRules(id, ruleType, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var usePromotionRemoveRules = (id, ruleType, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.promotion.removeRules(id, ruleType, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var usePromotionUpdateRules = (id, ruleType, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.promotion.updateRules(id, ruleType, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: promotionsQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  promotionsQueryKeys,
  usePromotion,
  usePromotionRules,
  usePromotions,
  usePromotionRuleAttributes,
  usePromotionRuleValues,
  useDeletePromotion,
  useCreatePromotion,
  useUpdatePromotion,
  usePromotionAddRules,
  usePromotionRemoveRules,
  usePromotionUpdateRules,
  campaignsQueryKeys,
  useCampaign,
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useAddOrRemoveCampaignPromotions
};
