import { SparklesMini } from '@medusajs/icons'
import { Alert, Badge, Button, Container, Heading, Text, toast, usePrompt } from '@medusajs/ui'
import { useCallback, useEffect, useState } from 'react'
import { formatDate, type SetupProposal, storeMcp } from '../lib/store-mcp'

type Props = {
  /** Render nothing at all when there is nothing to review, for use on other pages */
  hideWhenEmpty?: boolean
  /** Reload the page after an Apply, because the rest of it shows the setup as it was */
  reloadOnApply?: boolean
}

/**
 * Stock, warehouses, regions, shipping and tax rates an AI assistant proposed, each as the plain-language steps
 * Apply would run. Those steps are planned by the backend against the store as it is now, so
 * what the admin reads here is what happens. Used on the AI assistants page and the regions list.
 */
export const SetupProposals = ({ hideWhenEmpty, reloadOnApply }: Props) => {
  const [proposals, setProposals] = useState<SetupProposal[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const prompt = usePrompt()

  const load = useCallback(() => {
    storeMcp
      .setupProposals()
      .then(({ proposals }) => setProposals(proposals))
      .catch(() => setProposals([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resolve = async (proposal: SetupProposal, action: 'apply' | 'discard') => {
    if (action === 'apply') {
      const confirmed = await prompt({
        title: 'Apply these changes?',
        description: 'Shoppers see the changes at checkout right away. Undo them in Settings if you need to.',
        confirmText: 'Apply',
        cancelText: 'Cancel',
      })
      if (!confirmed) return
    }
    setBusy(proposal.id)
    try {
      const { proposal: updated } = await storeMcp.resolveSetup(proposal.id, action)
      if (updated.status === 'failed') {
        toast.error(`Stopped at "${updated.result?.failed}": ${updated.result?.error}`)
      } else if (action === 'apply') {
        toast.success('Changes applied')
        if (reloadOnApply) {
          window.location.reload()
          return
        }
      } else {
        toast.success('Proposal discarded')
      }
      load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  if (proposals === null || (hideWhenEmpty && proposals.length === 0)) return null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center gap-x-2 px-6 py-4">
        <SparklesMini className="text-ui-fg-interactive" />
        <Heading level="h2">Proposals waiting for you</Heading>
        <Badge size="2xsmall">{proposals.length}</Badge>
      </div>
      {proposals.length === 0 ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Stock, warehouses, regions, shipping and tax rates an assistant proposes show up here. Nothing changes until you apply them.
          </Text>
        </div>
      ) : (
        proposals.map((proposal) => (
          <div key={proposal.id} className="flex flex-col gap-y-3 px-6 py-4" data-testid="setup-proposal">
            <div>
              <Text size="small" className="text-ui-fg-subtle">
                From {proposal.app_name}, {formatDate(proposal.created_at)}
              </Text>
              <Text size="small" weight="plus">
                {proposal.summary}
              </Text>
            </div>
            {proposal.status === 'failed' ? (
              <Alert variant="error">
                Stopped at "{proposal.result?.failed}": {proposal.result?.error}
                {proposal.result?.done.length ? ` Done before that: ${proposal.result.done.join(' ')}` : ' Nothing was changed.'}
              </Alert>
            ) : (
              <ul className="txt-small list-disc pl-5">
                {proposal.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            )}
            {proposal.warnings.map((warning) => (
              <Alert key={warning} variant="warning">
                {warning}
              </Alert>
            ))}
            {proposal.errors.length ? (
              <Alert variant="error">Can no longer be applied: {proposal.errors.join(' ')}</Alert>
            ) : null}
            <div className="flex justify-end gap-x-2">
              <Button size="small" variant="secondary" disabled={busy === proposal.id} onClick={() => resolve(proposal, 'discard')}>
                Discard
              </Button>
              {proposal.status === 'pending' ? (
                <Button
                  size="small"
                  disabled={busy === proposal.id || proposal.errors.length > 0}
                  onClick={() => resolve(proposal, 'apply')}
                >
                  Apply
                </Button>
              ) : null}
            </div>
          </div>
        ))
      )}
    </Container>
  )
}
