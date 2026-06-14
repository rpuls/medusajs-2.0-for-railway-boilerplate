"use client"

import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

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
  const [quantity, setQuantity] = useState(1)
  const countryCode = useParams().countryCode as string

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

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-8" ref={actionsRef}>
        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-6">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
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

        {/* Quantity & Add to Cart */}
        <div className="flex gap-4">
          <div className="flex items-center border border-kin-primary w-1/3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={!!disabled || isAdding}
              className="px-4 py-3 text-kin-primary hover:bg-kin-surface-container transition-colors focus:outline-none disabled:opacity-50"
              aria-label="Giảm số lượng"
            >
              <span className="material-symbols-outlined text-[18px]">
                remove
              </span>
            </button>
            <input
              aria-label="Số lượng"
              className="w-full text-center font-hanken text-sm font-semibold text-kin-primary bg-transparent border-none focus:ring-0 p-0"
              readOnly
              type="text"
              value={quantity}
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={!!disabled || isAdding}
              className="px-4 py-3 text-kin-primary hover:bg-kin-surface-container transition-colors focus:outline-none disabled:opacity-50"
              aria-label="Tăng số lượng"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding}
            className="flex-1 bg-kin-primary text-kin-on-primary font-hanken text-sm font-semibold uppercase tracking-widest py-4 hover:bg-kin-on-surface-variant transition-colors focus:outline-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="add-product-button"
          >
            {isAdding
              ? "Đang thêm..."
              : !selectedVariant
              ? "Chọn size"
              : !inStock
              ? "Hết hàng"
              : "Thêm vào giỏ"}
          </button>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center gap-2 py-3 px-4 bg-kin-surface border border-kin-warm-grey">
          <span className="material-symbols-outlined text-kin-forest">
            check_circle
          </span>
          <span className="font-hanken text-xs font-medium text-kin-primary">
            Đổi size miễn phí lần đầu
          </span>
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
