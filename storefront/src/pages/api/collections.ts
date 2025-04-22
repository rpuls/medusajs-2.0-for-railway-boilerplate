import { NextResponse } from "next/server"
import { getCollectionsList } from "@lib/data/collections"

export async function GET() {
  const data = await getCollectionsList(0, 100)
  return NextResponse.json(data)
}
