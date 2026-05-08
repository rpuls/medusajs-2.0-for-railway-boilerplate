"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import { HttpTypes } from "@medusajs/types"
import { LayoutGroup, motion, useReducedMotion } from "framer-motion"
import { useId, useState } from "react"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const TAB_LABELS = ["Specifications", "Shipping & Returns"] as const

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [active, setActive] = useState(0)
  const reducedMotion = useReducedMotion()
  const baseId = useId()

  const underlineTransition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 34 }

  return (
    <div className="w-full lg:max-w-[500px] lg:mx-auto">
      <LayoutGroup id={`${baseId}-pdp-info-tabs`}>
        <div
          className="relative flex gap-1 border-b border-ui-border-base"
          role="tablist"
          aria-label="Product information"
        >
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={active === i}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={active === i ? 0 : -1}
              className="relative z-[1] px-3 py-2 pb-3 text-left text-sm font-medium text-ui-fg-muted transition-colors data-[active=true]:text-ui-fg-base small:px-4"
              data-active={active === i}
              onClick={() => setActive(i)}
            >
              {label}
              {active === i ? (
                <motion.span
                  layoutId={`${baseId}-pdp-tab-underline`}
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-ui-fg-base"
                  transition={underlineTransition}
                />
              ) : null}
            </button>
          ))}
        </div>
      </LayoutGroup>

      <div
        role="tabpanel"
        id={`${baseId}-panel-0`}
        aria-labelledby={`${baseId}-tab-0`}
        hidden={active !== 0}
      >
        <ProductInfoTab product={product} />
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-1`}
        aria-labelledby={`${baseId}-tab-1`}
        hidden={active !== 1}
      >
        <ShippingInfoTab />
      </div>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular pt-6">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular pt-6">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Production &amp; delivery</span>
            <p className="max-w-sm">
              Custom prints are made to order — most orders ship within 3–5
              business days of artwork approval. If blanks need to be ordered
              in, allow an extra 2–4 business days. Need it sooner? Priority
              and express options are available at checkout.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
