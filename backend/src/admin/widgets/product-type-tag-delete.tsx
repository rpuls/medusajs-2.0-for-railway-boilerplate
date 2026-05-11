import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  IconButton,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { sdk } from "../lib/sdk"

type ProductType = { id: string; value: string }
type ProductTag = { id: string; value: string }

const ProductTypeTagDeleteWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productId = data?.id
  const prompt = usePrompt()
  const [type, setType] = useState<ProductType | null>(null)
  const [tags, setTags] = useState<ProductTag[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const { product } = await sdk.admin.product.retrieve(productId, {
        fields: "type.*,tags.*",
      })
      setType((product as any).type ?? null)
      setTags(((product as any).tags ?? []) as ProductTag[])
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load product type and tags")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void load()
  }, [load])

  const onDeleteType = async () => {
    if (!type) return
    const confirmed = await prompt({
      variant: "danger",
      title: `Delete product type "${type.value}"`,
      description:
        "This permanently removes the type from your store. It will be unassigned from every product that currently uses it. This cannot be undone.",
      verificationText: "DELETE",
      verificationInstruction: "Type DELETE to confirm.",
      confirmText: "Delete type",
      cancelText: "Cancel",
    })
    if (!confirmed) return
    setBusyId(type.id)
    try {
      await sdk.admin.productType.delete(type.id)
      toast.success(`Deleted product type "${type.value}"`)
      setType(null)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete product type")
    } finally {
      setBusyId(null)
    }
  }

  const onDeleteTag = async (tag: ProductTag) => {
    const confirmed = await prompt({
      variant: "danger",
      title: `Delete product tag "${tag.value}"`,
      description:
        "This permanently removes the tag from your store. It will be unassigned from every product that currently uses it. This cannot be undone.",
      verificationText: "DELETE",
      verificationInstruction: "Type DELETE to confirm.",
      confirmText: "Delete tag",
      cancelText: "Cancel",
    })
    if (!confirmed) return
    setBusyId(tag.id)
    try {
      await sdk.admin.productTag.delete(tag.id)
      toast.success(`Deleted product tag "${tag.value}"`)
      setTags((prev) => prev.filter((t) => t.id !== tag.id))
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete product tag")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="px-6 py-4">
          <Heading level="h2">Type & tag cleanup</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Loading…
          </Text>
        </div>
      </Container>
    )
  }

  if (!type && tags.length === 0) {
    return null
  }

  return (
    <Container>
      <div className="px-6 py-4 flex flex-col gap-y-4">
        <div>
          <Heading level="h2">Type & tag cleanup</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Permanently remove a type or tag from your store. This will unassign
            it from every product that uses it.
          </Text>
        </div>

        {type && (
          <div className="flex items-center justify-between gap-x-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-x-1">
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Type
                </Text>
                <HelpTooltip
                  text="Permanently delete this product type from your store. It will be unassigned from every product that currently uses it."
                  size={14}
                />
              </div>
              <Text size="small" weight="plus">
                {type.value}
              </Text>
            </div>
            <Button
              variant="danger"
              size="small"
              disabled={busyId === type.id}
              onClick={onDeleteType}
            >
              {busyId === type.id ? "Deleting…" : "Delete globally"}
            </Button>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-1">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Tags
              </Text>
              <HelpTooltip
                text="Permanently delete a tag from your store. Click the trash icon next to a tag to remove it. It will be unassigned from every product that currently uses it."
                size={14}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-x-1 rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-1"
                >
                  <Badge size="2xsmall" color="grey">
                    {tag.value}
                  </Badge>
                  <IconButton
                    size="2xsmall"
                    variant="transparent"
                    disabled={busyId === tag.id}
                    onClick={() => onDeleteTag(tag)}
                    aria-label={`Delete tag ${tag.value} globally`}
                  >
                    <Trash />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductTypeTagDeleteWidget
