'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material'
import { Close, ShoppingCart } from '@mui/icons-material'
import { HttpTypes } from '@medusajs/types'
import { isEqual } from '@lib/utils/is-equal'
import OptionSelect from '@modules/products/components/product-actions/option-select'
import ProductPrice from '@modules/products/components/product-price'
import { addToCartAction } from '@modules/products/actions/add-to-cart'
import { useCartDrawer } from '@modules/cart/context/cart-context'
import { useTranslation } from '@lib/i18n/hooks/use-translation'
import Image from 'next/image'

type QuickViewModalProps = {
  product: HttpTypes.StoreProduct
  open: boolean
  onClose: () => void
  countryCode: string
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

export default function QuickViewModal({
  product,
  open,
  onClose,
  countryCode,
}: QuickViewModalProps) {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const { openCart } = useCartDrawer()
  const actualCountryCode = (params?.countryCode as string) || countryCode
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Preselect first variant if only one exists
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants, open])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setOptions({})
      setError(null)
      setIsAdding(false)
    } else if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [open, product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
    setError(null)
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      setError(t("product.selectVariant") || "Please select a variant")
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const result = await addToCartAction({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode: actualCountryCode,
      })

      if (result.success) {
        router.refresh()
        setTimeout(() => {
          openCart()
          onClose()
        }, 300)
      } else {
        setError(result.error || t("product.addToCartError") || "Failed to add to cart")
      }
    } catch (err: any) {
      setError(err.message || t("product.addToCartError") || "Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" component="span">
          {t("product.selectVariant") || "Select Variant"}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        {/* Product Image */}
        {thumbnail && (
          <Box sx={{ mb: 3, position: 'relative', width: '100%', height: 200, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100' }}>
            <Image
              src={thumbnail}
              alt={product.title || 'Product'}
              fill
              className="object-cover"
              sizes="(max-width: 600px) 100vw, 400px"
            />
          </Box>
        )}

        {/* Product Title */}
        <Typography variant="h6" sx={{ mb: 3 }}>
          {product.title}
        </Typography>

        {/* Variant Selection */}
        {(product.variants?.length ?? 0) > 1 && (
          <Box sx={{ mb: 3 }}>
            {(product.options || []).map((option) => (
              <Box key={option.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {option.title}
                </Typography>
                <OptionSelect
                  option={option}
                  current={options[option.title ?? ""]}
                  updateOption={setOptionValue}
                  title={option.title ?? ""}
                  disabled={isAdding}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Price Display */}
        <Box sx={{ mb: 3, py: 2, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
          <ProductPrice product={product} variant={selectedVariant} />
        </Box>

        {/* Stock Status */}
        {selectedVariant && (
          <Box sx={{ mb: 2 }}>
            {inStock ? (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                {t("product.inStock") || "In Stock"}
              </Typography>
            ) : (
              <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                {t("product.outOfStock") || "Out of Stock"}
              </Typography>
            )}
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="contained"
          disabled={!inStock || !selectedVariant || isAdding}
          startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
          sx={{ minWidth: 140 }}
        >
          {isAdding
            ? t("product.adding") || "Adding..."
            : !selectedVariant
            ? t("product.selectVariant") || "Select Variant"
            : !inStock
            ? t("product.outOfStock") || "Out of Stock"
            : t("product.addToCart") || "Add to Cart"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}


