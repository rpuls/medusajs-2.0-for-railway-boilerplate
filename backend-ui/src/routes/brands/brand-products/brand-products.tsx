import { useParams } from "react-router-dom"
import { RouteFocusModal } from "../../../components/modals"
import { useBrand, useBrandProducts } from "../../../hooks/api/brands"
import { EditBrandProductsForm } from "./components/edit-brand-products-form"

export const BrandProducts = () => {
  const { id } = useParams()

  const { brand, isPending: isPendingBrand, isFetching: isFetchingBrand, isError: isErrorBrand, error: errorBrand } =
    useBrand(id!)

  const { products: brandProducts, isPending: isPendingProducts, isFetching: isFetchingProducts } =
    useBrandProducts(id!)

  const ready = !isPendingBrand && !isFetchingBrand && !isPendingProducts && !isFetchingProducts && !!brand && !!brandProducts

  if (isErrorBrand) {
    throw errorBrand
  }

  return (
    <RouteFocusModal>
      {ready && (
        <EditBrandProductsForm
          brandId={brand.id}
          products={brandProducts}
        />
      )}
    </RouteFocusModal>
  )
}

