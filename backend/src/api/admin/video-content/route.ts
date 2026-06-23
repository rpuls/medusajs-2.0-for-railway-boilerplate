import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { getPool, getAuthInfo, ensureTables, nextVdCode, pushNotification, STATUS_KEY_TO_VI, STATUS_VI_TO_KEY } from "./_lib"

const VIDEO_TYPE_CODE: Record<string, string> = {
  "Video AI": "VIDEOAI",
  "Real":     "REAL",
  "Review":   "REVIEW",
  "RAW":      "RAW",
}

/** Sinh ad_name: {MKT_CODE}_{PRODUCT_CODE}_{VIDEO_TYPE}_{VD_CODE} */
function computeAdName(r: any, mktCode?: string): string {
  const mkCode = (mktCode || "MKT").toUpperCase()
  const spCode = (r.product_code || "SP").replace(/[^A-Z0-9]/gi, "").toUpperCase()
  const vtCode = VIDEO_TYPE_CODE[r.video_type] || (r.video_type || "VIDEO").toUpperCase().replace(/\s+/g, "")
  return `${mkCode}_${spCode}_${vtCode}_${r.vd_code}`
}

/** Map 1 DB row → shape UI (field tiếng Việt). */
function toUiRow(r: any) {
  return {
    id: r.id,
    vdCode: r.vd_code,
    ngayDang: r.post_date ? new Date(r.post_date).toISOString().slice(0, 10) : "",
    postDate: r.post_date,
    createdAt: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "",
    adName: r.ad_name || computeAdName(r),
    script: r.script || "",
    nguon: r.source === "ctv" ? "CTV" : "Team",
    nguoiLam: r.maker,
    sp: r.product || "",
    productCode: r.product_code || "",
    loaiVideo: r.video_type || "",
    link: r.link || "",
    trangThai: STATUS_KEY_TO_VI[r.status] || "Cần làm",
    ghiChu: r.note || "",
    createdBy: r.created_by,
    fbPostLinks: Array.isArray(r.fb_post_links) ? r.fb_post_links : [],
    deadline: r.deadline ? new Date(r.deadline).toISOString().slice(0, 10) : null,
    aiScore: r.ai_score ? parseFloat(r.ai_score) : null,
    aiReview: r.ai_review || null,
    aiStatus: r.ai_status ?? null,
    starred: !!r.starred,
    mediaType: r.media_type ?? null,
  }
}

/**
 * GET /admin/video-content?maker=&status=&product=&from=&to=&mine=true&q=
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })

    const q = req.query as Record<string, string>
    const params: any[] = []
    let where = "WHERE 1=1"

    if (q.maker && q.maker !== "all") { params.push(q.maker); where += ` AND maker = $${params.length}` }
    if (q.status && q.status !== "all") {
      const key = STATUS_VI_TO_KEY[q.status] || q.status
      params.push(key); where += ` AND status = $${params.length}`
    }
    if (q.product && q.product !== "all") { params.push(`${q.product}%`); where += ` AND product ILIKE $${params.length}` }
    if (q.from) { params.push(q.from); where += ` AND post_date >= $${params.length}` }
    if (q.to)   { params.push(q.to);   where += ` AND post_date <= $${params.length}` }
    if (q.mine === "true" && auth.email) { params.push(auth.email); where += ` AND created_by = $${params.length}` }
    if (q.q) {
      params.push(`%${q.q}%`)
      where += ` AND (product ILIKE $${params.length} OR note ILIKE $${params.length})`
    }

    const pool = getPool()
    await ensureTables(pool)
    const { rows } = await pool.query(
      `SELECT * FROM mkt_video ${where} ORDER BY post_date DESC NULLS LAST, created_at DESC`,
      params
    )

    const isVdCodeOnly = (s: string) => /^VD\d+$/.test(s)
    const needsFill = rows.filter(r => !r.ad_name || isVdCodeOnly(r.ad_name))
    if (needsFill.length > 0) {
      const userModule = (req as any).scope.resolve(Modules.USER)
      const allUsers = await userModule.listUsers({}, { select: ["id", "first_name", "last_name", "metadata"] })
      const mktCodeByName: Record<string, string> = {}
      for (const u of allUsers) {
        const name = [u.first_name, u.last_name].filter(Boolean).join(" ")
        const code = (u.metadata as any)?.mkt_code
        if (name && code) mktCodeByName[name] = code
      }
      await Promise.all(needsFill.map(r => {
        const mktCode = mktCodeByName[r.maker] || r.maker.toUpperCase().replace(/\s+/g, "").slice(0, 8)
        r.ad_name = computeAdName(r, mktCode)
        return pool.query(`UPDATE mkt_video SET ad_name = $1 WHERE id = $2`, [r.ad_name, r.id])
      }))
    }
    return res.json({ rows: rows.map(toUiRow), total: rows.length })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * POST /admin/video-content — tạo dòng video mới, tự sinh vd_code.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })

    const b: Record<string, any> = (req.body && typeof req.body === "object") ? (req.body as any) : {}
    const maker: string = b.nguoiLam ?? b.maker
    if (!maker) return res.status(400).json({ error: "Thiếu người làm" })

    const source = (b.nguon === "CTV" || b.source === "ctv") ? "ctv" : "team"
    const statusVi: string = b.trangThai ?? "Cần làm"
    const status = STATUS_VI_TO_KEY[statusVi] || "todo"
    const postDate: string | null = (b.postDate ?? b.post_date) || null

    const pool = getPool()
    await ensureTables(pool)
    const vdCode = await nextVdCode(pool)

    const userModule = (req as any).scope.resolve(Modules.USER)
    const userDetail = await userModule.retrieveUser((req as any).auth_context.actor_id, { select: ["metadata"] })
    const mktCode: string = (userDetail.metadata as any)?.mkt_code || maker.toUpperCase().replace(/\s+/g, "").slice(0, 8)

    const spRaw: string = b.sp ?? b.product ?? ""
    const productCode: string = b.productCode ?? b.product_code ?? ""
    const videoType: string = b.loaiVideo ?? b.video_type ?? "Video AI"
    const mediaType: string | null = b.mediaType ?? b.media_type ?? null
    const adName = computeAdName({ product_code: productCode, video_type: videoType, vd_code: vdCode }, mktCode)

    const { rows: [row] } = await pool.query(
      `INSERT INTO mkt_video
        (vd_code, post_date, source, maker, product, product_code, video_type, link, status, note, ad_name, script, deadline, created_by, media_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        vdCode, postDate, source, maker, spRaw, productCode || null, videoType,
        b.link ?? "", status, b.ghiChu ?? b.note ?? "", adName, b.script ?? "",
        (b.deadline || null), auth.email, mediaType,
      ]
    )

    const sp = row.product ? ` — ${row.product}` : ""
    await pushNotification(req, {
      title: `🎬 Video mới: ${row.vd_code}${sp}`,
      description: `Người làm: ${row.maker} · Loại: ${row.video_type} · Trạng thái: ${STATUS_KEY_TO_VI[row.status] || row.status}`,
    })

    return res.json({ row: toUiRow(row) })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
