"use client"

import repeat from "@lib/util/repeat"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table, Text } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import { useMemo, useState } from "react"

type ItemsTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[]
}

type ItemMetadata = Record<string, unknown> | null | undefined

const groupKeyFor = (item: HttpTypes.StoreCartLineItem): string => {
  const metadata = (item as any)?.metadata as ItemMetadata
  const designId =
    (metadata?.dtfGangsheetDesignId as string | undefined) ||
    (metadata?.designId as string | undefined) ||
    null
  if (designId) {
    return `design:${designId}`
  }
  return `product:${item.product_id ?? item.variant?.product_id ?? "unknown"}`
}

const groupTitle = (
  item: HttpTypes.StoreCartLineItem,
  groupKey: string
): string => {
  if (groupKey.startsWith("design:")) {
    return `${item.product_title ?? "Custom design"} · custom`
  }
  return item.product_title ?? "Items"
}

const formatCurrency = (
  amount: number | undefined,
  currencyCode: string | undefined
) => {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return null
  }
  return convertToLocale({ amount, currency_code: currencyCode || "aud" })
}

const ItemsTemplate = ({ items }: ItemsTemplateProps) => {
  const sortedItems = useMemo(() => {
    if (!items) return null
    return [...items].sort((a, b) =>
      (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
    )
  }, [items])

  const groups = useMemo(() => {
    if (!sortedItems) return null
    const order: string[] = []
    const map = new Map<string, HttpTypes.StoreCartLineItem[]>()
    for (const item of sortedItems) {
      const key = groupKeyFor(item)
      if (!map.has(key)) {
        order.push(key)
        map.set(key, [])
      }
      map.get(key)!.push(item)
    }
    return order.map((key) => {
      const lines = map.get(key) ?? []
      const totalQuantity = lines.reduce((sum, l) => sum + (l.quantity ?? 0), 0)
      const totalAmount = lines.reduce(
        (sum, l) => sum + ((l as any)?.subtotal ?? 0),
        0
      )
      return {
        key,
        lines,
        totalQuantity,
        totalAmount,
        currencyCode: (lines[0] as any)?.currency_code,
        title: groupTitle(lines[0], key),
        isDesignGroup: key.startsWith("design:"),
      }
    })
  }, [sortedItems])

  const showGroups = !!groups && groups.length > 0 && groups.length < (items?.length ?? 0)

  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Cart</Heading>
      </div>
      <Table>
        <Table.Header className="border-t-0">
          <Table.Row className="text-ui-fg-subtle txt-medium-plus">
            <Table.HeaderCell className="!pl-0">Item</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              Price
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!sortedItems
            ? repeat(5).map((i) => <SkeletonLineItem key={i} />)
            : showGroups
              ? groups!.map((group) => (
                  <CartItemGroup
                    key={group.key}
                    title={group.title}
                    lineCount={group.lines.length}
                    totalQuantity={group.totalQuantity}
                    totalAmount={group.totalAmount}
                    currencyCode={group.currencyCode}
                    isDesignGroup={group.isDesignGroup}
                  >
                    {group.lines.map((item) => (
                      <Item key={item.id} item={item} />
                    ))}
                  </CartItemGroup>
                ))
              : sortedItems.map((item) => <Item key={item.id} item={item} />)}
        </Table.Body>
      </Table>
    </div>
  )
}

type CartItemGroupProps = {
  title: string
  lineCount: number
  totalQuantity: number
  totalAmount: number
  currencyCode: string | undefined
  isDesignGroup: boolean
  children: React.ReactNode
}

const CartItemGroup = ({
  title,
  lineCount,
  totalQuantity,
  totalAmount,
  currencyCode,
  isDesignGroup,
  children,
}: CartItemGroupProps) => {
  const [open, setOpen] = useState(true)
  const formattedTotal = formatCurrency(totalAmount, currencyCode)

  return (
    <>
      <Table.Row className="bg-ui-bg-subtle">
        {/* Medusa UI's Table.Cell prop type doesn't declare `colSpan`, but it forwards rest props to <td>. */}
        <Table.Cell {...({ colSpan: 5 } as any)} className="!py-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 text-left"
            aria-expanded={open}
            data-testid="cart-group-toggle"
          >
            <Text className="txt-medium-plus text-ui-fg-base">
              {open ? "▾" : "▸"} {title}{" "}
              {isDesignGroup ? (
                <span className="ml-1 inline-block rounded-full bg-ui-bg-base px-2 py-0.5 text-xs text-ui-fg-subtle">
                  custom design
                </span>
              ) : null}
            </Text>
            <Text className="txt-small text-ui-fg-subtle">
              {lineCount} {lineCount === 1 ? "size" : "sizes"} · {totalQuantity}{" "}
              units{formattedTotal ? ` · ${formattedTotal}` : ""}
            </Text>
          </button>
        </Table.Cell>
      </Table.Row>
      {open ? children : null}
    </>
  )
}

export default ItemsTemplate
