"use client"

import { Table, Text, clx } from "@medusajs/ui"

import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import LineItemMockupPreview from "@modules/customizer/components/line-item-mockup-preview"
import {
  getCustomizerMetadata,
  getCustomizerMockupArtifacts,
  getCustomizerMockupUrls,
} from "@modules/customizer/lib/metadata"
import { memo, useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
}

const Item = ({ item, type = "full" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const customizerMetadata = getCustomizerMetadata(item)
  const mockupUrls = getCustomizerMockupUrls(item)
  const mockupArtifacts = getCustomizerMockupArtifacts(item)

  // Resilient handle/title resolution — if the line came back without an
  // attached product/variant (custom SCP add-to-cart, deleted variant, or a
  // partial fields population), avoid linking to /products/undefined (which
  // 404s) and avoid an empty title row. Customizer add-to-cart stamps these
  // onto `item.metadata` as a last-resort fallback.
  const metaRecord = (item.metadata ?? {}) as Record<string, unknown>
  const metaHandle =
    typeof metaRecord.product_handle === "string"
      ? metaRecord.product_handle
      : null
  const metaTitle =
    typeof metaRecord.product_title === "string"
      ? metaRecord.product_title
      : null
  const handle =
    item.variant?.product?.handle ??
    (item as { product_handle?: string }).product_handle ??
    metaHandle ??
    null
  const displayTitle =
    item.product_title ||
    item.variant?.product?.title ||
    (item as { title?: string }).title ||
    metaTitle ||
    "Custom item"

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    const message = await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // Cap the dropdown size for UX — splitting into multiple line items above
  // this is rare. Inventory quantity still applies as the hard cap.
  const SELECT_MAX_OPTIONS = 100
  const variant = item.variant
  const isUnlimited = !variant?.manage_inventory || variant?.allow_backorder
  const inventoryCap = isUnlimited
    ? SELECT_MAX_OPTIONS
    : Math.min((variant as any)?.inventory_quantity ?? 0, SELECT_MAX_OPTIONS)
  // Never render fewer options than the line is currently set to.
  const maxQuantity = Math.max(inventoryCap, item.quantity, 1)

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        {handle ? (
          <LocalizedClientLink
            href={`/products/${handle}?${[
              item.variant?.id ? `variant=${item.variant.id}` : null,
              `edit=${item.id}`,
            ]
              .filter(Boolean)
              .join("&")}`}
            className={clx("flex", {
              "w-16": type === "preview",
              "small:w-24 w-12": type === "full",
            })}
          >
            <LineItemMockupPreview
              mockups={mockupArtifacts}
              mockupUrls={mockupUrls}
              productThumbnail={item.variant?.product?.thumbnail ?? item.thumbnail}
              productImages={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        ) : (
          <div
            className={clx("flex", {
              "w-16": type === "preview",
              "small:w-24 w-12": type === "full",
            })}
          >
            <LineItemMockupPreview
              mockups={mockupArtifacts}
              mockupUrls={mockupUrls}
              productThumbnail={item.thumbnail}
              size="square"
            />
          </div>
        )}
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {displayTitle}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        {customizerMetadata && (
          <>
            <Text className="txt-small text-ui-fg-subtle mt-1">Custom design attached</Text>
            {customizerMetadata.printNotes ? (
              <Text
                className="txt-small text-ui-fg-subtle mt-1 line-clamp-3"
                title={customizerMetadata.printNotes}
              >
                Notes:{" "}
                {customizerMetadata.printNotes.length > 120
                  ? `${customizerMetadata.printNotes.slice(0, 120)}…`
                  : customizerMetadata.printNotes}
              </Text>
            ) : null}
          </>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {Array.from({ length: maxQuantity }, (_, i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
              ))}
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice item={item} style="tight" />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice item={item} style="tight" />
            </span>
          )}
          <LineItemPrice item={item} style="tight" />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

// 100+ line carts re-render heavily when any one line changes. Memoise so a
// quantity change on row 17 doesn't repaint rows 1-16 / 18-100.
export default memo(Item, (prev, next) => {
  if (prev.type !== next.type) return false
  const a = prev.item
  const b = next.item
  return (
    a.id === b.id &&
    a.quantity === b.quantity &&
    a.unit_price === b.unit_price &&
    a.variant_id === b.variant_id &&
    a.product_title === b.product_title
  )
})
