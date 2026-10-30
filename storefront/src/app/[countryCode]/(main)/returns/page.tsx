import { Metadata } from "next"

import { getStoreName } from "@lib/util/env"
import {
  Placeholder,
  PolicyPage,
  PolicySection,
} from "@modules/policies/templates"

export const metadata: Metadata = {
  title: `Returns | ${getStoreName()}`,
  description: "How to return an item and how refunds work.",
}

export default function ReturnsPage() {
  return (
    <PolicyPage title="Returns" example="your own return policy">
      <PolicySection title="Returning an item">
        <Placeholder>
          How many days customers have to return an item, what condition it must
          be in, and who pays for return shipping.
        </Placeholder>
      </PolicySection>
      <PolicySection title="Refunds">
        <Placeholder>
          How and when a refund is paid once a return arrives.
        </Placeholder>
      </PolicySection>
      <PolicySection title="Questions about an order">
        <Placeholder>
          How customers can reach you, for example an email address.
        </Placeholder>
      </PolicySection>
    </PolicyPage>
  )
}
