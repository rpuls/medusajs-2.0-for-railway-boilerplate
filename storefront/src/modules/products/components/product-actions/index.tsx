"use client"

import { Button, Heading } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt?.option?.title] = varopt.value
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
  const [quantity, setQuantity] = useState(1) // Stare pentru cantitate
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
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    if (selectedVariant?.allow_backorder) {
      return true
    }

    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart with the selected quantity
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity, // Adaugă cantitatea selectată
      countryCode,
    })

    setIsAdding(false)
  }

  // Funcții pentru ajustarea cantității
  const increaseQuantity = () => setQuantity((prev) => prev + 1)
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
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
              <Divider />
            </div>
          )}
        </div>
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title.toUpperCase()}
        </Heading>
        <ProductPrice product={product} variant={selectedVariant} />
          <div className="flex items-center gap-[16px]">
        {/* Butoanele pentru cantitate */}
        <div className="flex items-center justify-between p-2 gap-x-2 border-[1px] border-gray-300 w-[100px]">
          <button
            onClick={decreaseQuantity}
            className=" font-bold text-[24px] text-gray-500" 
            disabled={quantity <= 1 || isAdding}
          >
            -
          </button>
          <span className="text-lg">{quantity}</span>
          <button
            onClick={increaseQuantity}
            className=" font-bold text-[24px] text-gray-500"
            disabled={isAdding}
          >
            +
          </button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding}
          variant="primary"
          className="w-full lg:w-[200px] h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Select variant"
            : !inStock
            ? "Produsul nu mai este in stoc"
            : "Adauga in Cos"}
        </Button>
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
