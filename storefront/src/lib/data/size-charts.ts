/**
 * KIN STORE size charts — official data from store size charts.
 * Two recommendation types:
 *  - "weight-height": suggest by weight (kg) + height (cm) — binder, quần
 *  - "measurement": static reference table by body measurements — sơ mi
 */

export type SizeChartType = "binder" | "quan" | "so-mi"

export type WeightHeightRow = {
  size: string
  minKg: number
  maxKg: number
  maxHeightCm: number
}

export type MeasurementRow = {
  size: string
  values: Record<string, number> // column -> value (cm)
}

export type SizeChart =
  | {
      id: SizeChartType
      title: string
      mode: "weight-height"
      note?: string
      columns: string[] // display columns for the table
      rows: WeightHeightRow[]
    }
  | {
      id: SizeChartType
      title: string
      mode: "measurement"
      note?: string
      columns: string[]
      rows: MeasurementRow[]
    }

export const SIZE_CHARTS: Record<SizeChartType, SizeChart> = {
  binder: {
    id: "binder",
    title: "Binder (Áo nịt)",
    mode: "weight-height",
    note: "Gợi ý theo cân nặng và chiều cao. Nếu phân vân giữa 2 size, ưu tiên size lớn hơn để thoải mái.",
    columns: ["Size", "Cân nặng", "Chiều cao"],
    rows: [
      { size: "S", minKg: 38, maxKg: 48, maxHeightCm: 170 },
      { size: "M", minKg: 49, maxKg: 56, maxHeightCm: 170 },
      { size: "L", minKg: 57, maxKg: 63, maxHeightCm: 170 },
      { size: "XL", minKg: 64, maxKg: 69, maxHeightCm: 170 },
      { size: "2XL", minKg: 70, maxKg: 77, maxHeightCm: 175 },
      { size: "3XL", minKg: 78, maxKg: 82, maxHeightCm: 175 },
      { size: "4XL", minKg: 83, maxKg: 99, maxHeightCm: 175 },
    ],
  },
  quan: {
    id: "quan",
    title: "Quần (Short / Quần âu)",
    mode: "weight-height",
    note: "Gợi ý theo cân nặng và chiều cao.",
    columns: ["Size", "Cân nặng", "Chiều cao"],
    rows: [
      { size: "S", minKg: 38, maxKg: 45, maxHeightCm: 160 },
      { size: "M", minKg: 46, maxKg: 53, maxHeightCm: 165 },
      { size: "L", minKg: 54, maxKg: 59, maxHeightCm: 170 },
      { size: "XL", minKg: 60, maxKg: 66, maxHeightCm: 175 },
      { size: "XXL", minKg: 67, maxKg: 73, maxHeightCm: 175 },
    ],
  },
  "so-mi": {
    id: "so-mi",
    title: "Áo sơ mi",
    mode: "measurement",
    note: "Thông số đã tính cử động, có thể sai lệch 1cm. Đơn vị: cm.",
    columns: ["Size", "Ngực", "Vai", "Dài tay", "Dài áo"],
    rows: [
      { size: "S", values: { Ngực: 93, Vai: 40, "Dài tay": 52, "Dài áo": 63 } },
      { size: "M", values: { Ngực: 95, Vai: 41, "Dài tay": 53, "Dài áo": 64 } },
      { size: "L", values: { Ngực: 97, Vai: 42, "Dài tay": 54, "Dài áo": 65 } },
      { size: "XL", values: { Ngực: 99, Vai: 43, "Dài tay": 55, "Dài áo": 66 } },
      { size: "XXL", values: { Ngực: 101, Vai: 44, "Dài tay": 56, "Dài áo": 67 } },
    ],
  },
}

export type SizeSuggestion = {
  size: string | null
  note: string
}

/**
 * Suggest a size from weight + height for weight-height charts.
 * Strategy: primary match on weight band; if the customer's height exceeds the
 * band's typical max height we flag it but still suggest (weight is the main driver).
 */
export function suggestWeightHeightSize(
  chart: Extract<SizeChart, { mode: "weight-height" }>,
  weightKg: number,
  heightCm: number
): SizeSuggestion {
  if (!weightKg || weightKg <= 0) {
    return { size: null, note: "Vui lòng nhập cân nặng hợp lệ." }
  }

  // exact weight band
  const byWeight = chart.rows.find(
    (r) => weightKg >= r.minKg && weightKg <= r.maxKg
  )

  if (byWeight) {
    let note = `Phù hợp với cân nặng ${weightKg}kg.`
    if (heightCm && heightCm > byWeight.maxHeightCm) {
      const idx = chart.rows.indexOf(byWeight)
      const bigger = chart.rows[idx + 1]
      if (bigger) {
        note = `Cân nặng hợp size ${byWeight.size}, nhưng chiều cao ${heightCm}cm hơi cao — có thể cân nhắc size ${bigger.size} nếu thích dáng dài hơn.`
      }
    }
    return { size: byWeight.size, note }
  }

  // below smallest
  const smallest = chart.rows[0]
  const largest = chart.rows[chart.rows.length - 1]
  if (weightKg < smallest.minKg) {
    return {
      size: smallest.size,
      note: `Cân nặng dưới bảng size — gợi ý size nhỏ nhất ${smallest.size}. Liên hệ tư vấn để chắc chắn.`,
    }
  }
  if (weightKg > largest.maxKg) {
    return {
      size: largest.size,
      note: `Cân nặng vượt bảng size — gợi ý size lớn nhất ${largest.size}. Liên hệ tư vấn để được hỗ trợ riêng.`,
    }
  }
  return {
    size: null,
    note: "Không tìm thấy size phù hợp tự động — vui lòng liên hệ tư vấn.",
  }
}
