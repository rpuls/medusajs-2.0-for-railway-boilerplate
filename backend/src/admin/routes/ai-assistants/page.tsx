import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Robot } from '@medusajs/icons'
import { Badge, Button, Container, Copy, Heading, StatusBadge, Table, Text, toast, usePrompt } from '@medusajs/ui'
import { useCallback, useEffect, useState } from 'react'
import { SetupProposals } from '../../components/setup-proposals'
import { formatDate, type StoreMcpOverview, type Suggestion, storeMcp } from '../../lib/store-mcp'

/**
 * Where an admin connects AI assistants to the store and sees, and revokes, the ones that are
 * connected. The server behind it is backend/src/store-mcp; docs/store-mcp.md explains it.
 */
const AiAssistantsPage = () => {
  const [overview, setOverview] = useState<StoreMcpOverview | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const prompt = usePrompt()

  const load = useCallback(async () => {
    try {
      const [data, pending] = await Promise.all([storeMcp.overview(), storeMcp.suggestions()])
      setOverview(data)
      setSuggestions(pending.suggestions)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const revoke = async (id: string, appName: string) => {
    const confirmed = await prompt({
      title: `Disconnect ${appName}?`,
      description: 'It loses access immediately. To use it again, connect it again from the app.',
      confirmText: 'Disconnect',
      cancelText: 'Cancel',
    })
    if (!confirmed) return
    try {
      await storeMcp.revoke(id)
      toast.success(`${appName} is disconnected`)
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  if (error) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">Could not load the AI assistants page: {error}</Text>
      </Container>
    )
  }
  if (!overview) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-subtle">Loading…</Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">AI assistants</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Let ChatGPT, Claude or any other MCP client work on this store. They sign in as you, on this
              backend, and can only use the tools listed below.
            </Text>
          </div>
          <StatusBadge color={overview.enabled ? 'green' : 'grey'}>{overview.enabled ? 'On' : 'Off'}</StatusBadge>
        </div>

        {overview.enabled ? (
          <div className="flex flex-col gap-y-4 px-6 py-4">
            <div>
              <Text size="small" weight="plus">
                Server URL
              </Text>
              <div className="mt-1 flex items-center gap-x-2">
                <code className="bg-ui-bg-subtle txt-compact-small rounded-md px-2 py-1" data-testid="store-mcp-url">
                  {overview.mcp_url}
                </code>
                <Copy content={overview.mcp_url} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Text size="small" weight="plus">
                  ChatGPT
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  Turn on developer mode in the settings, create an app or connector, paste the URL and choose
                  OAuth. ChatGPT then opens a page here where you sign in and click Allow.
                </Text>
              </div>
              <div>
                <Text size="small" weight="plus">
                  Claude, and other MCP clients
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  Add a custom connector, or a remote MCP server, with the URL. The app opens a page here where
                  you sign in and click Allow.
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              The store MCP server is turned off with STORE_MCP_ENABLED=false on the backend. Remove that
              variable and redeploy to turn it on.
            </Text>
          </div>
        )}

        <div className="grid gap-6 px-6 py-4 md:grid-cols-2">
          <div>
            <Text size="small" weight="plus">
              Connected apps can
            </Text>
            <ul className="text-ui-fg-subtle txt-small mt-1 list-disc pl-5">
              {overview.can.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <Text size="small" weight="plus">
              They cannot
            </Text>
            <ul className="text-ui-fg-subtle txt-small mt-1 list-disc pl-5">
              {overview.cannot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Connected apps</Heading>
        </div>
        {overview.connected_apps.length === 0 ? (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              No apps are connected yet.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>App</Table.HeaderCell>
                <Table.HeaderCell>Acts as</Table.HeaderCell>
                <Table.HeaderCell>Connected</Table.HeaderCell>
                <Table.HeaderCell>Last used</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {overview.connected_apps.map((app) => (
                <Table.Row key={app.id}>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <span>{app.app_name}</span>
                      {app.app_host ? <span className="text-ui-fg-subtle txt-compact-xsmall">{app.app_host}</span> : null}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{app.admin_email ?? 'Deleted user'}</Table.Cell>
                  <Table.Cell>{formatDate(app.connected_at)}</Table.Cell>
                  <Table.Cell>{formatDate(app.last_used_at)}</Table.Cell>
                  <Table.Cell className="text-right">
                    <Button size="small" variant="secondary" onClick={() => revoke(app.id, app.app_name)}>
                      Disconnect
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <SetupProposals />

      <Container className="divide-y p-0">
        <div className="flex items-center gap-x-2 px-6 py-4">
          <Heading level="h2">Waiting for review</Heading>
          <Badge size="2xsmall">{suggestions.length}</Badge>
        </div>
        {suggestions.length === 0 ? (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              Changes an assistant suggests for a product show up here and on that product's page, where you apply
              or discard them. New products it drafts appear under Products with the status Draft.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Body>
              {suggestions.map((suggestion) => (
                <Table.Row key={suggestion.id}>
                  <Table.Cell>
                    <a className="text-ui-fg-interactive hover:underline" href={`/app/products/${suggestion.product_id}`}>
                      {suggestion.product_title ?? suggestion.product_id}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{Object.keys(suggestion.changes).join(', ')}</Table.Cell>
                  <Table.Cell>{suggestion.app_name}</Table.Cell>
                  <Table.Cell>{formatDate(suggestion.created_at)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: 'AI assistants',
  icon: Robot,
})

export default AiAssistantsPage
