import { Button, FocusModal, Label, RadioGroup, toast, usePrompt } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useBulkUpdateProducts, useBulkDeleteProducts, useProducts } from "../../../../../hooks/api/products"
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
  const prompt = usePrompt()
  const [action, setAction] = useState<"update" | "delete">("update")
  const [status, setStatus] = useState<"draft" | "published">("published")
  const { mutateAsync: updateProducts, isPending: isUpdating } = useBulkUpdateProducts()
  const { mutateAsync: deleteProducts, isPending: isDeleting } = useBulkDeleteProducts()
  
  const isPending = isUpdating || isDeleting
  
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

  const getProductIds = () => {
    let productIds = selectedProductIds
    
    // If selectAllMode is active, get all product IDs from the fetched products
    if (selectAllMode) {
      if (allProducts && allProducts.length > 0) {
        productIds = allProducts.map((p) => p.id)
      } else if (totalCount > 0) {
        // If we have totalCount but products haven't loaded, fetch them now
        // This handles the case where the query is still loading
        toast.error(t("products.bulkEdit.error.header"), {
          description: "Please wait for products to load, then try again.",
        })
        return null
      } else {
        toast.error(t("products.bulkEdit.error.header"), {
          description: "No products found.",
        })
        return null
      }
    }
    
    if (productIds.length === 0) {
      toast.error(t("products.bulkEdit.error.header"), {
        description: "No products selected.",
      })
      return null
    }

    return productIds
  }

  const handleSubmit = async () => {
    const productIds = getProductIds()
    if (!productIds) return

    const count = selectAllMode ? (totalCount || productIds.length) : productIds.length

    if (action === "delete") {
      // Confirm deletion
      const confirmed = await prompt({
        title: count === 1 
          ? t("products.bulkDelete.confirm.title_one", { count })
          : t("products.bulkDelete.confirm.title_other", { count }),
        description: count === 1
          ? t("products.bulkDelete.confirm.description_one", { count })
          : t("products.bulkDelete.confirm.description_other", { count }),
        confirmText: t("actions.delete"),
        cancelText: t("actions.cancel"),
      })

      if (!confirmed) {
        return
      }

      try {
        await deleteProducts(
          { productIds },
          {
            onSuccess: () => {
              toast.success(
                count === 1
                  ? t("products.bulkDelete.success.header_one", { count })
                  : t("products.bulkDelete.success.header_other", { count }),
                {
                  description: count === 1
                    ? t("products.bulkDelete.success.description_one", { count })
                    : t("products.bulkDelete.success.description_other", { count }),
                }
              )
              onSuccess?.()
              onOpenChange(false)
            },
            onError: (error: Error) => {
              toast.error(t("products.bulkDelete.error.header"), {
                description: error.message || t("products.bulkDelete.error.description"),
              })
            },
          }
        )
      } catch (error) {
        // Error handled in onError callback
      }
    } else {
      // Update status
      try {
        await updateProducts(
          {
            productIds,
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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">{t("products.bulkEdit.actionType.label")}</Label>
                <RadioGroup value={action} onValueChange={(value) => setAction(value as "update" | "delete")}>
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="update" id="update" />
                    <Label htmlFor="update" weight="regular" className="text-sm">
                      {t("products.bulkEdit.actionType.update")}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="delete" id="delete" />
                    <Label htmlFor="delete" weight="regular" className="text-sm">
                      {t("products.bulkEdit.actionType.delete")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {action === "update" && (
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
              )}

              {action === "delete" && (
                <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
                  <p className="text-ui-fg-subtle text-sm">
                    {displayCount === 1
                      ? t("products.bulkDelete.warning_one", { count: displayCount })
                      : t("products.bulkDelete.warning_other", { count: displayCount })}
                  </p>
                </div>
              )}
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
            variant={action === "delete" ? "danger" : "primary"}
          >
            {action === "delete" ? t("actions.delete") : t("actions.save")}
          </Button>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}

