import { Metadata } from "next"

import ProfilePhone from "@modules/account//components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileMarketingConsent from "@modules/account/components/profile-marketing-consent"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"

import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { getConsent } from "@lib/data/consent"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your SC PRINTS profile.",
}

export default async function Profile() {
  const customer = await getCustomer()
  const regions = await listRegions()
  const consent = await getConsent()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <header className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          Your details
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          Profile
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ui-fg-subtle small:text-base">
          View and update your profile information, including your name,
          email, and phone number. You can also update your billing address,
          or change your password.
        </p>
      </header>
      <div className="flex flex-col gap-y-8 w-full">
        <ProfileName customer={customer} />
        <Divider />
        <ProfileEmail customer={customer} />
        <Divider />
        <ProfilePhone customer={customer} />
        <Divider />
        <ProfilePassword customer={customer} />
        <Divider />
        <ProfileMarketingConsent initial={consent} />
        <Divider />
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}
