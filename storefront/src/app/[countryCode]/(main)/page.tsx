import { Metadata } from "next"
import { getProductsList } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import CloudPawsClient from "./cloud-paws-client"

export const metadata: Metadata = {
  title: "CloudPaws - Where Exceptional Cats Rest",
  description: "Handcrafted luxury blankets for the modern feline",
}

export default async function HomePage({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  // Fetch real products from your Medusa backend
  const { products } = await getProductsList({
    pageParam: 0,
    queryParams: { limit: 3 },
    countryCode,
  })
  
  const region = await getRegion(countryCode)

  return <CloudPawsClient products={products} region={region} />
}
