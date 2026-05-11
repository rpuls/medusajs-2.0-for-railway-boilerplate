import {
  Button,
  Checkbox,
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
  const [busy, setBusy] = useState(false)

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

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

  useEffect(() => { void load() }, [load])

  const toggleType = (id: string) =>
    setSelectedTypes((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleTag = (id: string) =>
    setSelectedTags((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleAllTypes = () =>
    setSelectedTypes(selectedTypes.size === types.length ? new Set() : new Set(types.map((t) => t.id)))

  const toggleAllTags = () =>
    setSelectedTags(selectedTags.size === tags.length ? new Set() : new Set(tags.map((t) => t.id)))

  const onBulkDeleteTypes = async () => {
    const toDelete = types.filter((t) => selectedTypes.has(t.id))
    const confirmed = await prompt({
      variant: "danger",
      title: `Delete ${toDelete.length} product ${toDelete.length === 1 ? "type" : "types"}`,
      description: `This permanently removes ${toDelete.length === 1 ? `"${toDelete[0].value}"` : `${toDelete.length} types`} from your store. They will be unassigned from every product that uses them. This cannot be undone.`,
      verificationText: "DELETE",
      verificationInstruction: "Type DELETE to confirm.",
      confirmText: `Delete ${toDelete.length} ${toDelete.length === 1 ? "type" : "types"}`,
      cancelText: "Cancel",
    })
    if (!confirmed) return
    setBusy(true)
    const deletedIds = new Set<string>()
    let failed = 0
    for (const type of toDelete) {
      try {
        await sdk.admin.productType.delete(type.id)
        deletedIds.add(type.id)
      } catch {
        failed++
      }
    }
    if (deletedIds.size > 0) {
      setTypes((prev) => prev.filter((t) => !deletedIds.has(t.id)))
      setSelectedTypes((prev) => { const s = new Set(prev); deletedIds.forEach((id) => s.delete(id)); return s })
      toast.success(`Deleted ${deletedIds.size} product ${deletedIds.size === 1 ? "type" : "types"}`)
    }
    if (failed > 0) toast.error(`${failed} ${failed === 1 ? "type" : "types"} could not be deleted`)
    setBusy(false)
  }

  const onBulkDeleteTags = async () => {
    const toDelete = tags.filter((t) => selectedTags.has(t.id))
    const confirmed = await prompt({
      variant: "danger",
      title: `Delete ${toDelete.length} product ${toDelete.length === 1 ? "tag" : "tags"}`,
      description: `This permanently removes ${toDelete.length === 1 ? `"${toDelete[0].value}"` : `${toDelete.length} tags`} from your store. They will be unassigned from every product that uses them. This cannot be undone.`,
      verificationText: "DELETE",
      verificationInstruction: "Type DELETE to confirm.",
      confirmText: `Delete ${toDelete.length} ${toDelete.length === 1 ? "tag" : "tags"}`,
      cancelText: "Cancel",
    })
    if (!confirmed) return
    setBusy(true)
    const deletedIds = new Set<string>()
    let failed = 0
    for (const tag of toDelete) {
      try {
        await sdk.admin.productTag.delete(tag.id)
        deletedIds.add(tag.id)
      } catch {
        failed++
      }
    }
    if (deletedIds.size > 0) {
      setTags((prev) => prev.filter((t) => !deletedIds.has(t.id)))
      setSelectedTags((prev) => { const s = new Set(prev); deletedIds.forEach((id) => s.delete(id)); return s })
      toast.success(`Deleted ${deletedIds.size} product ${deletedIds.size === 1 ? "tag" : "tags"}`)
    }
    if (failed > 0) toast.error(`${failed} ${failed === 1 ? "tag" : "tags"} could not be deleted`)
    setBusy(false)
  }

  if (loading) {
    return (
      <Container>
        <Text size="small" className="text-ui-fg-subtle px-6 py-4">Loading…</Text>
      </Container>
    )
  }

  if (loadError) {
    return (
      <Container>
        <Text size="small" className="text-ui-tag-red-icon px-6 py-4">{loadError}</Text>
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
            <Text size="small" className="text-ui-fg-subtle">No product types found.</Text>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTypes.size === types.length && types.length > 0}
                    onCheckedChange={toggleAllTypes}
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    {selectedTypes.size > 0 ? `${selectedTypes.size} selected` : "Select all"}
                  </Text>
                </label>
                {selectedTypes.size > 0 && (
                  <Button variant="danger" size="small" disabled={busy} onClick={onBulkDeleteTypes}>
                    {busy ? "Deleting…" : `Delete ${selectedTypes.size} selected`}
                  </Button>
                )}
              </div>
              <div className="flex flex-col divide-y divide-ui-border-base">
                {types.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center gap-x-3 py-2.5 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedTypes.has(type.id)}
                      onCheckedChange={() => toggleType(type.id)}
                    />
                    <Text size="small">{type.value}</Text>
                  </label>
                ))}
              </div>
            </>
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
            <Text size="small" className="text-ui-fg-subtle">No product tags found.</Text>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTags.size === tags.length && tags.length > 0}
                    onCheckedChange={toggleAllTags}
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    {selectedTags.size > 0 ? `${selectedTags.size} selected` : "Select all"}
                  </Text>
                </label>
                {selectedTags.size > 0 && (
                  <Button variant="danger" size="small" disabled={busy} onClick={onBulkDeleteTags}>
                    {busy ? "Deleting…" : `Delete ${selectedTags.size} selected`}
                  </Button>
                )}
              </div>
              <div className="flex flex-col divide-y divide-ui-border-base">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-x-3 py-2.5 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedTags.has(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    <Text size="small">{tag.value}</Text>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

export default ProductTypeTagManagePage
