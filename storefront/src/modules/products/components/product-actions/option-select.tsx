import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import SizeGuideModal from "@modules/products/components/size-guide-modal"
import { SizeChartType } from "@lib/data/size-charts"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  sizeChartType?: SizeChartType
  "data-testid"?: string
}

const isSizeOption = (title: string) =>
  /size|kích thước|kich thuoc/i.test(title)

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  sizeChartType,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = option.values?.map((v) => v.value)
  const isSize = isSizeOption(title)

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex justify-between items-end">
        <span className="font-hanken text-sm font-semibold text-kin-primary uppercase tracking-wider">
          {isSize ? "Kích thước" : title}
        </span>
        {isSize && <SizeGuideModal defaultType={sizeChartType ?? "binder"} />}
      </div>
      <div className="flex flex-wrap gap-3" data-testid={dataTestId}>
        {filteredOptions?.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "px-6 py-3 border font-hanken text-sm font-semibold transition-colors focus:outline-none",
                {
                  "bg-kin-primary border-kin-primary text-kin-on-primary":
                    v === current,
                  "border-kin-warm-grey text-kin-primary hover:border-kin-primary":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
