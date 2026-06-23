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
}

type Page = { page_id: string; page_name: string; category?: string; fan_count?: number; hoat_dong?: string }

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
  const [loading, setLoading] = useState(false)
  const [filterMaker, setFilterMaker] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [aiModalRow, setAiModalRow] = useState<VideoRow | null>(null)
  const [quickAdd, setQuickAdd] = useState({ nguoiLam: "", sp: "", loaiVideo: "Video AI", link: "", nguon: "Team" })

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
    setQuickAdd({ nguoiLam: "", sp: "", loaiVideo: "Video AI", link: "", nguon: "Team" })
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
                <input placeholder="Sản phẩm" value={quickAdd.sp} onChange={e => setQuickAdd(q => ({ ...q, sp: e.target.value }))} style={miniInput} />
              </Td>
              <Td width={colWidths.loai}>
                <select value={quickAdd.loaiVideo} onChange={e => setQuickAdd(q => ({ ...q, loaiVideo: e.target.value }))} style={miniInput}>
                  {Object.keys(VT_COLORS).map(v => <option key={v}>{v}</option>)}
                </select>
              </Td>
              <Td width={colWidths.link}>
                <input placeholder="Link" value={quickAdd.link} onChange={e => setQuickAdd(q => ({ ...q, link: e.target.value }))} style={miniInput} />
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
                <Td width={colWidths.nguon}>{r.nguon}</Td>
                <Td width={colWidths.nguoilam}>{r.nguoiLam}</Td>
                <Td width={colWidths.deadline}>
                  <input type="date" defaultValue={r.deadline || ""} onBlur={e => updateRow(r.id, { deadline: e.target.value })} style={miniInput} />
                </Td>
                <Td width={colWidths.sp}>{r.sp}</Td>
                <Td width={colWidths.loai}>
                  <span style={{ color: VT_COLORS[r.loaiVideo] || T.text2, fontWeight: 600 }}>{r.loaiVideo}</span>
                </Td>
                <Td width={colWidths.link}>
                  {r.link ? <a href={r.link} target="_blank" rel="noreferrer" style={{ color: T.accent }}>Xem</a> : "—"}
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

function FbPostTab() {
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [posting, setPosting] = useState(false)
  const [posts, setPosts] = useState<any[]>([])

  async function loadPages() {
    const data = await api("/pages").catch(() => ({ pages: [] }))
    setPages(data.pages || [])
  }
  async function loadPosts() {
    const data = await api("/post?posts=1").catch(() => ({ posts: [] }))
    setPosts(data.posts || [])
  }
  useEffect(() => { loadPages(); loadPosts() }, [])

  async function submitPost() {
    if (!selectedPages.length || !message.trim()) return
    setPosting(true)
    try {
      await api("/post", { method: "POST", body: JSON.stringify({ page_ids: selectedPages, message, media_type: "text" }) })
      setMessage("")
      setTimeout(loadPosts, 2000)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {pages.map(p => (
          <label key={p.page_id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={selectedPages.includes(p.page_id)}
              onChange={e => setSelectedPages(prev => e.target.checked ? [...prev, p.page_id] : prev.filter(id => id !== p.page_id))}
            />
            {p.page_name}
          </label>
        ))}
      </div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Nội dung bài đăng..." rows={4} style={{ width: "100%", borderRadius: 8, border: `1px solid ${T.border}`, padding: 10, fontSize: 13 }} />
      <button onClick={submitPost} disabled={posting} style={{ ...btnPrimary, marginTop: 8 }}>{posting ? "Đang đăng..." : "Đăng ngay"}</button>

      <h4 style={{ marginTop: 24 }}>Bài đã đăng / lên lịch</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr><Th width={150}>Page</Th><Th width={300}>Nội dung</Th><Th width={100}>Trạng thái</Th></tr></thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id}>
              <Td width={150}>{p.page_name}</Td>
              <Td width={300}>{p.message}</Td>
              <Td width={100}>{p.status}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PageManageTab() {
  const [pages, setPages] = useState<Page[]>([])
  useEffect(() => { api("/pages?all=true").then(d => setPages(d.pages || [])).catch(() => {}) }, [])

  async function setStatus(page_id: string, hoat_dong: string) {
    await api("/pages", { method: "PATCH", body: JSON.stringify({ page_id, hoat_dong }) })
    setPages(prev => prev.map(p => p.page_id === page_id ? { ...p, hoat_dong } : p))
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead><tr><Th width={220}>Page</Th><Th width={100}>Followers</Th><Th width={150}>Trạng thái</Th></tr></thead>
      <tbody>
        {pages.map(p => (
          <tr key={p.page_id}>
            <Td width={220}>{p.page_name}</Td>
            <Td width={100}>{p.fan_count}</Td>
            <Td width={150}>
              <select value={p.hoat_dong || "active"} onChange={e => setStatus(p.page_id, e.target.value)} style={miniInput}>
                <option value="active">Hoạt động</option>
                <option value="paused">Tạm dừng</option>
                <option value="stopped">Đã dừng</option>
              </select>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
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
