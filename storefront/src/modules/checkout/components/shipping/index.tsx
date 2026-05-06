"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { formatStoreCartShippingOptionPrice } from "@lib/util/shipping-option-price"
import { HttpTypes } from "@medusajs/types"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
  shippingTier?: "flat" | "live"
  totalWeightGrams?: number
  thresholdGrams?: number
}

const formatKg = (grams: number) => {
  if (!grams || !Number.isFinite(grams)) {
    return "0 kg"
  }
  const kg = grams / 1000
  return `${kg.toFixed(kg >= 10 ? 1 : 2)} kg`
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
  shippingTier,
  totalWeightGrams,
  thresholdGrams,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null)
  const [optimisticId, setOptimisticId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const serverSelectedId = cart.shipping_methods?.at(-1)?.shipping_option_id
  const effectiveSelectedId = optimisticId ?? serverSelectedId
  const selectedShippingMethod = availableShippingMethods?.find(
    (method) => method.id === effectiveSelectedId
  )

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    startTransition(() => {
      router.push(pathname + "?step=payment", { scroll: false })
    })
  }

  const set = async (id: string) => {
    setOptimisticId(id)
    setPendingOptionId(id)
    setIsLoading(true)
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setError(err.message)
        setOptimisticId(null)
      })
      .finally(() => {
        setIsLoading(false)
        setPendingOptionId(null)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-transparent">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row items-baseline gap-x-2 text-2xl font-semibold tracking-tight text-[var(--brand-primary)]",
            {
              "pointer-events-none select-none opacity-50":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <div data-testid="delivery-options-container">
          {shippingTier && typeof totalWeightGrams === "number" && (
            <p className="text-small-regular mb-4 rounded-lg border border-[rgba(61,207,194,0.35)] bg-[rgba(61,207,194,0.1)] px-3 py-2.5 text-ui-fg-subtle">
              {shippingTier === "flat"
                ? `Eligible for flat-rate shipping (cart weight ${formatKg(
                    totalWeightGrams
                  )}${
                    thresholdGrams
                      ? `, under the ${formatKg(thresholdGrams)} threshold`
                      : ""
                  }).`
                : `Live freight quotes shown — cart weight ${formatKg(
                    totalWeightGrams
                  )}${
                    cart?.shipping_address?.postal_code
                      ? ` to ${cart.shipping_address.postal_code}`
                      : ""
                  }.`}
            </p>
          )}
          <div className="pb-8">
            <RadioGroup value={selectedShippingMethod?.id} onChange={set}>
              {availableShippingMethods?.map((option) => {
                return (
                  <RadioGroup.Option
                    key={option.id}
                    value={option.id}
                    data-testid="delivery-option-radio"
                    className={clx(
                      "mb-2 flex cursor-pointer items-center justify-between rounded-rounded border border-[rgba(26,26,46,0.14)] bg-[rgba(255,255,255,0.6)] px-6 py-4 text-small-regular transition-shadow hover:border-[rgba(26,26,46,0.22)] hover:shadow-md small:px-8",
                      {
                        "border-[var(--brand-secondary)] ring-1 ring-[var(--brand-secondary)]/30":
                          option.id === selectedShippingMethod?.id,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <Radio
                        checked={option.id === selectedShippingMethod?.id}
                      />
                      <span className="text-base-regular">{option.name}</span>
                      {pendingOptionId === option.id && (
                        <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-secondary)] border-t-transparent" />
                      )}
                    </div>
                    <span className="justify-self-end text-ui-fg-base">
                      {formatStoreCartShippingOptionPrice(
                        option,
                        cart?.currency_code
                      )}
                    </span>
                  </RadioGroup.Option>
                )
              })}
            </RadioGroup>
          </div>

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <Button
            size="large"
            variant="primary"
            className="checkout-primary-action mt-6 w-full small:w-auto"
            onClick={handleSubmit}
            isLoading={isLoading || isPending}
            disabled={!effectiveSelectedId || isLoading}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedShippingMethod?.name}{" "}
                  {formatStoreCartShippingOptionPrice(
                    selectedShippingMethod,
                    cart?.currency_code
                  )}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipping
