import { Metadata } from "next"

import ProudMaryPage from "./proud-mary-page"

type Params = { params: Promise<{ countryCode: string }> }

export const metadata: Metadata = {
  title: "Proud Mary — Daniel Mudie Cunningham",
  description:
    "Proud Mary, 2007, 2012, 2017, 2022, ongoing. HD four channel video with sound.",
}

export default async function ProudMary({ params }: Params) {
  const { countryCode } = await params
  return <ProudMaryPage countryCode={countryCode} />
}
