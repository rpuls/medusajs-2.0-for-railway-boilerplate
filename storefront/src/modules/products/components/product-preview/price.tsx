import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted text-black"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={clx("", {
          " text-black text-[34px] font-bold ": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.original_price_number} lei
      </Text>
    </>
  )
}
