import { SizeChart } from "@lib/data/size-charts"
import { clx } from "@medusajs/ui"

type Props = {
  chart: SizeChart
  highlightSize?: string | null
}

const SizeChartTable = ({ chart, highlightSize }: Props) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="border-b-2 border-kin-primary">
              {chart.columns.map((c) => (
                <th
                  key={c}
                  className="text-left py-3 pr-4 font-hanken text-xs font-semibold text-kin-primary uppercase tracking-wider"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row) => {
              const isHi = highlightSize && row.size === highlightSize
              return (
                <tr
                  key={row.size}
                  className={clx("border-b border-kin-outline-variant", {
                    "bg-kin-forest/10": isHi,
                  })}
                >
                  <td
                    className={clx(
                      "py-3 pr-4 font-hanken text-sm font-semibold",
                      isHi ? "text-kin-forest" : "text-kin-primary"
                    )}
                  >
                    {row.size}
                    {isHi && (
                      <span className="ml-2 inline-block font-vietnam text-[10px] font-medium text-white bg-kin-forest px-2 py-0.5 rounded-full align-middle">
                        Gợi ý
                      </span>
                    )}
                  </td>
                  {chart.mode === "weight-height" ? (
                    <>
                      <td className="py-3 pr-4 font-vietnam text-sm text-kin-on-surface-variant">
                        {(row as any).minKg} - {(row as any).maxKg}kg
                      </td>
                      <td className="py-3 pr-4 font-vietnam text-sm text-kin-on-surface-variant">
                        &lt; {(row as any).maxHeightCm}cm
                      </td>
                    </>
                  ) : (
                    chart.columns.slice(1).map((col) => (
                      <td
                        key={col}
                        className="py-3 pr-4 font-vietnam text-sm text-kin-on-surface-variant"
                      >
                        {(row as any).values[col]}
                      </td>
                    ))
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {chart.note && (
        <p className="font-vietnam text-xs text-kin-on-surface-variant mt-3 italic">
          {chart.note}
        </p>
      )}
    </div>
  )
}

export default SizeChartTable
