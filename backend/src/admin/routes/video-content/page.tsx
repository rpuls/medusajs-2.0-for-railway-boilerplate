import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useMemo, useState } from "react"
import { T, STATUS_COLORS, ALL_STATUSES, VT_COLORS } from "../../components/video-content/tokens"
import { useResizableColumns, ResizeHandle, type ColumnDef } from "../../lib/resizable-columns"

type VideoRow = {
  id: string
  vdCode: string
  ngayDang: string
  adName?: string
  script?: string
  nguon: string
  nguoiLam: string
  sp: string
  productCode?: string
  loaiVideo: string
  link: string
  trangThai: string
  ghiChu: string
  deadline?: string | null
  aiScore?: number | null
  aiReview?: any
  aiStatus?: string | null
  starred?: boolean
  mediaType?: string | null
}

type Page = { page_id: string; page_name: string; category?: string; fan_count?: number; hoat_dong?: string }

function getDriveFileId(url: string): string | null {
  if (!url) return null
  // /file/d/{id}/view  hoặc  ?id={id}
  const m = url.match(/\/file\/d\/([^/?#]+)/) || url.match(/[?&]id=([^&]+)/)
  return m ? m[1] : null
}

function DrivePreview({ link, label = "Xem" }: { link: string; label?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const fileId = getDriveFileId(link)
  if (!fileId) return <a href={link} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: 12, whiteSpace: "nowrap" }}>{label}</a>
  const thumb = `https://lh3.googleusercontent.com/d/${fileId}`

  function handleEnter(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({ x: r.left + r.width / 2, y: r.top })
  }

  return (
    <>
      <a
        href={link} target="_blank" rel="noreferrer"
        style={{ color: T.accent, fontSize: 12, whiteSpace: "nowrap" }}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setPos(null)}
      >{label}</a>
      {pos && (
        <div style={{
          position: "fixed",
          left: pos.x, top: pos.y - 8,
          transform: "translate(-50%, -100%)",
          zIndex: 99999, background: "#fff", borderRadius: 8, padding: 4,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)", pointerEvents: "none",
        }}>
          <img
            src={thumb} alt="preview"
            referrerPolicy="no-referrer"
            style={{ width: 220, height: "auto", borderRadius: 6, display: "block" }}
            onError={e => { (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400` }}
          />
        </div>
      )}
    </>
  )
}

const BANG_TAB_COLS: ColumnDef[] = [
  { id: "sel", width: 36, min: 36 },
  { id: "stt", width: 36, min: 36 },
  { id: "vd", width: 72, min: 60 },
  { id: "ngay", width: 84, min: 70 },
  { id: "nguon", width: 64, min: 56 },
  { id: "nguoilam", width: 130, min: 90 },
  { id: "deadline", width: 80, min: 70 },
  { id: "sp", width: 170, min: 100 },
  { id: "loai", width: 84, min: 70 },
  { id: "link", width: 64, min: 56 },
  { id: "mediatype", width: 60, min: 52 },
  { id: "trangthai", width: 100, min: 90 },
  { id: "adname", width: 180, min: 120 },
  { id: "ghichu", width: 160, min: 100 },
  { id: "actions", width: 170, min: 150 },
]

async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/admin/video-content${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS["Cần làm"]
  return (
    <span style={{ color: c.c, background: c.bg, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {status}
    </span>
  )
}

function Th({ children, width }: { children: React.ReactNode; width: number }) {
  return (
    <th style={{
      position: "relative", width, minWidth: width, maxWidth: width,
      textAlign: "left", fontSize: 12, fontWeight: 600, color: T.text2,
      padding: "8px 10px", borderBottom: `1px solid ${T.border}`, background: T.subtle,
    }}>
      {children}
    </th>
  )
}

function Td({ children, width }: { children?: React.ReactNode; width: number }) {
  return (
    <td style={{
      width, minWidth: width, maxWidth: width, overflow: "hidden", textOverflow: "ellipsis",
      padding: "8px 10px", borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.text1, verticalAlign: "middle",
    }}>
      {children}
    </td>
  )
}

function VideoTableTab() {
  const [rows, setRows] = useState<VideoRow[]>([])
  const [products, setProducts] = useState<{ name: string; code: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [filterMaker, setFilterMaker] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [aiModalRow, setAiModalRow] = useState<VideoRow | null>(null)
  const [quickAdd, setQuickAdd] = useState({ nguoiLam: "", sp: "", loaiVideo: "Video AI", link: "", nguon: "Team", mediaType: "" })

  const { colWidths, onResizeMouseDown } = useResizableColumns("video-content-bang.col-widths.v1", BANG_TAB_COLS)

  async function load() {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (filterMaker !== "all") q.set("maker", filterMaker)
      if (filterStatus !== "all") q.set("status", filterStatus)
      if (search) q.set("q", search)
      const data = await api(`?${q.toString()}`)
      setRows(data.rows)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterMaker, filterStatus])
  useEffect(() => {
    api("/products").then(d => setProducts((d.products ?? []).filter((p: any) => p.name && p.active !== false))).catch(() => {})
  }, [])

  const makers = useMemo(() => Array.from(new Set(rows.map(r => r.nguoiLam))).filter(Boolean), [rows])

  // Poll ai_status cho các dòng đang xử lý
  useEffect(() => {
    const processing = rows.filter(r => r.aiStatus && !["done", "error"].includes(r.aiStatus))
    if (!processing.length) return
    const t = setInterval(async () => {
      for (const r of processing) {
        try {
          const data = await api(`/${r.id}`)
          setRows(prev => prev.map(p => p.id === r.id ? { ...p, aiStatus: data.aiStatus, aiScore: data.aiScore } : p))
        } catch {}
      }
    }, 4000)
    return () => clearInterval(t)
  }, [rows])

  async function handleQuickAdd() {
    if (!quickAdd.nguoiLam.trim()) return
    await api("", { method: "POST", body: JSON.stringify(quickAdd) })
    setQuickAdd({ nguoiLam: "", sp: "", loaiVideo: "Video AI", link: "", nguon: "Team", mediaType: "" })
    load()
  }

  async function updateRow(id: string, patch: Record<string, any>) {
    await api(`/${id}`, { method: "PATCH", body: JSON.stringify(patch) })
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  async function deleteRow(id: string) {
    if (!confirm("Xoá dòng video này?")) return
    await api(`/${id}`, { method: "DELETE" })
    setRows(prev => prev.filter(r => r.id !== id))
  }

  async function analyzeRow(id: string) {
    await api(`/${id}/analyze`, { method: "POST", body: JSON.stringify({}) })
    setRows(prev => prev.map(r => r.id === id ? { ...r, aiStatus: "queued" } : r))
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select value={filterMaker} onChange={e => setFilterMaker(e.target.value)} style={selectStyle}>
          <option value="all">Tất cả người làm</option>
          {makers.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="all">Tất cả trạng thái</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          placeholder="Tìm sản phẩm/ghi chú..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load()}
          style={{ ...selectStyle, width: 220 }}
        />
        <button onClick={load} style={btnPrimary}>Tải lại</button>
      </div>

      <datalist id="mkt-products">
        {products.map(p => <option key={p.code || p.name} value={p.name} />)}
      </datalist>

      <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: 8, background: T.card }}>
        <table style={{ borderCollapse: "collapse", width: "max-content" }}>
          <thead>
            <tr>
              <Th width={colWidths.sel}>#</Th>
              <Th width={colWidths.stt}>STT</Th>
              <Th width={colWidths.vd}>VD<ResizeHandle onMouseDown={onResizeMouseDown("vd")} /></Th>
              <Th width={colWidths.ngay}>Ngày<ResizeHandle onMouseDown={onResizeMouseDown("ngay")} /></Th>
              <Th width={colWidths.nguon}>Nguồn<ResizeHandle onMouseDown={onResizeMouseDown("nguon")} /></Th>
              <Th width={colWidths.nguoilam}>Người làm<ResizeHandle onMouseDown={onResizeMouseDown("nguoilam")} /></Th>
              <Th width={colWidths.deadline}>Deadline<ResizeHandle onMouseDown={onResizeMouseDown("deadline")} /></Th>
              <Th width={colWidths.sp}>Sản phẩm<ResizeHandle onMouseDown={onResizeMouseDown("sp")} /></Th>
              <Th width={colWidths.loai}>Loại<ResizeHandle onMouseDown={onResizeMouseDown("loai")} /></Th>
              <Th width={colWidths.link}>Link<ResizeHandle onMouseDown={onResizeMouseDown("link")} /></Th>
              <Th width={colWidths.mediatype}>File<ResizeHandle onMouseDown={onResizeMouseDown("mediatype")} /></Th>
              <Th width={colWidths.trangthai}>Trạng thái<ResizeHandle onMouseDown={onResizeMouseDown("trangthai")} /></Th>
              <Th width={colWidths.adname}>Ad name<ResizeHandle onMouseDown={onResizeMouseDown("adname")} /></Th>
              <Th width={colWidths.ghichu}>Ghi chú<ResizeHandle onMouseDown={onResizeMouseDown("ghichu")} /></Th>
              <Th width={colWidths.actions}>Hành động</Th>
            </tr>
            <tr>
              <Td width={colWidths.sel}></Td>
              <Td width={colWidths.stt}></Td>
              <Td width={colWidths.vd}></Td>
              <Td width={colWidths.ngay}></Td>
              <Td width={colWidths.nguon}>
                <select value={quickAdd.nguon === "CTV" ? "CTV" : "Team"} onChange={e => setQuickAdd(q => ({ ...q, nguon: e.target.value } as any))} style={miniInput}>
                  <option>Team</option><option>CTV</option>
                </select>
              </Td>
              <Td width={colWidths.nguoilam}>
                <input placeholder="Người làm" value={quickAdd.nguoiLam} onChange={e => setQuickAdd(q => ({ ...q, nguoiLam: e.target.value }))} style={miniInput} />
              </Td>
              <Td width={colWidths.deadline}></Td>
              <Td width={colWidths.sp}>
                <input list="mkt-products" placeholder="Sản phẩm" value={quickAdd.sp} onChange={e => setQuickAdd(q => ({ ...q, sp: e.target.value }))} style={miniInput} />
              </Td>
              <Td width={colWidths.loai}>
                <select value={quickAdd.loaiVideo} onChange={e => setQuickAdd(q => ({ ...q, loaiVideo: e.target.value }))} style={miniInput}>
                  {Object.keys(VT_COLORS).map(v => <option key={v}>{v}</option>)}
                </select>
              </Td>
              <Td width={colWidths.link}>
                <input placeholder="Link" value={quickAdd.link} onChange={e => setQuickAdd(q => ({ ...q, link: e.target.value }))} style={miniInput} />
              </Td>
              <Td width={colWidths.mediatype}>
                <select value={quickAdd.mediaType} onChange={e => setQuickAdd(q => ({ ...q, mediaType: e.target.value }))} style={miniInput}>
                  <option value="">—</option>
                  <option value="image">🖼 Ảnh</option>
                  <option value="video">🎬 Video</option>
                </select>
              </Td>
              <Td width={colWidths.trangthai}></Td>
              <Td width={colWidths.adname}></Td>
              <Td width={colWidths.ghichu}></Td>
              <Td width={colWidths.actions}>
                <button onClick={handleQuickAdd} style={btnPrimary}>+ Thêm</button>
              </Td>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ background: editingId === r.id ? T.accentSubtle : "transparent" }}>
                <Td width={colWidths.sel}>
                  <button onClick={() => updateRow(r.id, { starred: !r.starred })} style={{ background: "none", border: "none", cursor: "pointer", color: r.starred ? "#F59E0B" : T.text3 }}>★</button>
                </Td>
                <Td width={colWidths.stt}>{i + 1}</Td>
                <Td width={colWidths.vd}>{r.vdCode}</Td>
                <Td width={colWidths.ngay}>{r.ngayDang}</Td>
                <Td width={colWidths.nguon}>
                  <select defaultValue={r.nguon} onChange={e => updateRow(r.id, { nguon: e.target.value })} style={miniInput}>
                    <option>Team</option><option>CTV</option>
                  </select>
                </Td>
                <Td width={colWidths.nguoilam}>
                  <input defaultValue={r.nguoiLam} onBlur={e => updateRow(r.id, { nguoiLam: e.target.value })} style={miniInput} />
                </Td>
                <Td width={colWidths.deadline}>
                  <input type="date" defaultValue={r.deadline || ""} onBlur={e => updateRow(r.id, { deadline: e.target.value })} style={miniInput} />
                </Td>
                <Td width={colWidths.sp}>
                  <input list="mkt-products" defaultValue={r.sp} onBlur={e => updateRow(r.id, { sp: e.target.value })} style={miniInput} />
                </Td>
                <Td width={colWidths.loai}>
                  <select defaultValue={r.loaiVideo} onChange={e => updateRow(r.id, { loaiVideo: e.target.value })} style={{ ...miniInput, color: VT_COLORS[r.loaiVideo] || T.text2, fontWeight: 600 }}>
                    {Object.keys(VT_COLORS).map(v => <option key={v}>{v}</option>)}
                  </select>
                </Td>
                <Td width={colWidths.link}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <input defaultValue={r.link} onBlur={e => updateRow(r.id, { link: e.target.value })} style={{ ...miniInput, flex: 1 }} />
                    {r.link && <DrivePreview link={r.link} />}
                  </div>
                </Td>
                <Td width={colWidths.mediatype}>
                  <select
                    value={r.mediaType ?? ""}
                    onChange={e => updateRow(r.id, { mediaType: e.target.value || null })}
                    style={{ ...miniInput, color: r.mediaType === "image" ? "#0891B2" : r.mediaType === "video" ? "#7C3AED" : T.text3, fontWeight: 600 }}
                  >
                    <option value="">—</option>
                    <option value="image">🖼 Ảnh</option>
                    <option value="video">🎬 Video</option>
                  </select>
                </Td>
                <Td width={colWidths.trangthai}>
                  <select value={r.trangThai} onChange={e => updateRow(r.id, { trangThai: e.target.value })} style={miniInput}>
                    {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Td>
                <Td width={colWidths.adname}>{r.adName}</Td>
                <Td width={colWidths.ghichu}>
                  <input defaultValue={r.ghiChu} onBlur={e => updateRow(r.id, { ghiChu: e.target.value })} style={miniInput} />
                </Td>
                <Td width={colWidths.actions}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => analyzeRow(r.id)}
                      disabled={!r.link || (!!r.aiStatus && !["done", "error"].includes(r.aiStatus))}
                      style={btnSecondary}
                    >
                      {r.aiStatus && !["done", "error"].includes(r.aiStatus) ? r.aiStatus : "Phân tích AI"}
                    </button>
                    {r.aiScore != null && (
                      <button onClick={() => setAiModalRow(r)} style={{ ...btnSecondary, fontWeight: 700 }}>{r.aiScore}/10</button>
                    )}
                    <button onClick={() => deleteRow(r.id)} style={{ ...btnSecondary, color: T.sErr }}>Xoá</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div style={{ padding: 12, color: T.text3 }}>Đang tải...</div>}

      {aiModalRow && <AiReviewModal row={aiModalRow} onClose={() => setAiModalRow(null)} />}
    </div>
  )
}

function AiReviewModal({ row, onClose }: { row: VideoRow; onClose: () => void }) {
  const review = row.aiReview
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: 12, padding: 24, width: 600, maxHeight: "80vh", overflowY: "auto", boxShadow: T.shadowMd }}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Kết quả phân tích AI — {row.vdCode}</h3>
        {!review ? <div style={{ color: T.text3 }}>Chưa có kết quả</div> : (
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <p><b>Điểm bán hàng:</b> {review.diem_ban_hang}/10</p>
            <p><b>Tổng quan:</b> {review.tong_quan}</p>
            <p><b>Nhận xét quản lý:</b> {review.nhan_xet_quanly}</p>
            <p><b>Điểm mạnh:</b> {(review.diem_manh || []).join(", ")}</p>
            <p><b>Lỗi video:</b> {(review.loi_video || []).join(", ")}</p>
            <p><b>Kết luận:</b> {review.ket_luan_quanly}</p>
          </div>
        )}
        <button onClick={onClose} style={{ ...btnPrimary, marginTop: 16 }}>Đóng</button>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function pageColor(id: string) {
  const colors = ["#1877F2","#E84042","#F59E0B","#10B981","#8B5CF6","#EF4444","#06B6D4","#F97316","#6366F1","#EC4899","#84CC16"]
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return colors[h % colors.length]
}

function FbToast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) }, [])
  return <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#1877F2", color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", borderRadius: 12, padding: "12px 18px", fontSize: 13, fontWeight: 500 }}>✓ {msg}</div>
}

const STATUS_POST: Record<string, { label: string; c: string; bg: string }> = {
  success:   { label: "Đã đăng",    c: "#059669", bg: "#DCFCE7" },
  published: { label: "Đã đăng",    c: "#059669", bg: "#DCFCE7" },
  scheduled: { label: "Lên lịch",   c: "#D97706", bg: "#FEF3C7" },
  cancelled: { label: "Đã hủy",     c: "#6B7280", bg: "#F3F4F6" },
  failed:    { label: "Lỗi",        c: "#DC2626", bg: "#FEE2E2" },
  pending:   { label: "Chờ",        c: "#6B7280", bg: "#F3F4F6" },
  running:   { label: "Đang xử lý", c: "#2563EB", bg: "#DBEAFE" },
}
const MEDIA_ICON: Record<string, string> = { video: "🎬", photo: "🖼️", text: "📝" }

// ── Tab: Đăng Facebook ─────────────────────────────────────────────────────────
const DRAFT_KEY = "kin_fb_dangbai_draft"

function FbPostTab() {
  const savedDraft = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") } catch { return null } })()
  const [content, setContent] = useState(savedDraft?.content || "")
  const [title, setTitle] = useState(savedDraft?.title || "")
  const [driveLink, setDriveLink] = useState(savedDraft?.driveLink || "")
  const [postType, setPostType] = useState<"text" | "video" | "anh">(savedDraft?.postType || "video")
  const [schedule, setSchedule] = useState<"now" | "schedule">("now")
  const [schedTime, setSchedTime] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [pages, setPages] = useState<Page[]>([])
  const [selPages, setSelPages] = useState<Set<string>>(new Set())
  const [pageQ, setPageQ] = useState("")
  const [posting, setPosting] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [results, setResults] = useState<any[]>([])
  const [showSim, setShowSim] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(!!savedDraft)

  // Autosave draft
  useEffect(() => {
    if (posting) return
    if (!content && !driveLink && !title) { localStorage.removeItem(DRAFT_KEY); return }
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, title, driveLink, postType }))
    }, 1000)
    return () => clearTimeout(t)
  }, [content, title, driveLink, postType, posting])

  useEffect(() => {
    api("/pages").then(d => {
      if (d.error === "FB_TOKEN_EXPIRED") setToast("Token FB hết hạn — liên hệ admin cập nhật FB_SYSTEM_TOKEN")
      setPages(d.pages || [])
    }).catch(() => {})
  }, [])

  const filteredPages = pages.filter(p => p.page_name.toLowerCase().includes(pageQ.toLowerCase()))
  const togglePage = (id: string) => setSelPages(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selectAll = () => setSelPages(selPages.size === filteredPages.length ? new Set() : new Set(filteredPages.map(p => p.page_id)))

  const clearDraft = () => { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); setTitle(""); setContent(""); setDriveLink("") }

  const pollJob = (jobId: string) => {
    const iv = setInterval(async () => {
      try {
        const d = await api(`/post/status?jobId=${jobId}`)
        setProgress({ done: d.done, total: d.total })
        setResults(d.progress || [])
        if (d.status !== "running") {
          clearInterval(iv); setPosting(false)
          const ok = (d.progress || []).filter((p: any) => p.status === "success").length
          setToast(`Hoàn thành: ${ok}/${d.total} trang thành công`)
        }
      } catch { clearInterval(iv); setPosting(false) }
    }, 2000)
  }

  const handlePost = async () => {
    if (!selPages.size) return
    setPosting(true); setShowSim(true); setResults([]); setProgress({ done: 0, total: selPages.size })
    try {
      const body: any = {
        page_ids: [...selPages], message: content,
        drive_url: driveLink, media_type: postType === "anh" ? "photo" : postType,
      }
      if (title.trim()) body.title = title.trim()
      if (schedule === "schedule") body.scheduled_for = new Date(schedTime).toISOString()
      const d = await api("/post", { method: "POST", body: JSON.stringify(body) })
      if (d?.jobId) { clearDraft(); pollJob(d.jobId) }
      else { setPosting(false); setToast("Lỗi: không tạo được job") }
    } catch (e: any) { setPosting(false); setToast("Lỗi: " + e.message) }
  }

  const inpCls: React.CSSProperties = { background: "#F0F1F5", color: "#111827", border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", width: "100%" }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <FbToast msg={toast} onDone={() => setToast(null)} />}
      {hasDraft && (
        <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <span style={{ color: "#92400E", fontSize: 13, flex: 1 }}>Đã khôi phục bản nháp từ lần trước.</span>
          <button onClick={clearDraft} style={{ background: "none", border: "1px solid #FDE68A", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#92400E", cursor: "pointer" }}>Xóa nháp</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>NỘI DUNG BÀI ĐĂNG</div>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Nhập nội dung bài đăng…" style={{ ...inpCls, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
            <div style={{ color: T.text3, fontSize: 11, textAlign: "right", marginTop: 4 }}>{content.length} ký tự</div>
          </div>
          {postType === "video" && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>TIÊU ĐỀ VIDEO <span style={{ color: T.text3, fontWeight: 400 }}>(tuỳ chọn)</span></div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: BỘ SƠ MI XANH PASTEL…" style={inpCls} />
            </div>
          )}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>LINK GOOGLE DRIVE</div>
            <input value={driveLink} onChange={e => setDriveLink(e.target.value)} placeholder="https://drive.google.com/file/…" style={inpCls} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "7px 10px", background: "#FEF3C7", border: "1px solid #F59E0B40", borderRadius: 8 }}>
              <span>⚠️</span><span style={{ color: "#92400E", fontSize: 12 }}>File phải để chế độ <b>"Anyone with the link"</b></span>
            </div>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>LOẠI NỘI DUNG</div>
            <div style={{ display: "flex", gap: 6 }}>
              {([["text","Văn bản"],["video","Video"],["anh","Ảnh"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setPostType(v)} style={{ flex: 1, padding: "8px 0", background: postType === v ? "#1877F2" : T.subtle, color: postType === v ? "#fff" : T.text2, border: `1px solid ${postType === v ? "#1877F2" : T.border}`, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>THỜI GIAN ĐĂNG</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {([["now","Đăng ngay"],["schedule","Lên lịch"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setSchedule(v)} style={{ flex: 1, padding: "8px 0", background: schedule === v ? "#1877F2" : T.subtle, color: schedule === v ? "#fff" : T.text2, border: `1px solid ${schedule === v ? "#1877F2" : T.border}`, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
            {schedule === "schedule" && <input type="datetime-local" value={schedTime} onChange={e => setSchedTime(e.target.value)} style={{ ...inpCls, width: "auto" }} />}
          </div>
        </div>
        {/* RIGHT — chọn trang */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>CHỌN TRANG ĐĂNG ({pages.length} trang)</div>
            <input value={pageQ} onChange={e => setPageQ(e.target.value)} placeholder="Tìm trang…" style={{ width: "100%", background: T.subtle, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", fontSize: 12, color: "#111827", outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={selectAll} style={{ color: "#1877F2", background: "none", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {selPages.size === filteredPages.length && filteredPages.length > 0 ? "Bỏ chọn tất cả" : `Chọn tất cả (${filteredPages.length})`}
              </button>
              {selPages.size > 0 && <span style={{ background: "#1877F2", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{selPages.size} trang</span>}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
            {filteredPages.map(p => (
              <label key={p.page_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", borderBottom: `1px solid ${T.border}` }}>
                <input type="checkbox" checked={selPages.has(p.page_id)} onChange={() => togglePage(p.page_id)} style={{ accentColor: "#1877F2", width: 15, height: 15, flexShrink: 0 }} />
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: pageColor(p.page_id), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{p.page_name.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#111827", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.page_name}</div>
                  <div style={{ color: T.text3, fontSize: 11 }}>{(p.fan_count || 0).toLocaleString("vi-VN")} người theo dõi</div>
                </div>
              </label>
            ))}
            {filteredPages.length === 0 && <div style={{ padding: 30, textAlign: "center", color: T.text3, fontSize: 13 }}>Không có trang nào</div>}
          </div>
        </div>
      </div>

      {/* Post button + progress */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={handlePost} disabled={!selPages.size || posting} style={{ background: selPages.size > 0 ? "#1877F2" : T.subtle, color: selPages.size > 0 ? "#fff" : T.text3, border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: selPages.size > 0 ? "pointer" : "default", opacity: posting ? 0.7 : 1 }}>
            {posting ? "Đang đăng…" : `Đăng ${selPages.size > 0 ? selPages.size : ""} trang`}
          </button>
          {selPages.size === 0 && <span style={{ color: T.text3, fontSize: 13 }}>Vui lòng chọn ít nhất 1 trang</span>}
        </div>
        {showSim && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: T.text2, fontSize: 13 }}>{posting ? "Đang đăng…" : "Hoàn thành"}</span>
              <span style={{ color: "#1877F2", fontSize: 13, fontWeight: 700 }}>{progress.done}/{progress.total}</span>
            </div>
            <div style={{ background: T.border, borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ height: "100%", background: "#1877F2", width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`, transition: "width 0.5s ease", borderRadius: 6 }} />
            </div>
            {results.length > 0 && (
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: T.subtle }}>{["Trang","Trạng thái","Post ID","Lỗi"].map((h, i) => <th key={i} style={{ padding: "8px 12px", textAlign: "left", color: T.text3, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} style={{ borderBottom: i < results.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <td style={{ padding: "8px 12px", color: "#111827", fontSize: 13 }}>{r.page_name}</td>
                        <td style={{ padding: "8px 12px" }}><span style={{ background: r.status === "success" ? "#D1FAE5" : "#FEE2E2", color: r.status === "success" ? "#059669" : "#DC2626", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{r.status === "success" ? "Thành công" : "Lỗi"}</span></td>
                        <td style={{ padding: "8px 12px", color: T.text3, fontSize: 11, fontFamily: "monospace" }}>{r.post_id || "—"}</td>
                        <td style={{ padding: "8px 12px", color: "#DC2626", fontSize: 12 }}>{r.error || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// ── Tab: Lịch đăng (list + calendar) ───────────────────────────────────────────
function LichDangTab() {
  const [posts, setPosts] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ posts: "1" })
    if (filterStatus !== "all") params.set("status", filterStatus)
    if (filterFrom) params.set("from", filterFrom)
    if (filterTo) params.set("to", filterTo)
    api(`/post?${params}`).then(d => setPosts(d.posts || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filterStatus, filterFrom, filterTo])

  const handleCancel = async (postId: string) => {
    if (!confirm("Hủy bài lên lịch này?")) return
    setCancellingId(postId)
    try {
      await api(`/post/${postId}`, { method: "DELETE" })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: "cancelled" } : p))
    } catch (e: any) {
      alert("Lỗi hủy bài: " + (e.message || "unknown"))
    } finally {
      setCancellingId(null)
    }
  }

  const inp: React.CSSProperties = { background: T.card, color: "#111827", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none" }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 2, background: T.subtle, borderRadius: 8, padding: 2 }}>
          <button onClick={() => setViewMode("calendar")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: viewMode === "calendar" ? T.card : "transparent", fontSize: 13, cursor: "pointer", boxShadow: viewMode === "calendar" ? T.shadowSm : "none" }}>📅 Lịch</button>
          <button onClick={() => setViewMode("list")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: viewMode === "list" ? T.card : "transparent", fontSize: 13, cursor: "pointer", boxShadow: viewMode === "list" ? T.shadowSm : "none" }}>☰ Danh sách</button>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inp}>
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="scheduled">Lên lịch</option>
          <option value="cancelled">Đã hủy</option>
          <option value="failed">Lỗi</option>
        </select>
        {viewMode === "list" && (
          <>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={inp} />
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={inp} />
          </>
        )}
        <button onClick={load} style={{ ...btnSecondary }}>↻ Làm mới</button>
        <span style={{ color: T.text3, fontSize: 12, marginLeft: "auto" }}>{posts.length} bài</span>
      </div>
      {loading && <div style={{ padding: 20, textAlign: "center", color: T.text3 }}>Đang tải…</div>}
      {!loading && viewMode === "calendar" && <CalendarView posts={posts} onCancel={handleCancel} cancellingId={cancellingId} />}
      {!loading && viewMode === "list" && <PostListView posts={posts} onCancel={handleCancel} cancellingId={cancellingId} />}
      {!loading && posts.length === 0 && <div style={{ padding: 40, textAlign: "center", color: T.text3 }}>Chưa có bài nào</div>}
    </div>
  )
}

function PostListView({ posts, onCancel, cancellingId }: { posts: any[]; onCancel: (id: string) => void; cancellingId: string | null }) {
  const grouped: Record<string, any[]> = {}
  for (const p of posts) {
    const d = new Date(p.published_at || p.scheduled_for || p.created_at || Date.now())
    const key = d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
    ;(grouped[key] = grouped[key] || []).push(p)
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Object.entries(grouped).map(([day, dayPosts]) => (
        <div key={day}>
          <div style={{ color: T.text2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{day}</div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            {dayPosts.map((p, i) => {
              const st = STATUS_POST[p.status] || STATUS_POST.pending
              const d = new Date(p.published_at || p.scheduled_for || p.created_at || Date.now())
              const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderBottom: i < dayPosts.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ minWidth: 65, textAlign: "center", paddingTop: 2 }}>
                    <div style={{ color: T.text1, fontSize: 12, fontWeight: 600 }}>{time}</div>
                    <span style={{ background: st.bg, color: st.c, borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 20, paddingTop: 2 }}>{MEDIA_ICON[p.media_type] || "📝"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#111827", fontSize: 13, fontWeight: 600 }}>{p.page_name || "—"}</span>
                      {p.post_id && (
                        <a href={`https://www.facebook.com/${p.post_id}`} target="_blank" rel="noreferrer" style={{ color: "#1877F2", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>↗ Xem bài</a>
                      )}
                    </div>
                    <div style={{ color: T.text2, fontSize: 12, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.message || "—"}</div>
                    {p.error_msg && <div style={{ color: "#DC2626", fontSize: 11, marginTop: 4 }}>⚠️ {p.error_msg}</div>}
                  </div>
                  {p.drive_url && (
                    <a href={p.drive_url} target="_blank" rel="noreferrer" style={{ color: T.text3, fontSize: 11, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>📁 Drive</a>
                  )}
                  {p.status === "scheduled" && (
                    <button onClick={() => onCancel(p.id)} disabled={cancellingId === p.id} style={{ ...btnSecondary, color: T.sErr, flexShrink: 0 }}>
                      {cancellingId === p.id ? "..." : "Hủy lịch"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function CalendarView({ posts, onCancel, cancellingId }: { posts: any[]; onCancel: (id: string) => void; cancellingId: string | null }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const dayKey = (d: Date) => d.toISOString().slice(0, 10)
  const postDate = (p: any) => new Date(p.published_at || p.scheduled_for || p.created_at || Date.now())

  const byDay: Record<string, any[]> = {}
  for (const p of posts) {
    const k = dayKey(postDate(p))
    ;(byDay[k] = byDay[k] || []).push(p)
  }

  const year = cursor.getFullYear(), month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = dayKey(new Date())

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const selectedPosts = selectedDay ? (byDay[selectedDay] || []) : []

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} style={btnSecondary}>‹</button>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Tháng {month + 1}/{year}</span>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} style={btnSecondary}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: T.text3 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const k = dayKey(d)
            const dayPosts = byDay[k] || []
            const isToday = k === todayKey
            const isSelected = k === selectedDay
            return (
              <div
                key={i}
                onClick={() => setSelectedDay(k)}
                style={{
                  minHeight: 64, padding: 6, borderRadius: 8, cursor: "pointer",
                  background: isSelected ? T.accentSubtle : T.subtle,
                  border: isSelected ? `1px solid ${T.accent}` : `1px solid ${T.border}`,
                }}
              >
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 20, height: 20, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                  background: isToday ? T.accent : "transparent", color: isToday ? "#fff" : T.text1,
                }}>{d.getDate()}</div>
                {dayPosts.length > 0 && (
                  <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayPosts.slice(0, 3).map((p, pi) => (
                      <div key={pi} style={{ fontSize: 9, padding: "1px 4px", borderRadius: 4, background: (STATUS_POST[p.status] || STATUS_POST.pending).bg, color: (STATUS_POST[p.status] || STATUS_POST.pending).c, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {MEDIA_ICON[p.media_type] || "📝"} {p.page_name}
                      </div>
                    ))}
                    {dayPosts.length > 3 && <div style={{ fontSize: 9, color: T.text3 }}>+{dayPosts.length - 3} nữa</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {selectedDay && (
        <div style={{ width: 300, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            {new Date(selectedDay).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </div>
          <div style={{ color: T.text3, fontSize: 12, marginBottom: 12 }}>{selectedPosts.length} bài</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedPosts.map(p => {
              const st = STATUS_POST[p.status] || STATUS_POST.pending
              const time = postDate(p).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
              return (
                <div key={p.id} style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: T.text3 }}>{time}</span>
                    <span>{MEDIA_ICON[p.media_type] || "📝"}</span>
                    <span style={{ background: st.bg, color: st.c, borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.page_name}</div>
                  <div style={{ fontSize: 12, color: T.text2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{p.message}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {p.post_id && <a href={`https://www.facebook.com/${p.post_id}`} target="_blank" rel="noreferrer" style={{ color: "#1877F2", fontSize: 11, fontWeight: 600 }}>↗ Xem bài</a>}
                    {p.status === "scheduled" && (
                      <button onClick={() => onCancel(p.id)} disabled={cancellingId === p.id} style={{ background: "none", border: "none", color: T.sErr, fontSize: 11, cursor: "pointer", padding: 0 }}>
                        {cancellingId === p.id ? "..." : "Hủy lịch"}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab: Tổng hợp bài viết ──────────────────────────────────────────────────────
function PostStatsTab() {
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<any>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [products, setProducts] = useState<{ code: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [page, setPage] = useState(0)
  const [filterPage, setFilterPage] = useState("")
  const [filterProduct, setFilterProduct] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [sort, setSort] = useState("published_at")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [toast, setToast] = useState<string | null>(null)
  const PAGE_SIZE = 50

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE), sort })
    if (filterPage) p.set("page_id", filterPage)
    if (filterProduct) p.set("product_code", filterProduct)
    if (filterFrom) p.set("from", filterFrom)
    if (filterTo) p.set("to", filterTo)
    api(`/post-stats?${p}`).then(d => {
      setPosts(d.posts ?? []); setTotal(d.total ?? 0); setSummary(d.summary ?? null)
    }).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filterPage, filterProduct, filterFrom, filterTo, sort, page])
  useEffect(() => {
    api("/pages?all=true").then(d => setPages(d.pages || [])).catch(() => {})
    api("/products").then(d => setProducts((d.products ?? []).filter((p: any) => p.code))).catch(() => {})
  }, [])

  const refresh = async (pageId?: string) => {
    setSyncing(true)
    try {
      const r = await api("/post-stats", { method: "POST", body: JSON.stringify(pageId ? { page_id: pageId } : {}) })
      if (r.ok) { setToast(`Đã sync ${r.synced} bài từ ${r.pages} page`); load() }
      else setToast(`Lỗi: ${r.error || "unknown"}`)
    } catch (e: any) {
      setToast("Lỗi: " + e.message)
    } finally {
      setSyncing(false)
    }
  }

  const clearFilters = () => { setFilterPage(""); setFilterProduct(""); setFilterFrom(""); setFilterTo(""); setPage(0) }

  const inp: React.CSSProperties = { background: T.card, color: "#111827", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none" }
  const kpi = (label: string, value: any, icon: string) => (
    <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{value ?? 0}</div>
      <div style={{ fontSize: 11, color: T.text3 }}>{label}</div>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {toast && <FbToast msg={toast} onDone={() => setToast(null)} />}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {kpi("Tổng bài", total, "📄")}
        {kpi("Tổng Likes", summary?.total_likes, "👍")}
        {kpi("Tổng Comments", summary?.total_comments, "💬")}
        {kpi("Tổng Shares", summary?.total_shares, "🔁")}
        {kpi("Tổng Reach", summary?.total_reach, "👁")}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select value={filterPage} onChange={e => { setFilterPage(e.target.value); setPage(0) }} style={inp}>
          <option value="">Tất cả trang</option>
          {pages.map(p => <option key={p.page_id} value={p.page_id}>{p.page_name}</option>)}
        </select>
        <select value={filterProduct} onChange={e => { setFilterProduct(e.target.value); setPage(0) }} style={inp}>
          <option value="">Tất cả sản phẩm</option>
          {products.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={inp}>
          <option value="published_at">Sắp xếp: Ngày đăng</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
          <option value="shares">Shares</option>
          <option value="reach">Reach</option>
        </select>
        <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(0) }} style={inp} />
        <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(0) }} style={inp} />
        <button onClick={clearFilters} style={btnSecondary}>Xóa lọc</button>
        {summary?.last_synced && <span style={{ color: T.text3, fontSize: 11 }}>Cập nhật: {new Date(summary.last_synced).toLocaleString("vi-VN")}</span>}
        <button onClick={() => refresh()} disabled={syncing} style={{ ...btnPrimary, background: "#1877F2" }}>{syncing ? "Đang sync…" : "↻ Refresh"}</button>
        <div style={{ display: "flex", gap: 2, background: T.subtle, borderRadius: 8, padding: 2, marginLeft: "auto" }}>
          <button onClick={() => setViewMode("table")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: viewMode === "table" ? T.card : "transparent", fontSize: 13, cursor: "pointer" }}>≡</button>
          <button onClick={() => setViewMode("grid")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: viewMode === "grid" ? T.card : "transparent", fontSize: 13, cursor: "pointer" }}>⊞</button>
        </div>
      </div>

      {loading && <div style={{ padding: 20, textAlign: "center", color: T.text3 }}>Đang tải…</div>}

      {!loading && viewMode === "table" && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.subtle }}>
                {["Trang", "Sản phẩm", "Nội dung", "Ngày đăng", "👍", "💬", "🔁", "👁 Reach", "Thao tác"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: T.text3, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.post_id} style={{ borderBottom: i < posts.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pageColor(p.page_id), marginRight: 6 }} />
                    {p.page_name}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 12 }}>
                    {p.product_name ? <>{p.product_name} {p.product_code && <code style={{ background: T.subtle, padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{p.product_code}</code>}</> : "—"}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 12, color: T.text2, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.message || "—"}</td>
                  <td style={{ padding: "8px 12px", fontSize: 12, color: T.text3, whiteSpace: "nowrap" }}>{p.published_at ? new Date(p.published_at).toLocaleString("vi-VN") : "—"}</td>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>{p.likes}</td>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>{p.comments}</td>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>{p.shares}</td>
                  <td style={{ padding: "8px 12px", fontSize: 13 }}>{p.reach}</td>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                    <a href={`https://www.facebook.com/${p.post_id}`} target="_blank" rel="noreferrer" style={{ color: "#1877F2", fontSize: 12, marginRight: 8 }}>↗</a>
                    <button onClick={() => navigator.clipboard?.writeText(p.post_id)} style={{ ...btnSecondary, padding: "2px 6px", fontSize: 11 }}>Copy ID</button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={9} style={{ padding: 30, textAlign: "center", color: T.text3 }}>Chưa có bài nào</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {posts.map(p => (
            <div key={p.post_id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              {p.thumbnail_url && (
                <div style={{ position: "relative", height: 140, background: "#000" }}>
                  <img src={p.thumbnail_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {p.media_type === "video" && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff" }}>▶</div>}
                </div>
              )}
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pageColor(p.page_id) }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{p.page_name}</span>
                </div>
                <div style={{ fontSize: 12, color: T.text2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, marginBottom: 8 }}>{p.message}</div>
                <div style={{ fontSize: 11, color: T.text3, marginBottom: 8 }}>
                  {p.published_at ? new Date(p.published_at).toLocaleDateString("vi-VN") : ""} {p.product_code && `· ${p.product_code}`} {p.created_by && `· ${p.created_by}`}
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: T.text2, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                  <span>👍 {p.likes}</span><span>💬 {p.comments}</span><span>🔁 {p.shares}</span><span>👁 {p.reach}</span>
                  <a href={`https://www.facebook.com/${p.post_id}`} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", color: "#1877F2" }}>↗</a>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && <div style={{ padding: 30, textAlign: "center", color: T.text3, gridColumn: "1/-1" }}>Chưa có bài nào</div>}
        </div>
      )}

      {!loading && total > PAGE_SIZE && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={btnSecondary}>‹ Trước</button>
          <span style={{ fontSize: 12, color: T.text3 }}>Trang {page + 1} / {Math.ceil(total / PAGE_SIZE)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total} style={btnSecondary}>Sau ›</button>
        </div>
      )}
    </div>
  )
}

// ── Tab: Quản lý Page ──────────────────────────────────────────────────────────
function PageManageTab() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [q, setQ] = useState("")

  const load = (forceRefresh = false) => {
    setLoading(true)
    const url = forceRefresh ? "/pages?all=true&force_refresh=true" : "/pages?all=true"
    api(url).then(d => {
      if (d.error === "FB_TOKEN_EXPIRED") setToast("Token FB hết hạn — liên hệ admin cập nhật FB_SYSTEM_TOKEN")
      setPages(d.pages || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const sync = async () => {
    setSyncing(true)
    await load(true)
    setSyncing(false)
    setToast("Đã đồng bộ danh sách trang từ Facebook")
  }

  const setStatus = async (page_id: string, hoat_dong: string) => {
    await api("/pages", { method: "PATCH", body: JSON.stringify({ page_id, hoat_dong }) })
    setPages(prev => prev.map(p => p.page_id === page_id ? { ...p, hoat_dong } : p))
  }

  const filtered = pages.filter(p => !q || p.page_name.toLowerCase().includes(q.toLowerCase()))

  const HOAT_DONG_LABEL: Record<string, { label: string; c: string; bg: string }> = {
    active:  { label: "Đang hoạt động", c: "#059669", bg: "#DCFCE7" },
    paused:  { label: "Tạm dừng",       c: "#D97706", bg: "#FEF3C7" },
    stopped: { label: "Đã dừng",        c: "#DC2626", bg: "#FEE2E2" },
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {toast && <FbToast msg={toast} onDone={() => setToast(null)} />}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, flex: "1 1 200px" }}>
          <span style={{ margin: "0 8px", color: T.text3 }}>⌕</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tên trang…" style={{ flex: 1, background: "none", border: "none", outline: "none", padding: "7px 8px 7px 0", fontSize: 12, color: "#111827" }} />
        </div>
        <button onClick={sync} disabled={syncing} style={{ ...btnPrimary, background: "#1877F2" }}>
          {syncing ? "Đang đồng bộ…" : "🔄 Đồng bộ từ Facebook"}
        </button>
        <span style={{ color: T.text3, fontSize: 12, marginLeft: "auto" }}>{filtered.length} / {pages.length} trang</span>
      </div>

      {loading && <div style={{ padding: 40, textAlign: "center", color: T.text3 }}>Đang tải…</div>}
      {!loading && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ color: T.text3, fontSize: 13, marginBottom: 12 }}>
                {pages.length === 0 ? "Chưa có trang nào trong hệ thống" : "Không tìm thấy trang nào"}
              </div>
              {pages.length === 0 && (
                <button onClick={sync} style={{ ...btnPrimary, background: "#1877F2" }}>🔄 Tải trang từ Facebook</button>
              )}
            </div>
          ) : (
            filtered.map((p, i) => {
              const hd = HOAT_DONG_LABEL[p.hoat_dong || "active"] || HOAT_DONG_LABEL.active
              return (
                <div key={p.page_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: pageColor(p.page_id), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>
                    {(p.page_name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#111827", fontSize: 13, fontWeight: 600 }}>{p.page_name}</div>
                    <div style={{ color: T.text3, fontSize: 11, marginTop: 2 }}>
                      {p.category && <span>{p.category} · </span>}
                      {(p.fan_count || 0).toLocaleString("vi-VN")} người theo dõi
                    </div>
                  </div>
                  <span style={{ background: hd.bg, color: hd.c, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{hd.label}</span>
                  <select
                    value={p.hoat_dong || "active"}
                    onChange={e => setStatus(p.page_id, e.target.value)}
                    style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, background: T.subtle, cursor: "pointer" }}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="paused">Tạm dừng</option>
                    <option value="stopped">Đã dừng</option>
                  </select>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function ProductsSyncBar() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  async function sync() {
    setSyncing(true)
    setResult(null)
    try {
      const data = await api("/products", { method: "POST", body: JSON.stringify({ action: "sync" }) })
      setResult(`Đồng bộ ${data.synced}/${data.total} sản phẩm`)
    } catch (e: any) {
      setResult("Lỗi: " + e.message)
    } finally {
      setSyncing(false)
    }
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <button onClick={sync} disabled={syncing} style={btnPrimary}>{syncing ? "Đang đồng bộ..." : "Đồng bộ sản phẩm từ Pancake"}</button>
      {result && <span style={{ fontSize: 13, color: T.text2 }}>{result}</span>}
    </div>
  )
}

type Product = { id: number; name: string; code: string; pancake_id?: string | null; active?: boolean }

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState({ name: "", code: "" })
  const [newForm, setNewForm] = useState({ name: "", code: "" })
  const [msg, setMsg] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api("/products").then(d => setProducts(d.products ?? [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function sync() {
    setSyncing(true)
    setMsg(null)
    try {
      const r = await api("/products", { method: "POST", body: JSON.stringify({ action: "sync" }) })
      setMsg(r.ok ? `Đã sync ${r.synced ?? r.total ?? "?"} sản phẩm từ Pancake` : `Lỗi: ${r.error || "unknown"}`)
      load()
    } catch {
      setMsg("Sync thất bại")
    } finally {
      setSyncing(false)
    }
  }

  async function saveEdit(id: number) {
    await api(`/products/${id}`, { method: "PATCH", body: JSON.stringify(editDraft) })
    setEditId(null)
    load()
  }

  async function del(id: number) {
    if (!confirm("Xóa sản phẩm này?")) return
    await api(`/products/${id}`, { method: "DELETE" })
    load()
  }

  async function addNew() {
    if (!newForm.name.trim()) return
    await api("/products", { method: "POST", body: JSON.stringify(newForm) })
    setNewForm({ name: "", code: "" })
    load()
  }

  const inp: React.CSSProperties = { border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 13, width: "100%" }
  const th: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, color: T.text2, borderBottom: `2px solid ${T.border}`, background: T.subtle, whiteSpace: "nowrap" }
  const td: React.CSSProperties = { padding: "9px 12px", fontSize: 13, borderBottom: `1px solid ${T.border}`, verticalAlign: "middle" }

  return (
    <div style={{ padding: 4, maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Danh mục Sản phẩm</h2>
        <button onClick={sync} disabled={syncing} style={btnPrimary}>{syncing ? "Đang sync..." : "↻ Sync từ Pancake"}</button>
        {msg && <span style={{ fontSize: 12, color: "#16A34A" }}>{msg}</span>}
        <span style={{ fontSize: 12, color: T.text2, marginLeft: "auto" }}>{products.length} sản phẩm</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end" }}>
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: 11, color: T.text2, marginBottom: 3 }}>Tên SP</div>
          <input style={inp} placeholder="Tên sản phẩm..." value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.text2, marginBottom: 3 }}>Mã SP</div>
          <input style={inp} placeholder="VD: PHVVN036NC" value={newForm.code} onChange={e => setNewForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
        </div>
        <button onClick={addNew} style={btnPrimary}>+ Thêm</button>
      </div>

      {loading ? <div style={{ color: T.text3, padding: 20 }}>Đang tải...</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: T.card, borderRadius: 8, overflow: "hidden", boxShadow: T.shadowSm }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Tên sản phẩm</th>
              <th style={th}>Mã SP</th>
              <th style={th}>Pancake ID</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id}>
                <td style={{ ...td, color: T.text3, width: 40 }}>{i + 1}</td>
                <td style={td}>
                  {editId === p.id
                    ? <input style={inp} value={editDraft.name} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))} />
                    : p.name}
                </td>
                <td style={td}>
                  {editId === p.id
                    ? <input style={{ ...inp, width: 140, fontFamily: "monospace" }} value={editDraft.code} onChange={e => setEditDraft(d => ({ ...d, code: e.target.value.toUpperCase() }))} />
                    : <code style={{ background: T.subtle, padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{p.code || "—"}</code>}
                </td>
                <td style={{ ...td, color: T.text3, fontSize: 12 }}>{p.pancake_id || "—"}</td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  {editId === p.id ? (
                    <>
                      <button onClick={() => saveEdit(p.id)} style={{ ...btnPrimary, padding: "3px 10px", fontSize: 12, marginRight: 4 }}>Lưu</button>
                      <button onClick={() => setEditId(null)} style={{ ...btnSecondary, padding: "3px 10px" }}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(p.id); setEditDraft({ name: p.name, code: p.code }) }} style={{ ...btnSecondary, padding: "3px 10px", marginRight: 4 }}>Sửa</button>
                      <button onClick={() => del(p.id)} style={{ padding: "3px 10px", borderRadius: 5, border: "none", background: T.sErrBg, color: T.sErr, fontSize: 12, cursor: "pointer" }}>Xóa</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: T.text3, padding: 32 }}>Chưa có SP nào — bấm "Sync từ Pancake" để tải về</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

const TABS = [
  { id: "bang", label: "Bảng" },
  { id: "fb", label: "Đăng Facebook" },
  { id: "lich", label: "Lịch đăng" },
  { id: "stats", label: "Tổng hợp bài viết" },
  { id: "pages", label: "Quản lý Page" },
  { id: "products", label: "📦 Danh mục SP" },
]

const VideoContentPage = () => {
  const [tab, setTab] = useState("bang")
  return (
    <div style={{ background: T.bg, padding: 20, borderRadius: 12 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              color: tab === t.id ? T.accent : T.text2,
              borderBottom: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "bang" && (<><ProductsSyncBar /><VideoTableTab /></>)}
      {tab === "fb" && <FbPostTab />}
      {tab === "lich" && <LichDangTab />}
      {tab === "stats" && <PostStatsTab />}
      {tab === "pages" && <PageManageTab />}
      {tab === "products" && <ProductsTab />}
    </div>
  )
}

const selectStyle: React.CSSProperties = { border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 13 }
const miniInput: React.CSSProperties = { border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 6px", fontSize: 12, width: "100%" }
const btnPrimary: React.CSSProperties = { background: T.accent, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }
const btnSecondary: React.CSSProperties = { background: T.subtle, color: T.text2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" }

export const config = defineRouteConfig({
  label: "Video Content",
})

export default VideoContentPage
