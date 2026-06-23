import type { MedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { Pool } from "pg"

/**
 * Push thông báo vào Medusa Notifications panel.
 * Fire-and-forget — không throw để không ảnh hưởng response chính.
 */
export async function pushNotification(req: MedusaRequest, opts: {
  title: string
  description?: string
  channel?: string
}): Promise<void> {
  try {
    const notifService = req.scope.resolve(Modules.NOTIFICATION)
    await (notifService as any).createNotifications({
      channel: opts.channel ?? "feed",
      template: "admin-ui",
      to: "admin",
      data: { title: opts.title, description: opts.description ?? "" },
    })
  } catch {
    // silent — không block response
  }
}

let _pool: Pool | null = null
export function getPool(): Pool {
  if (!_pool) _pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return _pool
}

export type AuthInfo = {
  email: string
  isSuper: boolean
  isAdmin: boolean
  fbPageIds: string[] | null
  mktCode: string | null
}

export async function getAuthInfo(req: MedusaRequest): Promise<AuthInfo | null> {
  const auth = (req as any).auth_context
  if (auth?.actor_type !== "user" || !auth?.actor_id) return null
  const userModule = req.scope.resolve(Modules.USER)
  const user = await userModule.retrieveUser(auth.actor_id, { select: ["id", "email", "metadata"] })
  const isSuper = !!(user.email && user.email === process.env.SUPER_ADMIN_EMAIL)
  const perms: string[] = Array.isArray((user.metadata as any)?.permissions) ? (user.metadata as any).permissions : []
  const isAdmin = isSuper || perms.includes("users.manage")
  const raw = (user.metadata as any)?.fb_page_ids
  const fbPageIds = isAdmin ? null : (Array.isArray(raw) ? raw.map(String) : [])
  const mktCode = (user.metadata as any)?.mkt_code ?? null
  return { email: user.email || "", isSuper, isAdmin, fbPageIds, mktCode }
}

let _tablesReady = false

/** Tạo bảng + sequence nếu chưa có. Idempotent — gọi trước mỗi write/read operation. */
export async function ensureTables(pool: Pool): Promise<void> {
  if (_tablesReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mkt_video (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vd_code      VARCHAR(16) UNIQUE NOT NULL DEFAULT 'VD0',
      post_date    DATE,
      source       VARCHAR(16) DEFAULT 'team',
      maker        VARCHAR(64) NOT NULL,
      product      VARCHAR(128),
      product_code VARCHAR(64),
      video_type   VARCHAR(32),
      link         TEXT,
      status       VARCHAR(20) DEFAULT 'todo',
      note         TEXT,
      ad_name      VARCHAR(128),
      script       TEXT,
      created_by   VARCHAR(255) NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT now(),
      updated_at   TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`CREATE SEQUENCE IF NOT EXISTS mkt_video_vd_seq START 1001`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS ad_name VARCHAR(128)`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS script TEXT`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS ai_score NUMERIC(4,1)`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS ai_review JSONB`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS fb_post_links JSONB DEFAULT '[]'`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS deadline DATE`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS ai_status VARCHAR(20) DEFAULT NULL`)
  await pool.query(`ALTER TABLE mkt_video ADD COLUMN IF NOT EXISTS media_type VARCHAR(8) DEFAULT NULL`)
  // Reset stale jobs (restart server giữa chừng khi đang phân tích AI)
  await pool.query(`
    UPDATE mkt_video SET ai_status = 'error'
    WHERE ai_status IN ('queued','uploading','transcribing','analyzing')
      AND updated_at < now() - interval '10 minutes'
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mkt_product (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      code        VARCHAR(64)  NOT NULL DEFAULT '',
      pancake_id  VARCHAR(64),
      active      BOOLEAN DEFAULT true,
      created_at  TIMESTAMPTZ DEFAULT now(),
      updated_at  TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'mkt_product_pancake_id_key'
      ) THEN
        ALTER TABLE mkt_product ADD CONSTRAINT mkt_product_pancake_id_key UNIQUE (pancake_id);
      END IF;
    END $$
  `).catch(() => {})
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fb_page_token (
      page_id      VARCHAR(32) PRIMARY KEY,
      page_name    VARCHAR(255) NOT NULL,
      access_token TEXT NOT NULL,
      category     VARCHAR(128),
      fan_count    INT DEFAULT 0,
      hoat_dong    VARCHAR(20) DEFAULT 'active',
      fetched_at   TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`ALTER TABLE fb_page_token ADD COLUMN IF NOT EXISTS hoat_dong VARCHAR(20) DEFAULT 'active'`)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fb_scheduled_post (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id       VARCHAR(32) NOT NULL,
      page_name     VARCHAR(255),
      post_id       VARCHAR(64),
      message       TEXT NOT NULL,
      drive_url     TEXT,
      media_type    VARCHAR(16) DEFAULT 'text',
      video_id      UUID,
      scheduled_for TIMESTAMPTZ,
      published_at  TIMESTAMPTZ,
      status        VARCHAR(20) DEFAULT 'pending',
      error_msg     TEXT,
      created_by    VARCHAR(255) NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_fb_post_status ON fb_scheduled_post (status, scheduled_for)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_fb_post_page   ON fb_scheduled_post (page_id, created_at DESC)`)
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_fb_post_post_id ON fb_scheduled_post (post_id) WHERE post_id IS NOT NULL`)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fb_post_stats (
      post_id       VARCHAR(64) PRIMARY KEY,
      page_id       VARCHAR(32) NOT NULL,
      page_name     VARCHAR(255),
      message       TEXT,
      media_type    VARCHAR(16),
      thumbnail_url TEXT,
      product_code  VARCHAR(64),
      product_name  VARCHAR(255),
      created_by    VARCHAR(255),
      published_at  TIMESTAMPTZ,
      likes         INT DEFAULT 0,
      comments      INT DEFAULT 0,
      shares        INT DEFAULT 0,
      reach         INT DEFAULT 0,
      video_views   INT DEFAULT 0,
      synced_at     TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`ALTER TABLE fb_post_stats ADD COLUMN IF NOT EXISTS message TEXT`)
  await pool.query(`ALTER TABLE fb_post_stats ADD COLUMN IF NOT EXISTS media_type VARCHAR(16)`)
  await pool.query(`ALTER TABLE fb_post_stats ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`)
  await pool.query(`ALTER TABLE fb_post_stats ADD COLUMN IF NOT EXISTS product_code VARCHAR(64)`)
  await pool.query(`ALTER TABLE fb_post_stats ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)`)
  await pool.query(`ALTER TABLE fb_post_stats ADD COLUMN IF NOT EXISTS created_by VARCHAR(255)`)
  await pool.query(`ALTER TABLE fb_post_stats ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_fb_stats_page ON fb_post_stats (page_id, published_at DESC)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_fb_stats_product ON fb_post_stats (product_code)`)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS fb_publish_job (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      total       INT NOT NULL DEFAULT 0,
      done        INT NOT NULL DEFAULT 0,
      status      VARCHAR(20) DEFAULT 'running',
      progress    JSONB DEFAULT '[]',
      created_by  VARCHAR(255),
      created_at  TIMESTAMPTZ DEFAULT now(),
      finished_at TIMESTAMPTZ
    )
  `)
  _tablesReady = true
}

/** Sinh vd_code kế tiếp dạng "VD<n>". */
export async function nextVdCode(pool: Pool): Promise<string> {
  const { rows } = await pool.query(`SELECT nextval('mkt_video_vd_seq') AS n`)
  return `VD${rows[0].n}`
}

/** Map trạng thái tiếng Việt (UI) ↔ key DB. */
export const STATUS_VI_TO_KEY: Record<string, string> = {
  "Cần làm": "todo",
  "Đang làm": "doing",
  "Chờ duyệt": "review",
  "Xong": "done",
  "Đã đăng": "posted",
  "Lỗi": "error",
}
export const STATUS_KEY_TO_VI: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_VI_TO_KEY).map(([vi, key]) => [key, vi])
)

/** Lọc page theo quyền marketer (fb_page_ids). isAdmin/isSuper → all. */
export function filterByPerm<T extends { page_id: string }>(pages: T[], auth: AuthInfo): T[] {
  if (auth.isAdmin || auth.fbPageIds === null) return pages
  const allow = new Set(auth.fbPageIds)
  return pages.filter(p => allow.has(p.page_id))
}
