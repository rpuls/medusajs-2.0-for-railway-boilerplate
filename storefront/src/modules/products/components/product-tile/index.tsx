import { Suspense } from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Skeleton,
  Box,
} from '@mui/material'
import { HttpTypes } from '@medusajs/types'
import { getProductsById } from '@lib/data/products'
import ProductTileContent from './product-tile-content'

type ProductTileProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  priority?: boolean // For above-the-fold images
  pricedProduct?: HttpTypes.StoreProduct // Optional pre-fetched priced product
}

/**
 * Optimized Product Tile Component
 * - Server Component for SSR (can be used in Client Components with pre-fetched data)
 * - Lazy image loading with Next.js Image
 * - Loading skeleton state
 * - Smooth animations
 * - Stock status checking
 * - Price display with sale indicators
 */
export default async function ProductTile({
  product,
  region,
  countryCode,
  priority = false,
  pricedProduct: preFetchedPricedProduct,
}: ProductTileProps) {
  // Use pre-fetched priced product if provided, otherwise fetch it
  let pricedProduct = preFetchedPricedProduct
  
  if (!pricedProduct) {
    const [fetchedPricedProduct] = await getProductsById({
      ids: [product.id!],
      regionId: region.id,
    })
    pricedProduct = fetchedPricedProduct
  }

  if (!pricedProduct) {
    return null
  }

  return (
    <ProductTileContent
      product={product}
      pricedProduct={pricedProduct}
      countryCode={countryCode}
      priority={priority}
    />
  )
}


/**
 * Loading Skeleton for Product Tile
 * Used in Suspense boundaries
 * Matches the exact structure of ProductTileClient
 */
export function ProductTileSkeleton() {
  return (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-all duration-300"
    >
      {/* Image Skeleton - matches CardMedia h-48 (192px) */}
      <CardMedia
        component="div"
        className="relative h-48 bg-gray-100 overflow-hidden"
      >
        <Skeleton 
          variant="rectangular" 
          height="100%" 
          width="100%"
          className="absolute inset-0"
        />
      </CardMedia>

      {/* Content Section - matches CardContent structure */}
      <CardContent className="flex-grow flex flex-col">
        {/* Title Skeleton - h6 variant, mb-2 */}
        <Skeleton 
          variant="text" 
          height={32} 
          className="mb-2"
          sx={{ fontSize: '1.25rem' }} // h6 font size
        />
        
        {/* Description Skeleton - body2 variant, mb-2, optional (2 lines) */}
        <Skeleton 
          variant="text" 
          height={20} 
          width="100%" 
          className="mb-1"
        />
        <Skeleton 
          variant="text" 
          height={20} 
          width="80%" 
          className="mb-2"
        />
        
        {/* Price Skeleton - mb-2 */}
        <Skeleton 
          variant="text" 
          height={28} 
          width="40%" 
          className="mb-2"
          sx={{ fontSize: '1.25rem' }} // h6 font size for price
        />
        
        {/* Status Chips Skeleton - mt-auto flex gap-2 flex-wrap */}
        <Box className="flex gap-2 mt-auto flex-wrap">
          <Skeleton 
            variant="rectangular" 
            width={80} 
            height={24}
            sx={{ borderRadius: '16px' }} // Chip border radius
          />
          <Skeleton 
            variant="rectangular" 
            width={100} 
            height={24}
            sx={{ borderRadius: '16px' }} // Chip border radius
          />
        </Box>
      </CardContent>

      {/* Actions Skeleton - matches CardActions p-4 pt-0 */}
      <CardActions className="p-4 pt-0">
        <Skeleton 
          variant="rectangular" 
          height={40} 
          width="100%"
          sx={{ borderRadius: '4px' }} // Button border radius
        />
      </CardActions>
    </Card>
  )
}

/**
 * Product Tile with Suspense Wrapper
 * Use this when you want automatic loading states
 */
export function ProductTileWithSuspense(props: ProductTileProps) {
  return (
    <Suspense fallback={<ProductTileSkeleton />}>
      <ProductTile {...props} />
    </Suspense>
  )
}

