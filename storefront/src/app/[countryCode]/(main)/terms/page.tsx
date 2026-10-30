import { Metadata } from "next"

import { getStoreName } from "@lib/util/env"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Placeholder,
  PolicyPage,
  PolicySection,
} from "@modules/policies/templates"

export const metadata: Metadata = {
  title: `Terms of service | ${getStoreName()}`,
  description: "The terms that apply to orders placed in this store.",
}

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of service" example="your own terms of service">
      <PolicySection title="Who we are">
        <Placeholder>
          Your company name, address and registration details.
        </Placeholder>
      </PolicySection>
      <PolicySection title="Orders">
        <Placeholder>
          When an order becomes binding, and what happens if an item turns out
          to be unavailable.
        </Placeholder>
      </PolicySection>
      <PolicySection title="Prices and payment">
        Prices are shown in the currency of the country you shop in.{" "}
        <Placeholder>
          Whether prices include tax, and which payment methods you accept.
        </Placeholder>
      </PolicySection>
      <PolicySection title="Delivery and returns">
        See{" "}
        <LocalizedClientLink href="/shipping" className="underline">
          shipping
        </LocalizedClientLink>{" "}
        and{" "}
        <LocalizedClientLink href="/returns" className="underline">
          returns
        </LocalizedClientLink>
        .
      </PolicySection>
      <PolicySection title="Applicable law">
        <Placeholder>
          The law that applies, and where disputes are settled.
        </Placeholder>
      </PolicySection>
    </PolicyPage>
  )
}
