import { FetchError } from "@medusajs/js-sdk"
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { backendUrl } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { queryKeysFactory } from "../../lib/query-key-factory"

const BRANDS_QUERY_KEY = "brands" as const
export const brandsQueryKeys = queryKeysFactory(BRANDS_QUERY_KEY)

export interface Brand {
  id: string
  name: string
  image_url?: string | null
  product_count?: number
}

export interface BrandListResponse {
  brands: Brand[]
}

export interface BrandResponse {
  brand: Brand
}

export interface CreateBrandInput {
  name: string
  image_url?: string | null
}

export interface UpdateBrandInput {
  name?: string
  image_url?: string | null
}

export const useBrand = (
  id: string,
  options?: Omit<
    UseQueryOptions<BrandResponse, FetchError, BrandResponse, QueryKey>,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: brandsQueryKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`${backendUrl}/admin/brands/${id}`, {
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch brand")
      }
      return response.json()
    },
    ...options,
  })

  return { ...data, ...rest }
}

export const useBrands = (
  options?: Omit<
    UseQueryOptions<BrandListResponse, FetchError, BrandListResponse, QueryKey>,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: brandsQueryKeys.lists(),
    queryFn: async () => {
      const response = await fetch(`${backendUrl}/admin/brands`, {
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch brands")
      }
      return response.json()
    },
    ...options,
  })

  return { ...data, ...rest }
}

export const useCreateBrand = (
  options?: UseMutationOptions<BrandResponse, FetchError, CreateBrandInput>
) => {
  return useMutation({
    mutationFn: async (payload: CreateBrandInput) => {
      const response = await fetch(`${backendUrl}/admin/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to create brand")
      }
      return response.json()
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: brandsQueryKeys.lists() })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useUpdateBrand = (
  id: string,
  options?: UseMutationOptions<BrandResponse, FetchError, UpdateBrandInput>
) => {
  return useMutation({
    mutationFn: async (payload: UpdateBrandInput) => {
      const response = await fetch(`${backendUrl}/admin/brands/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to update brand")
      }
      return response.json()
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: brandsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: brandsQueryKeys.detail(id) })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useDeleteBrand = (
  id: string,
  options?: UseMutationOptions<void, FetchError, void>
) => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${backendUrl}/admin/brands/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to delete brand")
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: brandsQueryKeys.lists() })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

/**
 * Get brand linked to a product
 */
export const useProductBrand = (
  productId: string,
  options?: Omit<
    UseQueryOptions<BrandResponse, FetchError, BrandResponse, QueryKey>,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: ["product_brand", productId],
    queryFn: async () => {
      const response = await fetch(`${backendUrl}/admin/products/${productId}/brand`, {
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch product brand")
      }
      return response.json()
    },
    ...options,
  })

  return { ...data, ...rest }
}

/**
 * Update product brand link
 */
export const useUpdateProductBrand = (
  productId: string,
  options?: UseMutationOptions<BrandResponse, FetchError, { brand_id: string | null }>
) => {
  return useMutation({
    mutationFn: async (payload: { brand_id: string | null }) => {
      const response = await fetch(`${backendUrl}/admin/products/${productId}/brand`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to update product brand")
      }
      return response.json()
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["product_brand", productId] })
      queryClient.invalidateQueries({ queryKey: ["products", productId] })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export interface UpdateBrandProductsInput {
  add?: string[]
  remove?: string[]
}

export interface BrandProductsResponse {
  products: Array<{ id: string }>
}

export const useBrandProducts = (
  brandId: string,
  options?: Omit<
    UseQueryOptions<BrandProductsResponse, FetchError, BrandProductsResponse, QueryKey>,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: [...brandsQueryKeys.detail(brandId), "products"],
    queryFn: async () => {
      const response = await fetch(`${backendUrl}/admin/brands/${brandId}/products`, {
        credentials: "include",
      })
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to fetch brand products"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(`${errorMessage} (${response.status})`)
      }
      return response.json()
    },
    ...options,
  })

  return { ...data, ...rest }
}

export const useUpdateBrandProducts = (
  brandId: string,
  options?: UseMutationOptions<BrandResponse, FetchError, UpdateBrandProductsInput>
) => {
  return useMutation({
    mutationFn: async (payload: UpdateBrandProductsInput) => {
      const response = await fetch(`${backendUrl}/admin/brands/${brandId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to update brand products")
      }
      return response.json()
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: brandsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: brandsQueryKeys.detail(brandId) })
      queryClient.invalidateQueries({ queryKey: [...brandsQueryKeys.detail(brandId), "products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

