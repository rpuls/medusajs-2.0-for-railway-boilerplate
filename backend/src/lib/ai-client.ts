import { GEMINI_API_KEY } from "./constants"

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"

const ANALYSIS_PROMPT = `Bạn là chuyên gia phân tích video quảng cáo (Facebook Ads). Xem video này và trả về DUY NHẤT 1 JSON (không markdown, không giải thích thêm) đúng schema:
{
  "diem_ban_hang": number (0-10, tổng điểm),
  "diem_chi_tiet": { "hook": number, "demo": number, "loi_thoai": number, "cta": number, "chat_luong": number },
  "tong_quan": string,
  "nhan_xet_quanly": string,
  "loi_thoai": string (toàn bộ transcript lời nói trong video),
  "loi_video": string[],
  "diem_manh": string[],
  "tung_canh": [{ "stt": number, "timestamp": string, "mo_ta_hinh": string, "loi_thoai_canh": string }],
  "ket_luan_quanly": string
}`

async function uploadFileFromUrl(fileUrl: string, mimeType = "video/mp4"): Promise<string> {
  const fileRes = await fetch(fileUrl)
  if (!fileRes.ok) throw new Error(`Không tải được file: HTTP ${fileRes.status}`)
  const buf = Buffer.from(await fileRes.arrayBuffer())

  const startRes = await fetch(`${GEMINI_BASE}/files?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(buf.length),
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: "video-analysis" } }),
  })
  const uploadUrl = startRes.headers.get("x-goog-upload-url")
  if (!uploadUrl) throw new Error("Gemini upload init thất bại")

  const finishRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(buf.length),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: buf,
  })
  const fileInfo: any = await finishRes.json()
  if (!fileInfo?.file?.uri) throw new Error("Gemini upload finalize thất bại: " + JSON.stringify(fileInfo))
  return fileInfo.file.uri as string
}

async function waitForFileActive(fileUri: string, timeoutMs = 120_000): Promise<void> {
  const name = fileUri.split("/files/")[1]
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const r = await fetch(`${GEMINI_BASE}/files/${name}?key=${GEMINI_API_KEY}`)
    const d: any = await r.json()
    if (d.state === "ACTIVE") return
    if (d.state === "FAILED") throw new Error("Gemini file xử lý thất bại")
    await new Promise(res => setTimeout(res, 3000))
  }
  throw new Error("Gemini file timeout khi chờ ACTIVE")
}

export type AiReview = {
  diem_ban_hang: number
  diem_chi_tiet: { hook: number; demo: number; loi_thoai: number; cta: number; chat_luong: number }
  tong_quan: string
  nhan_xet_quanly: string
  loi_thoai: string
  loi_video: string[]
  diem_manh: string[]
  tung_canh: Array<{ stt: number; timestamp: string; mo_ta_hinh: string; loi_thoai_canh: string }>
  ket_luan_quanly: string
}

/** Upload video từ URL (Drive direct-download link) → Gemini → phân tích, trả JSON review. */
export async function analyzeVideoWithGemini(
  videoUrl: string,
  model = "gemini-2.0-flash"
): Promise<AiReview> {
  if (!GEMINI_API_KEY) throw new Error("Chưa cấu hình GEMINI_API_KEY")

  const fileUri = await uploadFileFromUrl(videoUrl)
  await waitForFileActive(fileUri)

  const genRes = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { file_data: { file_uri: fileUri, mime_type: "video/mp4" } },
          { text: ANALYSIS_PROMPT },
        ],
      }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  })
  const data: any = await genRes.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini không trả về kết quả phân tích: " + JSON.stringify(data).slice(0, 300))

  try {
    return JSON.parse(text) as AiReview
  } catch {
    throw new Error("Gemini trả JSON không hợp lệ")
  }
}
