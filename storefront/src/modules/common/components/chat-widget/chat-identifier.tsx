"use client"

import { useEffect } from "react"

import { getCustomer } from "@lib/data/customer"

type Customer = {
  email?: string | null
  first_name?: string | null
  last_name?: string | null
}

const setCrispUser = (customer: Customer) => {
  const crisp = (window as any).$crisp as any[] | undefined
  if (!Array.isArray(crisp)) return
  if (customer.email) crisp.push(["set", "user:email", [customer.email]])
  const name = [customer.first_name, customer.last_name]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ")
    .trim()
  if (name.length > 0) crisp.push(["set", "user:nickname", [name]])
}

const setTidioUser = (customer: Customer) => {
  const api = (window as any).tidioChatApi
  if (!api || typeof api.setVisitorData !== "function") return
  api.setVisitorData({
    email: customer.email ?? undefined,
    name: [customer.first_name, customer.last_name]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" ") || undefined,
  })
}

const waitForWidget = (
  provider: "crisp" | "tidio",
  customer: Customer,
  attempts = 0
): void => {
  const max = 60
  const ready =
    provider === "crisp"
      ? Array.isArray((window as any).$crisp) &&
        (window as any).$crisp.push !== undefined
      : typeof (window as any).tidioChatApi?.setVisitorData === "function"

  if (ready) {
    if (provider === "crisp") setCrispUser(customer)
    else setTidioUser(customer)
    return
  }
  if (attempts >= max) return
  window.setTimeout(() => waitForWidget(provider, customer, attempts + 1), 500)
}

const ChatIdentifier = ({ provider }: { provider: "crisp" | "tidio" }) => {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const customer = await getCustomer()
        if (cancelled || !customer) return
        waitForWidget(provider, customer as Customer)
      } catch {
        // Anonymous — nothing to do.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [provider])

  return null
}

export default ChatIdentifier
