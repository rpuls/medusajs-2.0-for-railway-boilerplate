'use client'

import { Typography } from '@mui/material'
import { useTranslation } from "@lib/i18n/hooks/use-translation"

type ProductCountProps = {
  currentPage: number
  pageSize: number
  totalCount: number
}

const ProductCount = ({ currentPage, pageSize, totalCount }: ProductCountProps) => {
  const { t } = useTranslation()
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)

  if (totalCount === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {t("filters.noProductsFound")}
      </Typography>
    )
  }

  const showingText = t("filters.showingResults")
    .replace("{start}", startIndex.toString())
    .replace("{end}", endIndex.toString())
    .replace("{total}", totalCount.toString())

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
      {showingText}
    </Typography>
  )
}

export default ProductCount

