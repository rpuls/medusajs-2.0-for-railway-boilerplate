import { FB_SYSTEM_TOKEN, FB_ACCESS_TOKEN } from "./constants"

const FB_GRAPH = "https://graph.facebook.com/v18.0"

/** System User Token (không hết hạn) → fallback FB_ACCESS_TOKEN. */
export function getSysToken(): string {
  return FB_SYSTEM_TOKEN || FB_ACCESS_TOKEN || ""
}

export function isTokenError(e: any): boolean {
  const msg = String(e?.message || "")
  return /access token|OAuthException|code 190/i.test(msg)
}

/** Convert link Google Drive dạng /view → direct-download để FB Graph API đọc được byte file. */
function toDirectFileUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  return url
}

/** Gọi FB Graph API. method GET/POST. body cho POST (form-encoded). */
export async function callFb(method: "GET" | "POST", path: string, body?: Record<string, any>): Promise<any> {
  const token = getSysToken()
  const url = `${FB_GRAPH}${path}${path.includes("?") ? "&" : "?"}access_token=${token}`
  const opts: any = { method }
  if (method === "POST" && body) {
    const form = new URLSearchParams()
    for (const [k, v] of Object.entries(body)) {
      form.append(k, typeof v === "object" ? JSON.stringify(v) : String(v))
    }
    opts.body = form
  }
  const res = await fetch(url, opts)
  const text = await res.text()
  let data: any
  try { data = JSON.parse(text) } catch { throw new Error(`FB parse error: ${text.slice(0, 300)}`) }
  if (data?.error) throw new Error(`FB: ${data.error.message} (code ${data.error.code})`)
  return data
}

/** Lấy tất cả Page + access token mà system user quản lý. */
export async function fetchAllPageTokens(): Promise<Array<{
  page_id: string; page_name: string; access_token: string; category: string | null; fan_count: number
}>> {
  let url = `/me/accounts?fields=id,name,category,fan_count,access_token&limit=100`
  const all: any[] = []
  while (url) {
    const d = await callFb("GET", url)
    for (const p of (d.data || [])) {
      all.push({
        page_id: p.id,
        page_name: p.name,
        access_token: p.access_token,
        category: p.category || null,
        fan_count: p.fan_count || 0,
      })
    }
    url = d.paging?.next ? d.paging.next.replace(FB_GRAPH, "").replace(/&access_token=[^&]*/, "") : ""
  }
  return all
}

/** Đăng bài (text/photo/video) lên 1 Page. Trả post_id. */
export async function publishPost(opts: {
  pageId: string; pageToken: string; message: string
  driveUrl?: string; mediaType: "text" | "video" | "photo"
  scheduledTime?: number; title?: string
}): Promise<{ post_id: string }> {
  const base = `https://graph.facebook.com/v18.0`
  const isScheduled = !!opts.scheduledTime

  if (opts.mediaType === "video" && opts.driveUrl) {
    const f = new URLSearchParams()
    f.append("access_token", opts.pageToken)
    f.append("description", opts.message)
    f.append("file_url", toDirectFileUrl(opts.driveUrl))
    if (opts.title) f.append("title", opts.title)
    if (isScheduled) {
      f.append("published", "false")
      f.append("scheduled_publish_time", String(opts.scheduledTime))
    }
    const r = await fetch(`${base}/${opts.pageId}/videos`, { method: "POST", body: f }).then(r => r.json()) as any
    if (r?.error) throw new Error(r.error.message)
    return { post_id: r.id }
  }

  if (opts.mediaType === "photo" && opts.driveUrl) {
    const f = new URLSearchParams()
    f.append("access_token", opts.pageToken)
    f.append("caption", opts.message)
    f.append("url", toDirectFileUrl(opts.driveUrl))
    if (isScheduled) {
      f.append("published", "false")
      f.append("scheduled_publish_time", String(opts.scheduledTime))
    }
    const r = await fetch(`${base}/${opts.pageId}/photos`, { method: "POST", body: f }).then(r => r.json()) as any
    if (r?.error) throw new Error(r.error.message)
    return { post_id: r.post_id || r.id }
  }

  // text post
  const f = new URLSearchParams()
  f.append("access_token", opts.pageToken)
  f.append("message", opts.message)
  if (isScheduled) {
    f.append("published", "false")
    f.append("scheduled_publish_time", String(opts.scheduledTime))
  }
  const r = await fetch(`${base}/${opts.pageId}/feed`, { method: "POST", body: f }).then(r => r.json()) as any
  if (r?.error) throw new Error(r.error.message)
  return { post_id: r.id }
}

/** Lấy insights cơ bản của 1 post đã đăng. */
export async function getPostInsights(postId: string, pageToken: string): Promise<{
  likes: number; comments: number; shares: number; reach: number; video_views: number
}> {
  const url = `${FB_GRAPH}/${postId}?fields=likes.summary(true),comments.summary(true),shares,insights.metric(post_impressions_unique,post_video_views)&access_token=${pageToken}`
  const r = await fetch(url).then(r => r.json()) as any
  if (r?.error) throw new Error(r.error.message)
  const insights = (r.insights?.data || []) as any[]
  const getMetric = (name: string) => insights.find(i => i.name === name)?.values?.[0]?.value || 0
  return {
    likes: r.likes?.summary?.total_count || 0,
    comments: r.comments?.summary?.total_count || 0,
    shares: r.shares?.count || 0,
    reach: getMetric("post_impressions_unique"),
    video_views: getMetric("post_video_views"),
  }
}
