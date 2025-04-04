import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/inventory.tsx
import {
  useMutation as useMutation2,
  useQuery as useQuery2
} from "@tanstack/react-query";

// src/hooks/api/products.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var PRODUCTS_QUERY_KEY = "products";
var productsQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY);
var VARIANTS_QUERY_KEY = "product_variants";
var variantsQueryKeys = queryKeysFactory(VARIANTS_QUERY_KEY);
var OPTIONS_QUERY_KEY = "product_options";
var optionsQueryKeys = queryKeysFactory(OPTIONS_QUERY_KEY);
var useCreateProductOption = (productId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.createOption(productId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: optionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateProductOption = (productId, optionId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.updateOption(productId, optionId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: optionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: optionsQueryKeys.detail(optionId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteProductOption = (productId, optionId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.product.deleteOption(productId, optionId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: optionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: optionsQueryKeys.detail(optionId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useProductVariant = (productId, variantId, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.retrieveVariant(productId, variantId, query),
    queryKey: variantsQueryKeys.detail(variantId, query),
    ...options
  });
  return { ...data, ...rest };
};
var useProductVariants = (productId, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.listVariants(productId, query),
    queryKey: variantsQueryKeys.list({ productId, ...query }),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateProductVariant = (productId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.createVariant(productId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateProductVariant = (productId, variantId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.updateVariant(productId, variantId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.detail(variantId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateProductVariantsBatch = (productId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.batchVariants(productId, {
      update: payload
    }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.details() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useProductVariantsInventoryItemsBatch = (productId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.batchVariantInventoryItems(productId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.details() });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteVariant = (productId, variantId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.product.deleteVariant(productId, variantId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.detail(variantId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteVariantLazy = (productId, options) => {
  return useMutation({
    mutationFn: ({ variantId }) => sdk.admin.product.deleteVariant(productId, variantId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: variantsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.detail(variables.variantId)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(productId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useProduct = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.retrieve(id, query),
    queryKey: productsQueryKeys.detail(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useProducts = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.product.list(query),
    queryKey: productsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateProduct = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateProduct = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.update(id, payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists()
      });
      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteProduct = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.product.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useExportProducts = (query, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.export(payload, query),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useImportProducts = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.import(payload),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useConfirmImportProducts = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.product.confirmImport(payload),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// src/hooks/api/inventory.tsx
var INVENTORY_ITEMS_QUERY_KEY = "inventory_items";
var inventoryItemsQueryKeys = queryKeysFactory(
  INVENTORY_ITEMS_QUERY_KEY
);
var INVENTORY_ITEM_LEVELS_QUERY_KEY = "inventory_item_levels";
var inventoryItemLevelsQueryKeys = queryKeysFactory(
  INVENTORY_ITEM_LEVELS_QUERY_KEY
);
var useInventoryItems = (query, options) => {
  const { data, ...rest } = useQuery2({
    queryFn: () => sdk.admin.inventoryItem.list(query),
    queryKey: inventoryItemsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useInventoryItem = (id, query, options) => {
  const { data, ...rest } = useQuery2({
    queryFn: () => sdk.admin.inventoryItem.retrieve(id, query),
    queryKey: inventoryItemsQueryKeys.detail(id),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateInventoryItem = (options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.inventoryItem.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateInventoryItem = (id, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.inventoryItem.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteInventoryItem = (id, options) => {
  return useMutation2({
    mutationFn: () => sdk.admin.inventoryItem.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteInventoryItemLevel = (inventoryItemId, locationId, options) => {
  return useMutation2({
    mutationFn: () => sdk.admin.inventoryItem.deleteLevel(inventoryItemId, locationId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.detail(inventoryItemId)
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.detail(inventoryItemId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useInventoryItemLevels = (inventoryItemId, query, options) => {
  const { data, ...rest } = useQuery2({
    queryFn: () => sdk.admin.inventoryItem.listLevels(inventoryItemId, query),
    queryKey: inventoryItemLevelsQueryKeys.detail(inventoryItemId),
    ...options
  });
  return { ...data, ...rest };
};
var useUpdateInventoryLevel = (inventoryItemId, locationId, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.inventoryItem.updateLevel(inventoryItemId, locationId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.detail(inventoryItemId)
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.detail(inventoryItemId)
      });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useBatchInventoryItemLocationLevels = (inventoryItemId, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.inventoryItem.batchInventoryItemLocationLevels(
      inventoryItemId,
      payload
    ),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.detail(inventoryItemId)
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.detail(inventoryItemId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useBatchInventoryItemsLocationLevels = (options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.inventoryItem.batchInventoryItemsLocationLevels(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.all
      });
      queryClient.invalidateQueries({
        queryKey: variantsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  inventoryItemsQueryKeys,
  inventoryItemLevelsQueryKeys,
  useInventoryItems,
  useInventoryItem,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useDeleteInventoryItemLevel,
  useInventoryItemLevels,
  useUpdateInventoryLevel,
  useBatchInventoryItemLocationLevels,
  useBatchInventoryItemsLocationLevels,
  productsQueryKeys,
  variantsQueryKeys,
  useCreateProductOption,
  useUpdateProductOption,
  useDeleteProductOption,
  useProductVariant,
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useUpdateProductVariantsBatch,
  useProductVariantsInventoryItemsBatch,
  useDeleteVariant,
  useDeleteVariantLazy,
  useProduct,
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useExportProducts,
  useImportProducts,
  useConfirmImportProducts
};
