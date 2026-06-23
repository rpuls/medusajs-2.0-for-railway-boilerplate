import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPool, ensureTables, getAuthInfo } from "../_lib"
import { fetchPancakeProducts } from "../../../../lib/pancake-client"

/**
 * GET /admin/video-content/products — danh sách SP từ DB (bảng mkt_product)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const pool = getPool()
    await ensureTables(pool)
    const { rows } = await pool.query(
      `SELECT id, name, code, pancake_id, active FROM mkt_product ORDER BY active DESC, name ASC`
    )
    return res.json({ products: rows })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * POST /admin/video-content/products
 * Body: { action: "sync" } — pull từ Pancake về DB
 *    hoặc { name, code, pancake_id? } — thêm thủ công
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })

    const pool = getPool()
    await ensureTables(pool)
    const b = (req.body as any) ?? {}

    if (b.action === "sync") {
      let fetched: { name: string; code: string; pancake_id: string }[]
      try {
        fetched = await fetchPancakeProducts()
      } catch (e: any) {
        return res.status(503).json({ error: e.message })
      }

      let upserted = 0
      for (const p of fetched) {
        try {
          await pool.query(`
            INSERT INTO mkt_product (name, code, pancake_id, active, updated_at)
            VALUES ($1, $2, $3, true, now())
            ON CONFLICT (pancake_id) DO UPDATE SET
              name = EXCLUDED.name,
              code = EXCLUDED.code,
              active = true,
              updated_at = now()
          `, [p.name, p.code, p.pancake_id])
          upserted++
        } catch (e: any) {
          console.error("[video-content products sync] upsert error:", e.message, p)
        }
      }

      return res.json({ ok: true, synced: upserted, total: fetched.length })
    }

    const { name, code = "", pancake_id = null } = b
    if (!name?.trim()) return res.status(400).json({ error: "Thiếu tên SP" })
    const { rows: [row] } = await pool.query(
      `INSERT INTO mkt_product (name, code, pancake_id, active) VALUES ($1, $2, $3, true) RETURNING *`,
      [name.trim(), code.trim().toUpperCase(), pancake_id || null]
    )
    return res.json({ product: row })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
