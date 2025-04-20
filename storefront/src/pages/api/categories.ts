import { NextResponse } from "next/server"
import { getCategoriesList } from "@lib/data/categories"

export async function GET() {
  const data = await getCategoriesList(0, 100)
  return NextResponse.json(data)
}
