"use client"

import { Button } from "@medusajs/ui"
import { isEqual } from "@lib/utils/is-equal"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
import QuickBuy from "../quick-buy"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useStorefrontConfig } from "@lib/hooks/use-storefront-config"
import { useCartDrawer } from "@modules/cart/context/cart-context"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const { openCart } = useCartDrawer()
  const config = useStorefrontConfig()

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
      
      // Refresh the router to update cart data
      router.refresh()
      // Open the cart drawer
      openCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-6">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id} className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                      {option.title}
                    </label>
                    <OptionSelect
                      option={option}
                      current={options[option.title ?? ""]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="py-4 border-t border-b border-border-base my-4">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding}
            className="w-full h-14 bg-primary text-text-inverse hover:bg-primary-hover transition-colors font-semibold text-lg rounded-lg shadow-md hover:shadow-lg"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select variant"
              : !inStock
              ? "Out of stock"
              : "Add to cart"}
          </Button>
          
          {/* Quick Buy Button */}
          {config.quickBuy.showOnPDP && selectedVariant && inStock && (
            <QuickBuy
              product={product}
              variant={selectedVariant}
              className="w-full h-12 border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-text-inverse transition-colors font-semibold rounded-lg"
            />
          )}
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
