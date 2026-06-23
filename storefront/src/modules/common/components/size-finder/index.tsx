"use client"

import { useMemo, useState } from "react"
import {
  SIZE_CHARTS,
  SizeChartType,
  suggestWeightHeightSize,
} from "@lib/data/size-charts"
import SizeChartTable from "@modules/common/components/size-chart-table"
import { clx } from "@medusajs/ui"

const TYPE_TABS: { id: SizeChartType; label: string }[] = [
  { id: "binder", label: "Binder" },
  { id: "quan", label: "Quần" },
  { id: "so-mi", label: "Áo sơ mi" },
]

type Props = {
  defaultType?: SizeChartType
  compact?: boolean
}

const SizeFinder = ({ defaultType = "binder", compact = false }: Props) => {
  const [type, setType] = useState<SizeChartType>(defaultType)
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const chart = SIZE_CHARTS[type]
  const isWeightHeight = chart.mode === "weight-height"

  const suggestion = useMemo(() => {
    if (!submitted || !isWeightHeight) return null
    return suggestWeightHeightSize(
      chart as any,
      parseFloat(weight),
      parseFloat(height)
    )
  }, [submitted, isWeightHeight, chart, weight, height])

  const onTypeChange = (t: SizeChartType) => {
    setType(t)
    setSubmitted(false)
  }

  return (
    <div className="w-full">
      {/* Type tabs */}
      <div className="flex gap-2 mb-6">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTypeChange(tab.id)}
            className={clx(
              "px-5 py-2.5 font-hanken text-sm font-semibold uppercase tracking-wider border transition-colors focus:outline-none",
              type === tab.id
                ? "bg-kin-primary text-white border-kin-primary"
                : "bg-transparent text-kin-primary border-kin-warm-grey hover:border-kin-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quiz (only for weight-height charts) */}
      {isWeightHeight ? (
        <div className="mb-8">
          <p className="font-vietnam text-sm text-kin-on-surface-variant mb-4">
            Nhập cân nặng và chiều cao để nhận gợi ý size phù hợp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <label className="flex-1 w-full">
              <span className="block font-hanken text-xs font-semibold text-kin-primary uppercase tracking-wider mb-2">
                Cân nặng (kg)
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value)
                  setSubmitted(false)
                }}
                placeholder="vd: 55"
                className="w-full border border-kin-warm-grey px-4 py-3 font-vietnam text-base text-kin-primary bg-white focus:outline-none focus:border-kin-primary"
              />
            </label>
            <label className="flex-1 w-full">
              <span className="block font-hanken text-xs font-semibold text-kin-primary uppercase tracking-wider mb-2">
                Chiều cao (cm)
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value)
                  setSubmitted(false)
                }}
                placeholder="vd: 165"
                className="w-full border border-kin-warm-grey px-4 py-3 font-vietnam text-base text-kin-primary bg-white focus:outline-none focus:border-kin-primary"
              />
            </label>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={!weight}
              className="bg-kin-primary text-white px-8 py-3 font-hanken text-sm font-semibold uppercase tracking-widest hover:bg-kin-forest transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Gợi ý size
            </button>
          </div>

          {suggestion && (
            <div className="mt-6 p-5 bg-kin-beige border-l-4 border-kin-forest">
              {suggestion.size ? (
                <p className="font-vietnam text-base text-kin-primary">
                  Size gợi ý cho bạn:{" "}
                  <span className="font-hanken text-xl font-bold text-kin-forest">
                    {suggestion.size}
                  </span>
                </p>
              ) : (
                <p className="font-vietnam text-base text-kin-primary font-semibold">
                  Cần tư vấn thêm
                </p>
              )}
              <p className="font-vietnam text-sm text-kin-on-surface-variant mt-1">
                {suggestion.note}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="font-vietnam text-sm text-kin-on-surface-variant mb-6">
          Áo sơ mi chọn size theo số đo cơ thể. Đối chiếu bảng bên dưới (đơn vị
          cm).
        </p>
      )}

      {/* Reference table */}
      <SizeChartTable
        chart={chart}
        highlightSize={suggestion?.size ?? undefined}
      />

      {!compact && (
        <div className="mt-8 p-5 bg-kin-surface-container">
          <p className="font-vietnam text-sm text-kin-on-surface-variant">
            Vẫn phân vân? Nhắn tin để được tư vấn kín đáo 1-1 qua{" "}
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noreferrer"
              className="text-kin-forest font-semibold hover:underline"
            >
              Zalo
            </a>{" "}
            hoặc{" "}
            <a
              href="https://m.me"
              target="_blank"
              rel="noreferrer"
              className="text-kin-forest font-semibold hover:underline"
            >
              Messenger
            </a>
            .
          </p>
        </div>
      )}
    </div>
  )
}

export default SizeFinder
