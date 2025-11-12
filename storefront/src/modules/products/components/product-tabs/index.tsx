"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-base text-text-secondary py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-text-primary block mb-1">Material</span>
            <p className="text-text-secondary">{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-text-primary block mb-1">Country of origin</span>
            <p className="text-text-secondary">{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-text-primary block mb-1">Type</span>
            <p className="text-text-secondary">{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-text-primary block mb-1">Weight</span>
            <p className="text-text-secondary">{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-text-primary block mb-1">Dimensions</span>
            <p className="text-text-secondary">
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
    <div className="text-base text-text-secondary py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-4">
          <div className="text-primary">
            <FastDelivery />
          </div>
          <div>
            <span className="font-semibold text-text-primary block mb-2">Fast delivery</span>
            <p className="max-w-sm text-text-secondary">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="text-primary">
            <Refresh />
          </div>
          <div>
            <span className="font-semibold text-text-primary block mb-2">Simple exchanges</span>
            <p className="max-w-sm text-text-secondary">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="text-primary">
            <Back />
          </div>
          <div>
            <span className="font-semibold text-text-primary block mb-2">Easy returns</span>
            <p className="max-w-sm text-text-secondary">
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
