import { Metadata } from "next"

import { getStoreName } from "@lib/util/env"
import {
  Placeholder,
  PolicyPage,
  PolicySection,
} from "@modules/policies/templates"

export const metadata: Metadata = {
  title: `Shipping | ${getStoreName()}`,
  description: "Where we deliver, what it costs and how long it takes.",
}

export default function ShippingPage() {
  return (
    <PolicyPage title="Shipping" example="your own shipping information">
      <PolicySection title="Where we deliver">
        {getStoreName()} delivers to the countries you can choose at checkout.
      </PolicySection>
      <PolicySection title="Delivery options and costs">
        The delivery options for your address, and what each one costs, are
        shown at checkout before you pay.
      </PolicySection>
      <PolicySection title="Delivery times">
        <Placeholder>
          How soon you send an order, and how long each delivery option usually
          takes to arrive.
        </Placeholder>
      </PolicySection>
    </PolicyPage>
  )
}
