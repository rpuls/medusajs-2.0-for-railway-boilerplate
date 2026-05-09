import { getCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"
import { PostHogIdentify } from "@modules/common/components/posthog-identify"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await getCustomer().catch(() => null)

  return (
    <>
      <PostHogIdentify customer={customer} />
      <AccountLayout customer={customer}>
        {customer ? dashboard : login}
      </AccountLayout>
    </>
  )
}
