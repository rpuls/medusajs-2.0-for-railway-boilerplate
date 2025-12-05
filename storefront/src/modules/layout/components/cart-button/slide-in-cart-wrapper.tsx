'use client'

import dynamic from 'next/dynamic'

// Client Component wrapper for slide-in cart (ssr: false)
const SlideInCart = dynamic(
  () => import('@modules/cart/components/slide-in-cart'),
  {
    ssr: false,
  }
)

interface SlideInCartWrapperProps {
  cart: any
}

export default function SlideInCartWrapper({ cart }: SlideInCartWrapperProps) {
  return <SlideInCart cart={cart} />
}

