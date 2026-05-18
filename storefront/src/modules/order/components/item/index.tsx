import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"

import { convertMinorToLocale } from "@lib/util/money"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LineItemDesignPreview from "@modules/customizer/components/line-item-design-preview"
import LineItemMockupPreview from "@modules/customizer/components/line-item-mockup-preview"
import {
  getCustomizerMetadata,
  getCustomizerMockupArtifacts,
  getCustomizerMockupUrls,
} from "@modules/customizer/lib/metadata"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  /** Optional currency override; falls back to AUD when not provided. */
  currencyCode?: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  const customizerMetadata = getCustomizerMetadata(item)
  const mockupUrls = getCustomizerMockupUrls(item)
  const mockupArtifacts = getCustomizerMockupArtifacts(item)

  // Garment vs print split for the line. The customizer stamps a pricing
  // breakdown into the line metadata at add-to-cart time; we surface it here
  // so customers can see what they paid for the blank vs the SCP print work.
  // Falls back gracefully if metadata is missing or shaped differently.
  const currency = currencyCode ?? "aud"
  const pricing = customizerMetadata?.pricing
  const baseUnitCents =
    typeof pricing?.baseUnitPriceCents === "number"
      ? pricing.baseUnitPriceCents
      : null
  const printUnitCents =
    typeof pricing?.sideSurchargePerUnitCents === "number"
      ? pricing.sideSurchargePerUnitCents
      : null
  const showSplit =
    baseUnitCents !== null && printUnitCents !== null && printUnitCents > 0
  const fmt = (cents: number) =>
    convertMinorToLocale({ amount: cents, currency_code: currency })

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <LineItemMockupPreview
            mockups={mockupArtifacts}
            mockupUrls={mockupUrls}
            productThumbnail={item.thumbnail}
            size="square"
          />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-name"
        >
          {item.title}
        </Text>
        {item.variant && (
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        )}
        {customizerMetadata && (
          <>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <Text className="txt-small text-ui-fg-subtle">
                Custom design archived with print-ready assets.
              </Text>
              {/*
                Mirrors the customizer's "Preview design" affordance on the
                order page. Uses the persisted server-rendered mockups
                already on the line metadata — no Fabric, no recompute, just
                a lightbox over the saved PNGs.
              */}
              {mockupArtifacts.length > 0 ? (
                <LineItemDesignPreview
                  mockups={mockupArtifacts}
                  itemLabel={item.title ?? undefined}
                />
              ) : null}
            </div>
            {showSplit && (
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-ui-fg-subtle max-w-xs">
                <span>Garment / unit</span>
                <span className="text-right text-ui-fg-base">
                  {fmt(baseUnitCents!)}
                </span>
                <span>Print / unit</span>
                <span className="text-right text-ui-fg-base">
                  {fmt(printUnitCents!)}
                </span>
              </div>
            )}
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
            {customizerMetadata.customerOriginalFiles &&
            customizerMetadata.customerOriginalFiles.length > 0 ? (
              <div className="mt-3 border-t pt-3">
                <Text className="txt-small-plus font-semibold mb-2">
                  Download your files
                </Text>
                <div className="space-y-2">
                  {customizerMetadata.customerOriginalFiles.map((file) => (
                    <a
                      key={file.url}
                      href={file.url}
                      download={file.fileName}
                      className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M12 2a1 1 0 011 1v6h2.586a1 1 0 01.707 1.707l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 015.414 9H8V3a1 1 0 011-1h3z" />
                        <path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      </svg>
                      {file.fileName}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
            <Text className="text-ui-fg-muted">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </Text>
            <LineItemUnitPrice item={item} style="tight" />
          </span>

          <LineItemPrice item={item} style="tight" />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
