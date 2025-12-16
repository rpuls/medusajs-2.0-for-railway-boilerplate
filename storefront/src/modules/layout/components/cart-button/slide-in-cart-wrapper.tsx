'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useCartDrawer } from '@modules/cart/context/cart-context'
import { HttpTypes } from '@medusajs/types'

// Client Component wrapper for slide-in cart (ssr: false)
const SlideInCart = dynamic(
  () => import('@modules/cart/components/slide-in-cart'),
  {
    ssr: false,
  }
)

interface SlideInCartWrapperProps {
  cart: HttpTypes.StoreCart | null
}

export default function SlideInCartWrapper({ cart: initialCart }: SlideInCartWrapperProps) {
  const router = useRouter()
  const { isOpen } = useCartDrawer()
  const [cart, setCart] = useState(initialCart)

  // Refresh cart data when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Refresh router to get latest cart data
      router.refresh()
      // Update cart state after a short delay to allow refresh
      const timer = setTimeout(() => {
        setCart(initialCart)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, router])

  // Update cart when initialCart changes (from router.refresh)
  useEffect(() => {
    setCart(initialCart)
  }, [initialCart])

  return <SlideInCart cart={cart} />
}

