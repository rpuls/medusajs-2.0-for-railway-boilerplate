'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  CircularProgress,
} from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'
import { HttpTypes } from '@medusajs/types'
import { getProductPrice } from '@lib/util/get-product-price'
import { addToCartAction } from '@modules/products/actions/add-to-cart'
import { useTranslation } from '@lib/i18n/hooks/use-translation'
import { useCartDrawer } from '@modules/cart/context/cart-context'
import QuickViewModal from './quick-view-modal'

/**
 * Client Component for Product Tile with interactive features
 * - Entire card is clickable (links to product page)
 * - Add to Cart button that adds product to cart
 */
export default function ProductTileContent({
  product,
  pricedProduct,
  countryCode,
  priority = false,
}: {
  product: HttpTypes.StoreProduct
  pricedProduct: HttpTypes.StoreProduct
  countryCode: string
  priority?: boolean
}) {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const { openCart } = useCartDrawer()
  const actualCountryCode = (params?.countryCode as string) || countryCode
  const [isAdding, setIsAdding] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const hasVariants = product.variants && product.variants.length > 0
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1

  // Get the first available variant (or first variant if no inventory management)
  const defaultVariant = product.variants?.[0]

  // Comprehensive stock status check
  const isInStock = hasVariants && (product.variants || []).some((v: any) => {
    // If inventory is not managed, product is always available
    if (!v.manage_inventory) {
      return true
    }
    // If backorders are allowed, product is available
    if (v.allow_backorder) {
      return true
    }
    // If inventory is managed and quantity > 0, product is available
    if (v.manage_inventory && (v.inventory_quantity || 0) > 0) {
      return true
    }
    return false
  })

  const productUrl = `/${actualCountryCode}/products/${product.handle}`

  // Handle add to cart button click
  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // If product has multiple variants, open quick view modal
    if (hasMultipleVariants) {
      setQuickViewOpen(true)
      return
    }

    // Otherwise, add directly to cart
    handleAddToCartDirect()
  }

  // Handle direct add to cart (for single variant products)
  const handleAddToCartDirect = async () => {
    if (!defaultVariant?.id || !isInStock || isAdding) {
      return
    }

    setIsAdding(true)

    try {
      const result = await addToCartAction({
        variantId: defaultVariant.id,
        quantity: 1,
        countryCode: actualCountryCode,
      })
      
      if (result.success) {
        router.refresh()
        setTimeout(() => {
          openCart()
        }, 300)
      } else {
        console.error('Failed to add to cart:', result.error)
        alert(`Failed to add to cart: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert(`Failed to add to cart: ${error}`)
    } finally {
      setIsAdding(false)
    }
  }

  return (
      <Card 
        className="h-full flex flex-col hover:shadow-lg transition-all duration-300 group cursor-pointer"
        sx={{
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
      <Link href={productUrl} className="block flex-grow">
        {/* Image Section with Lazy Loading */}
        <CardMedia
          component="div"
          className="relative h-48 bg-gray-100 overflow-hidden"
          style={{ aspectRatio: '4/3' }} // Prevent CLS
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={(() => {
                // Generate keyword-rich alt text with product name as main keyword
                const parts = [product.title || 'Product']
                // Add category if available for better SEO
                if (product.categories && product.categories.length > 0) {
                  parts.push(product.categories[0].name)
                }
                return parts.join(' - ')
              })()}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 280px"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              quality={75}
            />
          ) : (
            <Box className="h-full flex items-center justify-center bg-gray-100">
              <Typography variant="body2" color="text.secondary">
                {t("product.noImage")}
              </Typography>
            </Box>
          )}
        </CardMedia>

        {/* Content Section */}
        <CardContent className="flex-grow flex flex-col">
          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            className="group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title}
          </Typography>

          {/* Description */}
          {product.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              className="mb-2 line-clamp-2"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description}
            </Typography>
          )}

          {/* Price Section */}
          {cheapestPrice ? (
            <Box className="mb-2">
              {cheapestPrice.price_type === 'sale' &&
              cheapestPrice.original_price_number > cheapestPrice.calculated_price_number ? (
                <Box>
                  <Typography
                    variant="body2"
                    className="line-through text-gray-400"
                  >
                    {cheapestPrice.original_price}
                  </Typography>
                  <Box className="flex items-center gap-2">
                    <Typography variant="h6" color="error" className="font-bold">
                      {cheapestPrice.calculated_price}
                    </Typography>
                    {cheapestPrice.percentage_diff && (
                      <Chip
                        label={`-${cheapestPrice.percentage_diff}%`}
                        size="small"
                        color="error"
                      />
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography variant="h6" color="primary" className="font-bold">
                  {cheapestPrice.calculated_price}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" className="mb-2">
              {t("product.priceNotAvailable")}
            </Typography>
          )}

          {/* Status Chips */}
              <Box className="flex gap-2 mt-auto flex-wrap">
                {isInStock ? (
                  <Chip label={t("product.inStock")} size="small" color="success" />
                ) : (
                  <Chip label={t("product.outOfStock")} size="small" color="error" />
                )}
                {product.collection && (
                  <Chip
                    label={product.collection.title || t("filters.collection")}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
        </CardContent>
      </Link>

      {/* Actions - Outside Link to prevent navigation */}
      <CardActions className="p-4 pt-0">
            <Button
              variant="contained"
              fullWidth
              startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
              disabled={!isInStock || isAdding || !defaultVariant}
          onClick={handleAddToCartClick}
              className="transition-all duration-200"
              sx={{
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              {isAdding ? t("product.adding") : isInStock ? t("product.addToCart") : t("product.outOfStock")}
            </Button>
        </CardActions>

      {/* Quick View Modal for Variant Selection */}
      {hasMultipleVariants && (
        <QuickViewModal
          product={product}
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          countryCode={actualCountryCode}
        />
      )}
      </Card>
  )
}

