"use client"

import { Badge, Heading, Switch, Text, clx } from "@medusajs/ui"
import React, { useState, useTransition } from "react"

import { phCapture } from "@lib/posthog"
import { updateConsent, type ConsentState } from "@lib/data/consent"

type Props = {
  initial: ConsentState | null
}

type ConsentKey =
  | "marketing_consent_email"
  | "marketing_consent_sms"
  | "marketing_consent_retargeting"

const ROWS: Array<{
  key: ConsentKey
  label: string
  description: string
}> = [
  {
    key: "marketing_consent_email",
    label: "Marketing emails",
    description:
      "Reorder reminders, win-back offers, abandoned cart reminders, product news.",
  },
  {
    key: "marketing_consent_sms",
    label: "SMS updates",
    description:
      "Order milestones and time-sensitive offers via text. (Coming soon.)",
  },
  {
    key: "marketing_consent_retargeting",
    label: "Retargeting & advertising",
    description:
      "Allow us to show personalised ads on other sites based on your activity here.",
  },
]

const ProfileMarketingConsent: React.FC<Props> = ({ initial }) => {
  const [state, setState] = useState<Record<ConsentKey, boolean>>({
    marketing_consent_email: initial?.marketing_consent_email ?? true,
    marketing_consent_sms: initial?.marketing_consent_sms ?? false,
    marketing_consent_retargeting:
      initial?.marketing_consent_retargeting ?? false,
  })
  const [savedAt, setSavedAt] = useState<string | null>(
    initial?.marketing_consent_updated_at ?? null
  )
  const [error, setError] = useState<string | null>(null)
  const [savedBadge, setSavedBadge] = useState(false)
  const [, startTransition] = useTransition()

  const handleToggle = (key: ConsentKey, next: boolean) => {
    const previous = state[key]
    setState((s) => ({ ...s, [key]: next }))
    setError(null)
    setSavedBadge(false)

    startTransition(async () => {
      const result = await updateConsent({ [key]: next })
      if (!result.ok) {
        setError(result.error)
        setState((s) => ({ ...s, [key]: previous }))
        return
      }
      setSavedAt(result.consent.marketing_consent_updated_at)
      setSavedBadge(true)
      phCapture("consent_changed", {
        key,
        value: next,
        source: "profile",
      })
      window.setTimeout(() => setSavedBadge(false), 2000)
    })
  }

  return (
    <div
      className="w-full text-small-regular"
      data-testid="marketing-consent-section"
    >
      <div className="flex items-end justify-between mb-4">
        <div className="flex flex-col">
          <Heading level="h2" className="text-large-semi">
            Marketing preferences
          </Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Control which messages SC Prints can send you. Order receipts and
            shipping updates are always sent.
          </Text>
        </div>
        {savedBadge && (
          <Badge color="green" className="p-2">
            Saved
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-y-4">
        {ROWS.map(({ key, label, description }) => (
          <label
            key={key}
            className={clx(
              "flex items-start justify-between gap-x-4 p-4",
              "border border-ui-border-base rounded-md bg-ui-bg-base",
              "cursor-pointer"
            )}
            htmlFor={`consent-${key}`}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-ui-fg-base">{label}</span>
              <Text className="text-ui-fg-subtle">{description}</Text>
            </div>
            <Switch
              id={`consent-${key}`}
              checked={state[key]}
              onCheckedChange={(next) => handleToggle(key, next)}
              data-testid={`consent-toggle-${key}`}
            />
          </label>
        ))}
      </div>

      {error && (
        <Badge color="red" className="p-2 mt-4">
          {error}
        </Badge>
      )}
      {savedAt && (
        <Text className="text-ui-fg-muted mt-3 text-xs">
          Last updated {new Date(savedAt).toLocaleString()}
        </Text>
      )}
    </div>
  )
}

export default ProfileMarketingConsent
