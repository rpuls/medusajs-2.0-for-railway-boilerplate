"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface CartContextType {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleCart = () => setIsOpen((prev) => !prev)

  return (
    <CartContext.Provider value={{ isOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartDrawer() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCartDrawer must be used within a CartProvider")
  }
  return context
}

