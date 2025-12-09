import { RouteFocusModal } from "../../../components/modals"
import { useParams } from "react-router-dom"
import { useBrand } from "../../../hooks/api/brands"
import { BrandOrganizeForm } from "./components/brand-organize-form"

export const BrandOrganize = () => {
  const { id } = useParams()

  const { brand, isPending, isFetching, isError, error } = useBrand(id!)

  const ready = !isPending && !isFetching && !!brand

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal>
      {ready && <BrandOrganizeForm brand={brand} />}
    </RouteFocusModal>
  )
}

