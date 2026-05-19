import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Users } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Switch,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"
import { OwnerPicker } from "../../components/owner-picker"

type Member = {
  id: string
  user_id: string
  enabled: boolean
  position: number
  last_picked_at: string | null
}

type AdminUser = { id: string; email: string; first_name?: string; last_name?: string }

const labelForUser = (
  userId: string,
  users: AdminUser[]
): string => {
  const u = users.find((u) => u.id === userId)
  if (!u) return userId
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim()
  return name ? `${name} (${u.email})` : u.email
}

const RotationPage = () => {
  const [rotation, setRotation] = useState<Member[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pickUserId, setPickUserId] = useState<string | null>(null)
  const [pickPosition, setPickPosition] = useState<string>("100")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    try {
      const [rotRes, userRes] = await Promise.all([
        fetch("/admin/rotation", { credentials: "include" }),
        fetch("/admin/users?limit=200", { credentials: "include" }),
      ])
      const rotJson = (await rotRes.json()) as { rotation: Member[] }
      const userJson = (await userRes.json()) as { users: AdminUser[] }
      setRotation(rotJson.rotation ?? [])
      setUsers(userJson.users ?? [])
    } catch (err: any) {
      toast.error(err?.message ?? "Load failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const add = async () => {
    if (!pickUserId) {
      toast.error("Pick a teammate first")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/admin/rotation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: pickUserId,
          position: Number.parseInt(pickPosition, 10) || 100,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Added to rotation")
      setPickUserId(null)
      setPickPosition("100")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Add failed")
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (userId: string, enabled: boolean) => {
    try {
      const res = await fetch(
        `/admin/rotation?user_id=${encodeURIComponent(userId)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        }
      )
      if (!res.ok) throw new Error(await res.text())
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Toggle failed")
    }
  }

  const remove = async (userId: string) => {
    if (!confirm("Remove this teammate from rotation?")) return
    try {
      const res = await fetch(
        `/admin/rotation?user_id=${encodeURIComponent(userId)}`,
        { method: "DELETE", credentials: "include" }
      )
      if (!res.ok) throw new Error(await res.text())
      toast.success("Removed")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Remove failed")
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          Owner rotation
          <HelpTooltip
            text={{
              title: "Customer / order owner rotation",
              body: "Staff members in rotation are auto-assigned new customers and orders on a round-robin basis (when OWNER_AUTOSTAMP_ENABLED is true). The rotation algorithm picks the enabled member with the oldest last_picked_at, with position as a tiebreaker.",
              bullets: [
                "Toggle a member off to pause them (e.g. on leave) without losing their history.",
                "Lower position numbers are picked first when last_picked_at is tied.",
                "An order placed by an already-owned customer inherits the customer's owner instead of rotating.",
                "Manual assignment from the customer-owner / order-owner widgets always wins over rotation.",
              ],
            }}
          />
        </Heading>
        <Badge color="blue">{rotation.length} in rotation</Badge>
      </div>

      <div className="px-6 py-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[260px]">
          <Text size="small" className="text-ui-fg-subtle mb-1">
            Add a teammate
          </Text>
          <OwnerPicker
            value={pickUserId}
            onChange={setPickUserId}
            placeholder="Pick a teammate to add…"
            includeUnassigned={false}
            disabled={saving}
          />
        </div>
        <div className="w-32">
          <Text size="small" className="text-ui-fg-subtle mb-1">
            Position
          </Text>
          <Input
            type="number"
            value={pickPosition}
            onChange={(e) => setPickPosition(e.target.value)}
            disabled={saving}
          />
        </div>
        <Button
          variant="primary"
          onClick={add}
          disabled={saving || !pickUserId}
        >
          Add to rotation
        </Button>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text className="text-ui-fg-muted text-sm">Loading…</Text>
        ) : rotation.length === 0 ? (
          <Text className="text-ui-fg-muted text-sm">
            No one in rotation yet. Add at least one teammate above for
            auto-assignment to work.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Teammate</Table.HeaderCell>
                <Table.HeaderCell>Position</Table.HeaderCell>
                <Table.HeaderCell>Last picked</Table.HeaderCell>
                <Table.HeaderCell>Enabled</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rotation.map((m) => (
                <Table.Row key={m.id}>
                  <Table.Cell>{labelForUser(m.user_id, users)}</Table.Cell>
                  <Table.Cell>{m.position}</Table.Cell>
                  <Table.Cell>
                    {m.last_picked_at
                      ? new Date(m.last_picked_at).toLocaleString()
                      : "—"}
                  </Table.Cell>
                  <Table.Cell>
                    <Switch
                      checked={m.enabled}
                      onCheckedChange={(v) => toggle(m.user_id, v)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => remove(m.user_id)}
                    >
                      Remove
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Owner rotation",
  icon: Users,
})

export default RotationPage
