import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tools } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

type Recipe = {
  id: string
  name: string
  description: string | null
  decoration_method: string
  product_id: string | null
  customer_id: string | null
  recipe_json: Record<string, unknown>
  notes: string | null
  is_archived: boolean
  last_used_at: string | null
  created_at: string
}

const METHOD_LABELS: Record<string, string> = {
  screen_print: "Screen print",
  dtf: "DTF",
  embroidery: "Embroidery",
  uv: "UV",
  digital_transfer: "Digital transfer",
  vinyl: "Vinyl",
  other: "Other",
}

const METHODS = Object.keys(METHOD_LABELS)

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-AU") : "—"

const PrintRecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Recipe | null>(null)

  // New-recipe form
  const [open, setOpen] = useState(false)
  const [nName, setNName] = useState("")
  const [nMethod, setNMethod] = useState<string>("screen_print")
  const [nDescription, setNDescription] = useState("")
  const [nNotes, setNNotes] = useState("")
  const [nRecipeJson, setNRecipeJson] = useState('{\n  \n}')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (methodFilter !== "all") params.set("decoration_method", methodFilter)
    try {
      const res = await fetch(`/admin/print-recipes?${params.toString()}`, {
        credentials: "include",
      })
      const json = (await res.json()) as { recipes?: Recipe[] }
      setRecipes(json.recipes ?? [])
    } catch {
      toast.error("Failed to load recipes")
    } finally {
      setLoading(false)
    }
  }, [search, methodFilter])

  useEffect(() => {
    load()
  }, [load])

  const submitNew = async () => {
    if (!nName.trim()) {
      toast.error("Name required")
      return
    }
    let parsedJson: Record<string, unknown> = {}
    if (nRecipeJson.trim()) {
      try {
        parsedJson = JSON.parse(nRecipeJson)
      } catch {
        toast.error("Recipe JSON is not valid JSON")
        return
      }
    }
    setSaving(true)
    try {
      const res = await fetch("/admin/print-recipes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nName.trim(),
          decoration_method: nMethod,
          description: nDescription.trim() || undefined,
          notes: nNotes.trim() || undefined,
          recipe_json: parsedJson,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Recipe saved")
      setOpen(false)
      setNName("")
      setNDescription("")
      setNNotes("")
      setNRecipeJson('{\n  \n}')
      await load()
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          Print recipes
          <HelpTooltip
            text={{
              title: "Print recipe library",
              body: "Reusable production recipes — mesh count, flash temp, ink type, embroidery digitization file location, etc. Pin them to a product, design, or customer so a new operator can run a returning customer's job exactly the way it worked last time.",
              bullets: [
                "decoration_method narrows the recipe to the technique you're using.",
                "recipe_json is freeform — capture whatever the operator needs (per technique).",
                "Last used: stamped whenever a recipe is linked to an order. Sort by it to find the recipes you reach for most.",
                "Link to orders from the order detail page so future reorders can find the recipe via the customer's history.",
                "Archive (don't delete) when a recipe is retired so audit trails stay intact.",
              ],
            }}
          />
        </Heading>
        <div className="flex items-center gap-x-2">
          <Badge color="blue">{recipes.length} shown</Badge>
          <Button size="small" onClick={() => setOpen((v) => !v)}>
            {open ? "Cancel" : "New recipe"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <Label size="xsmall">Search</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="name, notes, description"
          />
        </div>
        <div>
          <Label size="xsmall">Method</Label>
          <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v)}>
            <Select.Trigger className="w-48">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All</Select.Item>
              {METHODS.map((m) => (
                <Select.Item key={m} value={m}>
                  {METHOD_LABELS[m]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>

      {open ? (
        <div className="px-6 py-4 grid grid-cols-1 small:grid-cols-2 gap-3">
          <div>
            <Label size="xsmall">Name</Label>
            <Input
              value={nName}
              onChange={(e) => setNName(e.target.value)}
              placeholder="e.g. Marrickville Lions hoodie front print"
            />
          </div>
          <div>
            <Label size="xsmall">Method</Label>
            <Select value={nMethod} onValueChange={(v) => setNMethod(v)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {METHODS.map((m) => (
                  <Select.Item key={m} value={m}>
                    {METHOD_LABELS[m]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="small:col-span-2">
            <Label size="xsmall">Short description</Label>
            <Input
              value={nDescription}
              onChange={(e) => setNDescription(e.target.value)}
              placeholder="One-line description for the library"
            />
          </div>
          <div className="small:col-span-2">
            <Label size="xsmall">Notes</Label>
            <Textarea
              rows={3}
              value={nNotes}
              onChange={(e) => setNNotes(e.target.value)}
              placeholder="Operator notes, gotchas, links to digitization files…"
            />
          </div>
          <div className="small:col-span-2">
            <Label size="xsmall">Recipe details (JSON)</Label>
            <Textarea
              rows={6}
              value={nRecipeJson}
              onChange={(e) => setNRecipeJson(e.target.value)}
              className="font-mono text-xs"
              placeholder='{ "mesh_count": 156, "flash_temp_c": 110, "ink": "white_plastisol" }'
            />
          </div>
          <div className="small:col-span-2 flex justify-end">
            <Button size="small" onClick={submitNew} disabled={saving}>
              Save recipe
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0">
        <div className="border-r border-ui-border-base">
          {loading ? (
            <Text className="p-6 text-ui-fg-muted text-sm">Loading…</Text>
          ) : recipes.length === 0 ? (
            <Text className="p-6 text-ui-fg-muted text-sm">No recipes.</Text>
          ) : (
            <ul className="divide-y">
              {recipes.map((r) => (
                <li
                  key={r.id}
                  className={`px-6 py-3 cursor-pointer hover:bg-ui-bg-subtle ${selected?.id === r.id ? "bg-ui-bg-subtle" : ""}`}
                  onClick={() => setSelected(r)}
                >
                  <div className="flex items-center justify-between">
                    <Text weight="plus">{r.name}</Text>
                    <Badge color="grey">{METHOD_LABELS[r.decoration_method] ?? r.decoration_method}</Badge>
                  </div>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {r.description ?? ""}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Last used {fmtDate(r.last_used_at)}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6">
          {!selected ? (
            <Text className="text-ui-fg-muted text-sm">
              Pick a recipe on the left to view its details.
            </Text>
          ) : (
            <div className="flex flex-col gap-y-3">
              <Heading level="h2">{selected.name}</Heading>
              <Text size="xsmall" className="text-ui-fg-muted">
                {METHOD_LABELS[selected.decoration_method] ?? selected.decoration_method}
                {selected.last_used_at ? ` · last used ${fmtDate(selected.last_used_at)}` : ""}
              </Text>
              {selected.description ? (
                <Text size="small">{selected.description}</Text>
              ) : null}
              {selected.notes ? (
                <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-3 whitespace-pre-wrap">
                  <Text size="small">{selected.notes}</Text>
                </div>
              ) : null}
              <pre className="text-xs bg-ui-bg-subtle p-3 rounded overflow-x-auto">
                {JSON.stringify(selected.recipe_json ?? {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Print recipes",
  icon: Tools,
})

export default PrintRecipesPage
