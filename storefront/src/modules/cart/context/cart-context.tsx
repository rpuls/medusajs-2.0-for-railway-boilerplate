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
    // Return a no-op implementation if outside CartProvider
    // This allows components to be used in different contexts
    console.warn('useCartDrawer is being used outside of CartProvider, returning no-op implementation')
    return {
      isOpen: false,
      openCart: () => console.warn('openCart called outside CartProvider'),
      closeCart: () => console.warn('closeCart called outside CartProvider'),
      toggleCart: () => console.warn('toggleCart called outside CartProvider'),
    }
  }
  return context
}

