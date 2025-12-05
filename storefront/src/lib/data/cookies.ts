import "server-only"
import { cookies } from "next/headers"

export const getAuthHeaders = async (): Promise<{ authorization: string } | {}> => {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (token) {
    return { authorization: `Bearer ${token}` }
  }

  return {}
}

export const setAuthToken = async (token: string) => {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookieStore = await cookies()
  return cookieStore.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_cart_id", "", { maxAge: -1 })
}
