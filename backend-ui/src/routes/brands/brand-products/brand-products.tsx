import { useParams } from "react-router-dom"
import { RouteFocusModal } from "../../../components/modals"
import { useBrandProducts } from "../../../hooks/api/brands"
import { EditBrandProductsForm } from "./components/edit-brand-products-form"

export const BrandProducts = () => {
  const { id } = useParams()

  const { products: brandProducts, isPending, isFetching, isError, error } =
    useBrandProducts(id!)

  const ready = !isPending && !isFetching

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal>
      {ready && (
        <EditBrandProductsForm
          brandId={id!}
          products={brandProducts || []}
        />
      )}
    </RouteFocusModal>
  )
}

