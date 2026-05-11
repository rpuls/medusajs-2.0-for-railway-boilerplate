import {
  Button,
  Container,
  Heading,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"
import { sdk } from "../../lib/sdk"

type ProductType = { id: string; value: string }
type ProductTag = { id: string; value: string }

const ProductTypeTagManagePage = () => {
  const prompt = usePrompt()

  const [types, setTypes] = useState<ProductType[]>([])
  const [tags, setTags] = useState<ProductTag[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [typesRes, tagsRes] = await Promise.all([
        sdk.admin.productType.list({ limit: 500, offset: 0 }),
        sdk.admin.productTag.list({ limit: 500, offset: 0 }),
      ])
      const allTypes = (typesRes as any).product_types ?? []
      const allTags = (tagsRes as any).product_tags ?? []
      setTypes(allTypes.sort((a: ProductType, b: ProductType) => a.value.localeCompare(b.value)))
      setTags(allTags.sort((a: ProductTag, b: ProductTag) => a.value.localeCompare(b.value)))
    } catch (err: any) {
      setLoadError(err?.message ?? "Failed to load types and tags")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onDeleteType = async (type: ProductType) => {
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
      setTypes((prev) => prev.filter((t) => t.id !== type.id))
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
        <Text size="small" className="text-ui-fg-subtle px-6 py-4">
          Loading…
        </Text>
      </Container>
    )
  }

  if (loadError) {
    return (
      <Container>
        <Text size="small" className="text-ui-tag-red-icon px-6 py-4">
          {loadError}
        </Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Types */}
      <Container>
        <div className="px-6 py-4 flex flex-col gap-y-4">
          <div className="flex items-center gap-x-2">
            <Heading level="h2">Product types</Heading>
            <HelpTooltip
              text={{
                title: "Product types",
                body: "Each product can have one type (e.g. T-Shirts, Polos, Hoodies). Deleting a type removes it from the store and unassigns it from every product that used it.",
                bullets: [
                  "Types are used for catalog filtering and reporting.",
                  "Deletion is permanent — reassign products first if you want to merge two types.",
                ],
              }}
            />
            <Text size="small" className="text-ui-fg-subtle ml-auto">
              {types.length} {types.length === 1 ? "type" : "types"}
            </Text>
          </div>

          {types.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              No product types found.
            </Text>
          ) : (
            <div className="flex flex-col divide-y divide-ui-border-base">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <Text size="small">{type.value}</Text>
                  <Button
                    variant="danger"
                    size="small"
                    disabled={busyId === type.id}
                    onClick={() => onDeleteType(type)}
                  >
                    {busyId === type.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* Tags */}
      <Container>
        <div className="px-6 py-4 flex flex-col gap-y-4">
          <div className="flex items-center gap-x-2">
            <Heading level="h2">Product tags</Heading>
            <HelpTooltip
              text={{
                title: "Product tags",
                body: "Products can have multiple tags (e.g. sale, new-arrival, mens). Deleting a tag removes it from the store and unassigns it from every product that used it.",
                bullets: [
                  "Tags are used for storefront filtering and promotions.",
                  "Deletion is permanent and affects all products using that tag.",
                ],
              }}
            />
            <Text size="small" className="text-ui-fg-subtle ml-auto">
              {tags.length} {tags.length === 1 ? "tag" : "tags"}
            </Text>
          </div>

          {tags.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              No product tags found.
            </Text>
          ) : (
            <div className="flex flex-col divide-y divide-ui-border-base">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <Text size="small">{tag.value}</Text>
                  <Button
                    variant="danger"
                    size="small"
                    disabled={busyId === tag.id}
                    onClick={() => onDeleteTag(tag)}
                  >
                    {busyId === tag.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default ProductTypeTagManagePage
