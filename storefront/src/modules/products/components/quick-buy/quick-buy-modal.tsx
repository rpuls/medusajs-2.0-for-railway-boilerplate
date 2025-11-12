"use client"

import { Fragment, useState, useMemo, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "../product-actions/option-select"
import ProductPrice from "../product-price"
import { quickBuy } from "../../actions/quick-buy"
import { useParams } from "next/navigation"

type QuickBuyModalProps = {
  product: HttpTypes.StoreProduct
  isOpen: boolean
  onClose: () => void
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce(
    (acc: Record<string, string | undefined>, varopt: any) => {
      if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
        acc[varopt.option.title] = varopt.value
      }
      return acc
    },
    {}
  )
}

const QuickBuyModal = ({ product, isOpen, onClose }: QuickBuyModalProps) => {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const countryCode = useParams().countryCode as string

  // Preselect first variant if only one exists
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

  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

  const handleQuickBuy = async () => {
    if (!selectedVariant?.id) {
      setError("Please select a variant")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await quickBuy({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
    } catch (err: any) {
      setError(err.message || "Failed to process quick buy")
      setIsProcessing(false)
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-modal">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background-overlay" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-xl font-semibold text-text-primary">
                  Quick Buy
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-background-elevated rounded-md transition-colors"
                  aria-label="Close"
                >
                  <XMark className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {product.title}
                  </h3>
                </div>

                {(product.variants?.length ?? 0) > 1 && (
                  <div className="space-y-4">
                    {(product.options || []).map((option) => (
                      <div key={option.id}>
                        <OptionSelect
                          option={option}
                          current={options[option.title ?? ""]}
                          updateOption={setOptionValue}
                          title={option.title ?? ""}
                          disabled={isProcessing}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <ProductPrice product={product} variant={selectedVariant} />

                {error && (
                  <div className="text-sm text-error bg-error-light p-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleQuickBuy}
                    disabled={!inStock || !selectedVariant || isProcessing}
                    isLoading={isProcessing}
                    className="flex-1"
                  >
                    {!selectedVariant
                      ? "Select variant"
                      : !inStock
                      ? "Out of stock"
                      : "Buy Now"}
                  </Button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default QuickBuyModal

