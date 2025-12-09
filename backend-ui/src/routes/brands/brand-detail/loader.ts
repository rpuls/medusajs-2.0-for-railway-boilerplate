import { LoaderFunctionArgs } from "react-router-dom"
import { backendUrl } from "../../../lib/client"

export const brandLoader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params

  if (!id) {
    throw new Error("Brand ID is required")
  }

  try {
    const response = await fetch(`${backendUrl}/admin/brands/${id}`, {
      credentials: "include",
    })
    if (!response.ok) {
      throw new Error("Failed to fetch brand")
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

