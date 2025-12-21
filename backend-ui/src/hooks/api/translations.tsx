import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import {
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { sdk } from "../../lib/client"
import { queryKeysFactory } from "../../lib/query-key-factory"
import { queryClient } from "../../lib/query-client"
import { productsQueryKeys, useInfiniteProducts } from "./products"
import {
  productVariantQueryKeys,
  useInfiniteVariants,
} from "./product-variants"
import { categoriesQueryKeys, useInfiniteCategories } from "./categories"
import { collectionsQueryKeys, useInfiniteCollections } from "./collections"
import { productTagsQueryKeys, useInfiniteProductTags } from "./tags"
import { productTypesQueryKeys, useInfiniteProductTypes } from "./product-types"

const TRANSLATIONS_QUERY_KEY = "translations" as const
export const translationsQueryKeys = queryKeysFactory(TRANSLATIONS_QUERY_KEY)

const TRANSLATION_SETTINGS_QUERY_KEY = "translation_settings" as const
export const translationSettingsQueryKeys = queryKeysFactory(
  TRANSLATION_SETTINGS_QUERY_KEY
)

const TRANSLATION_STATISTICS_QUERY_KEY = "translation_statistics" as const
export const translationStatisticsQueryKeys = queryKeysFactory(
  TRANSLATION_STATISTICS_QUERY_KEY
)

export const useReferenceTranslations = (
  reference: string,
  translatableFields: string[],
  referenceId?: string | string[],
  options?: Omit<
    UseInfiniteQueryOptions<any, FetchError, any, any, QueryKey, number>,
    "queryFn" | "queryKey" | "initialPageParam" | "getNextPageParam"
  >
) => {
  const referenceHookMap = new Map<
    string,
    () => Omit<UseInfiniteQueryResult<any, FetchError>, "data"> & {
      data: {
        translations: HttpTypes.AdminTranslation[]
        references: (Record<string, any> & { id: string })[]
        count: number
      }
    }
  >([
    [
      "product",
      () => {
        const fields = translatableFields.concat(["translations.*"]).join(",")

        const { data, ...rest } = useInfiniteProducts(
          { fields, id: referenceId ?? [] },
          options
        )
        const products = data?.pages.flatMap((page) => page.products) ?? []

        return {
          ...rest,
          data: {
            translations:
              products?.flatMap((product) => product.translations ?? []) ?? [],
            references: products ?? [],
            count: data?.pages[0]?.count ?? 0,
          },
        }
      },
    ],
    [
      "product_variant",
      () => {
        const fields = translatableFields.concat(["translations.*"]).join(",")

        const { data, ...rest } = useInfiniteVariants(
          { id: referenceId ?? [], fields },
          options
        )
        const variants = data?.pages.flatMap((page) => page.variants) ?? []

        return {
          ...rest,
          data: {
            translations:
              variants?.flatMap((variant) => variant.translations ?? []) ?? [],
            references: variants ?? [],
            translatableFields,
            count: data?.pages[0]?.count ?? 0,
          },
        }
      },
    ],
    [
      "product_category",
      () => {
        const fields = translatableFields.concat(["translations.*"]).join(",")

        const { data, ...rest } = useInfiniteCategories(
          { id: referenceId ?? [], fields },
          options
        )
        const categories =
          data?.pages.flatMap((page) => page.product_categories) ?? []

        return {
          ...rest,
          data: {
            translations:
              categories?.flatMap((category) => category.translations ?? []) ??
              [],
            references: categories ?? [],
            translatableFields,
            count: data?.pages[0]?.count ?? 0,
          },
        }
      },
    ],
    [
      "product_collection",
      () => {
        const fields = translatableFields.concat(["translations.*"]).join(",")

        const { data, ...rest } = useInfiniteCollections(
          { id: referenceId ?? [], fields },
          options
        )
        const collections =
          data?.pages.flatMap((page) => page.collections) ?? []

        return {
          ...rest,
          data: {
            translations:
              collections?.flatMap(
                (collection) => collection.translations ?? []
              ) ?? [],
            references: collections ?? [],
            translatableFields,
            count: data?.pages[0]?.count ?? 0,
          },
        }
      },
    ],
    [
      "product_type",
      () => {
        const fields = translatableFields.concat(["translations.*"]).join(",")

        const { data, ...rest } = useInfiniteProductTypes(
          { id: referenceId ?? [], fields },
          options
        )
        const product_types =
          data?.pages.flatMap((page) => page.product_types) ?? []

        return {
          ...rest,
          data: {
            translations:
              product_types?.flatMap((type) => type.translations ?? []) ?? [],
            references: product_types ?? [],
            count: data?.pages[0]?.count ?? 0,
            translatableFields,
          },
        }
      },
    ],
    [
      "product_tag",
      () => {
        const fields = translatableFields.concat(["translations.*"]).join(",")

        const { data, ...rest } = useInfiniteProductTags(
          { id: referenceId ?? [], fields },
          options
        )
        const product_tags =
          data?.pages.flatMap((page) => page.product_tags) ?? []

        return {
          ...rest,
          data: {
            translations:
              product_tags?.flatMap((tag) => tag.translations ?? []) ?? [],
            references: product_tags ?? [],
            translatableFields,
            count: data?.pages[0]?.count ?? 0,
          },
        }
      },
    ],
    // TODO: product option and option values
  ])
  const referenceHook = referenceHookMap.get(reference)
  if (!referenceHook) {
    throw new Error(`No hook found for reference type: ${reference}`)
  }
  const { data, ...rest } = referenceHook()
  return { ...data, ...rest }
}

export const useTranslations = (
  query?: HttpTypes.AdminTranslationsListParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminTranslationsListResponse,
      FetchError,
      HttpTypes.AdminTranslationsListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: translationsQueryKeys.list(query),
    queryFn: () => sdk.admin.translation.list(query),
    ...options,
  })

  return { ...data, ...rest }
}

