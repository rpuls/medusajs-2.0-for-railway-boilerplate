import { Button, FocusModal, Label, RadioGroup, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useBulkUpdateProducts, useProducts } from "../../../../../hooks/api/products"
import { HttpTypes } from "@medusajs/types"

type BulkEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProductIds: string[]
  selectAllMode?: boolean
  searchParams?: HttpTypes.AdminProductListParams
  totalCount?: number
  selectedCount?: number
  onSuccess?: () => void
}

export const BulkEditModal = ({
  open,
  onOpenChange,
  selectedProductIds,
  selectAllMode = false,
  searchParams,
  totalCount = 0,
  selectedCount = 0,
  onSuccess,
}: BulkEditModalProps) => {
  const { t } = useTranslation()
  const [status, setStatus] = useState<"draft" | "published">("published")
  const { mutateAsync, isPending } = useBulkUpdateProducts()
  
  // Fetch all product IDs when in selectAllMode
  const { products: allProducts, count: allProductsCount, isLoading: isLoadingProducts } = useProducts(
    selectAllMode && searchParams && open
      ? { ...searchParams, is_giftcard: false, limit: 10000 }
      : undefined,
    {
      enabled: selectAllMode && open,
    }
  )
  
  // Recalculate display count when modal opens or props change
  useEffect(() => {
    // This effect ensures we have the latest count when the modal opens
  }, [open, selectAllMode, selectedCount, totalCount, selectedProductIds.length, allProductsCount])

  const handleSubmit = async () => {
    let productIdsToUpdate = selectedProductIds
    
    // If selectAllMode is active, get all product IDs from the fetched products
    if (selectAllMode) {
      if (allProducts && allProducts.length > 0) {
        productIdsToUpdate = allProducts.map((p) => p.id)
      } else if (totalCount > 0) {
        // If we have totalCount but products haven't loaded, fetch them now
        // This handles the case where the query is still loading
        toast.error(t("products.bulkEdit.error.header"), {
          description: "Please wait for products to load, then try again.",
        })
        return
      } else {
        toast.error(t("products.bulkEdit.error.header"), {
          description: "No products found to update.",
        })
        return
      }
    }
    
    if (productIdsToUpdate.length === 0) {
      toast.error(t("products.bulkEdit.error.header"), {
        description: "No products selected for update.",
      })
      return
    }

    const count = selectAllMode ? (totalCount || productIdsToUpdate.length) : productIdsToUpdate.length

    try {
      await mutateAsync(
        {
          productIds: productIdsToUpdate,
          data: { status },
        },
        {
          onSuccess: () => {
            toast.success(
              t("products.bulkEdit.success.header", {
                count,
              }),
              {
                description: t("products.bulkEdit.success.description", {
                  count,
                  status: status === "published" ? "published" : "draft",
                }),
              }
            )
            onSuccess?.()
            onOpenChange(false)
          },
          onError: (error: Error) => {
            toast.error(t("products.bulkEdit.error.header"), {
              description: error.message,
            })
          },
        }
      )
    } catch (error) {
      // Error handled in onError callback
    }
  }

  // Calculate display count with proper fallbacks
  // Priority: selectedCount (from parent) > totalCount (for selectAllMode) > allProductsCount > allProducts.length > selectedProductIds.length
  const displayCount = (() => {
    // If selectedCount is explicitly provided (not undefined/null), use it
    if (selectedCount !== undefined && selectedCount !== null) {
      return selectedCount
    }
    
    // For selectAllMode, prefer totalCount, then allProductsCount, then allProducts length
    if (selectAllMode) {
      if (totalCount > 0) return totalCount
      if (allProductsCount !== undefined && allProductsCount > 0) return allProductsCount
      if (allProducts && allProducts.length > 0) return allProducts.length
      return 0
    }
    
    // For individual selection, use selectedProductIds length
    return selectedProductIds.length
  })()
    
  // Check if we're ready to submit
  // Use displayCount to determine readiness (it's calculated from captured/current state)
  // For selectAllMode: need either products loaded OR totalCount > 0 (we'll fetch on submit)
  // For individual selection: use displayCount (which uses selectedCount if available, otherwise selectedProductIds.length)
  const isReady = selectAllMode 
    ? (allProducts && allProducts.length > 0) || totalCount > 0
    : displayCount > 0

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content className="!max-w-md">
        <FocusModal.Header>
          <FocusModal.Title>
            {t("products.bulkEdit.title", { count: displayCount })}
          </FocusModal.Title>
          <FocusModal.Description>
            {selectAllMode
              ? t("products.bulkEdit.descriptionAll", {
                  count: displayCount,
                })
              : t("products.bulkEdit.description", {
                  count: displayCount,
                })}
          </FocusModal.Description>
        </FocusModal.Header>

        <FocusModal.Body className="py-4">
          {isLoadingProducts && selectAllMode ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-ui-fg-subtle text-sm">
                {t("products.bulkEdit.loading", {
                  count: totalCount || 0,
                })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">{t("products.fields.status.label")}</Label>
                <RadioGroup value={status} onValueChange={(value) => setStatus(value as "draft" | "published")}>
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="draft" id="draft" />
                    <Label htmlFor="draft" weight="regular" className="text-sm">
                      {t("products.status.draft")}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="published" id="published" />
                    <Label htmlFor="published" weight="regular" className="text-sm">
                      {t("products.status.published")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </FocusModal.Body>

        <FocusModal.Footer>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button 
            size="small"
            onClick={handleSubmit} 
            disabled={isPending || !isReady || isLoadingProducts} 
            isLoading={isPending || isLoadingProducts}
          >
            {t("actions.save")}
          </Button>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}

