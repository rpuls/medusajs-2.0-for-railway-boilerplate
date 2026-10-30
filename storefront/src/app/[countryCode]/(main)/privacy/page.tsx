import { Metadata } from "next"

import { getStoreName } from "@lib/util/env"
import {
  Placeholder,
  PolicyPage,
  PolicySection,
} from "@modules/policies/templates"

export const metadata: Metadata = {
  title: `Privacy policy | ${getStoreName()}`,
  description: "What personal data this store handles and why.",
}

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy policy" example="your own privacy policy">
      <PolicySection title="What you give us">
        When you order, {getStoreName()} receives the details you enter at
        checkout: your name, email address, delivery and billing address and, if
        you give it, your phone number. If you create an account, your orders
        are kept with it.
      </PolicySection>
      <PolicySection title="What we use it for">
        <Placeholder>
          What you use these details for, such as delivering orders and
          answering questions, and on which legal basis.
        </Placeholder>
      </PolicySection>
      <PolicySection title="Who else sees it">
        <Placeholder>
          The services that handle these details for you, such as your payment
          provider, hosting and email service.
        </Placeholder>
      </PolicySection>
      <PolicySection title="Your rights">
        <Placeholder>
          How long you keep personal data, and how customers can ask for a copy
          or have it deleted.
        </Placeholder>
      </PolicySection>
    </PolicyPage>
  )
}
