import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { AdminProduct, DetailWidgetProps } from '@medusajs/framework/types'
import { SparklesMini } from '@medusajs/icons'
import { Badge, Button, Container, Heading, Text, toast } from '@medusajs/ui'
import { useCallback, useEffect, useState } from 'react'
import { formatDate, type Suggestion, type SuggestionChanges, storeMcp } from '../lib/store-mcp'

const LABELS: Record<keyof SuggestionChanges, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  description: 'Description',
  category_ids: 'Categories',
}

const current = (product: AdminProduct, field: keyof SuggestionChanges): string => {
  if (field === 'category_ids') return (product.categories ?? []).map((c) => c.name).join(', ') || 'None'
  return (product[field] as string | null) || 'Empty'
}

const suggested = (changes: SuggestionChanges, field: keyof SuggestionChanges): string => {
  const value = changes[field]
  if (Array.isArray(value)) return `${value.length} categor${value.length === 1 ? 'y' : 'ies'}`
  return value ?? ''
}

/**
 * Shows the changes AI assistants suggested for this product, on the product page itself, so
 * the admin reviews them in context. Renders nothing when there are none. An assistant cannot
 * change a published product; this widget is the only way its suggestion reaches the store.
 */
const ProductAiSuggestions = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    storeMcp
      .suggestions(product.id)
      .then(({ suggestions }) => setSuggestions(suggestions))
      .catch(() => setSuggestions([]))
  }, [product.id])

  useEffect(() => {
    load()
  }, [load])

  const resolve = async (id: string, action: 'apply' | 'discard') => {
    setBusy(id)
    try {
      await storeMcp.resolve(id, action)
      if (action === 'apply') {
        toast.success('Suggestion applied')
        // The rest of the page holds the product as it was; reload so every section shows the change
        window.location.reload()
        return
      }
      toast.success('Suggestion discarded')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  if (suggestions.length === 0) return null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center gap-x-2 px-6 py-4">
        <SparklesMini className="text-ui-fg-interactive" />
        <Heading level="h2">Suggested by AI</Heading>
        <Badge size="2xsmall">{suggestions.length}</Badge>
      </div>
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="flex flex-col gap-y-3 px-6 py-4" data-testid="ai-suggestion">
          <Text size="small" className="text-ui-fg-subtle">
            From {suggestion.app_name}, {formatDate(suggestion.created_at)}
            {suggestion.note ? `: ${suggestion.note}` : ''}
          </Text>
          {(Object.keys(suggestion.changes) as Array<keyof SuggestionChanges>).map((field) => (
            <div key={field} className="grid grid-cols-[110px_1fr] gap-x-3">
              <Text size="small" weight="plus">
                {LABELS[field] ?? field}
              </Text>
              <div className="flex flex-col gap-y-1">
                <Text size="small" className="text-ui-fg-muted line-through">
                  {current(product, field)}
                </Text>
                <Text size="small" className="whitespace-pre-wrap">
                  {suggested(suggestion.changes, field)}
                </Text>
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-x-2">
            <Button size="small" variant="secondary" disabled={busy === suggestion.id} onClick={() => resolve(suggestion.id, 'discard')}>
              Discard
            </Button>
            <Button size="small" disabled={busy === suggestion.id} onClick={() => resolve(suggestion.id, 'apply')}>
              Apply
            </Button>
          </div>
        </div>
      ))}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.details.before',
})

export default ProductAiSuggestions
