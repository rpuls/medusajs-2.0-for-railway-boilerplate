import { Metadata } from "next"

import BlehAnimation from "./bleh-animation"

export const metadata: Metadata = { title: "Bleh" }

export default function BlehPage() {
  return <BlehAnimation />
}
