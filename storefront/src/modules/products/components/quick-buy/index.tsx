"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useStorefrontConfig } from "@lib/hooks/use-storefront-config"

// Lazy load quick buy modal
const QuickBuyModal = dynamic(() => import("./quick-buy-modal"), {
  ssr: false,
})

type QuickBuyProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  className?: string
}

const QuickBuy = ({ product, variant, className }: QuickBuyProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const config = useStorefrontConfig()

  // Check if quick buy is enabled
  if (!config.quickBuy.enabled) {
    return null
  }

  const hasMultipleVariants = (product.variants?.length ?? 0) > 1

  const handleQuickBuy = () => {
    if (hasMultipleVariants) {
      // Open modal for variant selection
      setIsModalOpen(true)
    } else if (variant) {
      // Direct quick buy for single variant
      // This will be handled by the server action
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <Button
        onClick={handleQuickBuy}
        variant="primary"
        className={className}
        data-testid="quick-buy-button"
      >
        Quick Buy
      </Button>
      <QuickBuyModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default QuickBuy

