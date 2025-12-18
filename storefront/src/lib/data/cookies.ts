import "server-only"
import { cookies } from "next/headers"

export const getAuthHeaders = async (): Promise<{ authorization: string } | {}> => {
  const cookiesStore = await cookies()
  const token = cookiesStore.get("_medusa_jwt")?.value

  if (token) {
    return { authorization: `Bearer ${token}` }
  }

  return {}
}

export const setAuthToken = async (token: string) => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookiesStore = await cookies()
  return cookiesStore.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_cart_id", "", { maxAge: -1 })
}
