"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

type Option = HttpTypes.StoreCartShippingOption

/** The options shoppers choose one of, for the items that share a shipping profile */
type Group = {
  profileId: string | null
  titles: string[]
  options: Option[]
}

/**
 * Splits the delivery options by the shipping profiles of the cart's items.
 *
 * Medusa completes a cart only when it has a shipping method for every
 * shipping profile among its items, yet it lists every option that ships to
 * the address, whatever its profile. Upstream's single list therefore let a
 * shopper pick one option for a cart holding, say, a T-shirt and a sofa, and
 * the order then failed at "Place order". Each profile gets its own list here,
 * holding only its own options.
 *
 * A store with one profile, which is every store until someone adds a second,
 * gets one group and the same single list as upstream. So does a backend that
 * does not expose the item profiles (see retrieveCart in lib/data/cart.ts).
 */
const groupByProfile = (
  cart: HttpTypes.StoreCart,
  options: Option[]
): Group[] => {
  const profileOf = (item: HttpTypes.StoreCartLineItem): string | undefined =>
    (item as { product?: { shipping_profile?: { id?: string } } }).product
      ?.shipping_profile?.id
  const items = (cart.items ?? []).filter(
    (item) => item.requires_shipping !== false
  )
  const profiles = [...new Set(items.map(profileOf))]

  if (profiles.length <= 1 || profiles.some((id) => !id)) {
    const only = profiles[0]
    return [
      {
        profileId: only ?? null,
        titles: [],
        options: only
          ? options.filter((option) => option.shipping_profile_id === only)
          : options,
      },
    ]
  }

  return (profiles as string[]).map((profileId) => ({
    profileId,
    titles: [
      ...new Set(
        items
          .filter((item) => profileOf(item) === profileId)
          .map((item) => item.product_title ?? item.title)
      ),
    ],
    options: options.filter(
      (option) => option.shipping_profile_id === profileId
    ),
  }))
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const groups = groupByProfile(cart, availableShippingMethods ?? [])
  const chosenOptionIds = new Set(
    (cart.shipping_methods ?? []).map((method) => method.shipping_option_id)
  )

  // A cart holds one shipping method per profile, so each group's choice is
  // the method whose option belongs to that group.
  const selectedFor = (group: Group): Option | undefined =>
    group.profileId
      ? group.options.find((option) => chosenOptionIds.has(option.id))
      : group.options.find(
          // To do: remove the previously selected shipping method instead of using the last one
          (method) =>
            method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
        )

  const selected = groups.map(selectedFor)
  const everyGroupChosen = selected.every(Boolean)

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const set = async (id: string) => {
    setIsLoading(true)
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const optionList = (group: Group, chosen: Option | undefined) => (
    <RadioGroup value={chosen?.id} onChange={set}>
      {group.options.map((option) => {
        return (
          <RadioGroup.Option
            key={option.id}
            value={option.id}
            data-testid="delivery-option-radio"
            className={clx(
              "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
              {
                "border-ui-border-interactive": option.id === chosen?.id,
              }
            )}
          >
            <div className="flex items-center gap-x-4">
              <Radio checked={option.id === chosen?.id} />
              <span className="text-base-regular">{option.name}</span>
            </div>
            <span className="justify-self-end text-ui-fg-base">
              {convertToLocale({
                amount: option.amount!,
                currency_code: cart?.currency_code,
              })}
            </span>
          </RadioGroup.Option>
        )
      })}
    </RadioGroup>
  )

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
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
          {groups.length === 1 ? (
            <div className="pb-8">{optionList(groups[0], selected[0])}</div>
          ) : (
            groups.map((group, index) => (
              <div
                key={group.profileId}
                className="pb-8"
                data-testid="delivery-group"
              >
                <Text className="txt-medium-plus text-ui-fg-base mb-2">
                  Delivery for {group.titles.join(", ")}
                </Text>
                {group.options.length ? (
                  optionList(group, selected[index])
                ) : (
                  <Text className="txt-medium text-ui-fg-subtle">
                    None of our delivery options can ship these to your
                    address.
                  </Text>
                )}
              </div>
            ))
          )}

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!everyGroupChosen}
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
                {selected.map((option, index) =>
                  option ? (
                    <Text
                      key={option.id}
                      className="txt-medium text-ui-fg-subtle"
                    >
                      {option.name}{" "}
                      {convertToLocale({
                        amount: option.amount!,
                        currency_code: cart?.currency_code,
                      })}
                    </Text>
                  ) : groups[index].titles.length ? (
                    <Text key={index} className="txt-medium text-ui-fg-error">
                      Choose a delivery option for{" "}
                      {groups[index].titles.join(", ")}
                    </Text>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
