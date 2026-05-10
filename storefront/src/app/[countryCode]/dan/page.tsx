import { Metadata } from "next"

import DanHome from "./dan-home"

type Params = { params: Promise<{ countryCode: string }> }

export const metadata: Metadata = {
  title: "Daniel Mudie Cunningham",
  description: "Curation, Creation, Criticism",
}

export default async function DanPage({ params }: Params) {
  const { countryCode } = await params
  return <DanHome countryCode={countryCode} />
}
