import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { AdminProduct, DetailWidgetProps } from '@medusajs/framework/types'
import { SparklesMini } from '@medusajs/icons'
import { Button, Container, Heading, Text, toast, usePrompt } from '@medusajs/ui'
import { useState } from 'react'
import { publishProduct } from '../lib/store-mcp'

/**
 * On a draft an AI assistant created, says so and offers Publish in one click. Publishing stays
 * a human decision, and no tool can do it; without this the admin finds it four clicks deep in
 * the edit drawer, which is the step right after every "add this product" request.
 */
const ProductAiDraft = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const [busy, setBusy] = useState(false)
  const prompt = usePrompt()
  const app = product.metadata?.store_mcp_app

  if (product.status !== 'draft' || typeof app !== 'string') return null

  const publish = async () => {
    const confirmed = await prompt({
      title: `Publish ${product.title}?`,
      description: 'Shoppers can see and buy it right away.',
      confirmText: 'Publish',
      cancelText: 'Cancel',
    })
    if (!confirmed) return
    setBusy(true)
    try {
      await publishProduct(product.id)
      toast.success('Product published')
      // The rest of the page still shows the draft status
      window.location.reload()
    } catch (e) {
      toast.error((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <Container className="flex items-center justify-between gap-x-4 px-6 py-4" data-testid="ai-draft">
      <div className="flex items-start gap-x-2">
        <SparklesMini className="text-ui-fg-interactive mt-0.5" />
        <div>
          <Heading level="h2">Drafted by {app}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Shoppers do not see it until you publish it. Check the texts, prices and stock below first.
          </Text>
        </div>
      </div>
      <Button size="small" disabled={busy} onClick={publish}>
        Publish
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.details.before',
})

export default ProductAiDraft
