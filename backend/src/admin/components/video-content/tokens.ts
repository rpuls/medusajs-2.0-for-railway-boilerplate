// Design tokens cho Video Content — dùng inline style (Medusa Admin cô lập CSS).

export const T = {
  bg:          "#F4F5F9",
  card:        "#FFFFFF",
  subtle:      "#F0F1F5",
  hover:       "rgba(0,0,0,0.035)",
  border:      "#E5E7EB",
  borderStrong:"#D1D5DB",
  text1:       "#111827",
  text2:       "#4B5563",
  text3:       "#9CA3AF",
  accent:      "#1877F2",
  accentHover: "#1461D1",
  accentSubtle:"#EBF3FF",
  accentText:  "#1654B8",
  shadowSm:    "0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:    "0 4px 16px rgba(0,0,0,0.10),0 2px 4px rgba(0,0,0,0.05)",
  sNeed:       "#6B7280", sNeedBg:  "#F3F4F6",
  sDoing:      "#2563EB", sDoingBg: "#DBEAFE",
  sWait:       "#D97706", sWaitBg:  "#FEF3C7",
  sDone:       "#16A34A", sDoneBg:  "#DCFCE7",
  sPost:       "#059669", sPostBg:  "#D1FAE5",
  sErr:        "#DC2626", sErrBg:   "#FEE2E2",
}

export const STATUS_COLORS: Record<string, { c: string; bg: string }> = {
  "Cần làm":   { c: T.sNeed,  bg: T.sNeedBg  },
  "Đang làm":  { c: T.sDoing, bg: T.sDoingBg },
  "Chờ duyệt": { c: T.sWait,  bg: T.sWaitBg  },
  "Xong":      { c: T.sDone,  bg: T.sDoneBg  },
  "Đã đăng":   { c: T.sPost,  bg: T.sPostBg  },
  "Lỗi":       { c: T.sErr,   bg: T.sErrBg   },
}

export const ALL_STATUSES = ["Cần làm", "Đang làm", "Chờ duyệt", "Xong", "Đã đăng", "Lỗi"]
export const VT_COLORS: Record<string, string> = { "Video AI": "#1877F2", "Real": "#10B981", "Review": "#F59E0B", "RAW": "#8B5CF6" }

export function pageColorFn(pageId: string): string {
  const colors = ["#1877F2", "#E91E63", "#9C27B0", "#FF5722", "#4CAF50", "#FF9800", "#00BCD4"]
  let h = 0
  for (let i = 0; i < pageId.length; i++) h = (h * 31 + pageId.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}
