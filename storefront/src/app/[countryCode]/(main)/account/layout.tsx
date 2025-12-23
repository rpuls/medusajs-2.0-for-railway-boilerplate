import { getCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"
import { Suspense } from "react"
import { connection } from "next/server"

// Account layout accesses user-specific data (cookies) - must be deferred to request time
// Use connection() to explicitly defer to request time
export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  // Explicitly defer to request time since we access cookies
  // This prevents the layout from being prerendered
  await connection()
  
  const customer = await getCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
    </AccountLayout>
  )
}