const referenceInvalidationKeysMap = new Map<string, QueryKey>([
  ["product", productsQueryKeys.lists()],
  ["product_variant", productVariantQueryKeys.lists()],
  ["product_category", categoriesQueryKeys.lists()],
  ["product_collection", collectionsQueryKeys.lists()],
  ["product_type", productTypesQueryKeys.lists()],
  ["product_tag", productTagsQueryKeys.lists()],
])

export const useBatchTranslations = (
  reference: string,
  options?: UseMutationOptions<
    HttpTypes.AdminTranslationsBatchResponse,
    FetchError,
    HttpTypes.AdminBatchTranslations
  >
) => {
  const mutation = useMutation({
    mutationFn: (payload: HttpTypes.AdminBatchTranslations) =>
      sdk.admin.translation.batch(payload),
    ...options,
  })

  /**
   * Useful to call the invalidation separately from the batch request and await the refetch finishes.
   */
  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: referenceInvalidationKeysMap.get(reference),
      }),
      queryClient.invalidateQueries({
        queryKey: translationStatisticsQueryKeys.lists(),
      }),
    ])
  }

  return {
    ...mutation,
    invalidateQueries,
  }
}

export const useTranslationSettings = (
  query?: HttpTypes.AdminTranslationSettingsParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminTranslationSettingsResponse,
      FetchError,
      HttpTypes.AdminTranslationSettingsResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: translationSettingsQueryKeys.list(query),
    queryFn: () => sdk.admin.translation.settings(query),
    ...options,
  })

  return { ...data, ...rest }
}

export const useTranslationStatistics = (
  query?: HttpTypes.AdminTranslationStatisticsParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminTranslationStatisticsResponse,
      FetchError,
      HttpTypes.AdminTranslationStatisticsResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: translationStatisticsQueryKeys.list(query),
    queryFn: () => sdk.admin.translation.statistics(query),
    ...options,
  })

  return { ...data, ...rest }
}
