"use client"

import { useState } from "react"

const CONTACTS = [
  {
    key: "phone",
    href: "tel:0986688821",
    label: "0986 688 821",
    title: "Gọi điện",
    bg: "#22c55e",
    shadow: "rgba(34,197,94,0.45)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.61 21 3 14.39 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
      </svg>
    ),
  },
  {
    key: "messenger",
    href: "https://m.me/AoNitNgucKinStore",
    label: "Messenger",
    title: "Nhắn tin Messenger",
    bg: "linear-gradient(135deg,#0668E1 0%,#9B59B6 100%)",
    shadow: "rgba(90,80,200,0.40)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.829 1.35 5.355 3.464 7.04V22l3.154-1.737A10.46 10.46 0 0 0 12 20.518c5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.007 12.47-2.548-2.718-4.971 2.718 5.467-5.8 2.613 2.718 4.906-2.718-5.467 5.8z" />
      </svg>
    ),
  },
]

export default function FloatingContact() {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      {CONTACTS.map((c, i) => (
        <div
          key={c.key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.8)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: `all 0.22s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms`,
          }}
        >
          <span
            style={{
              background: "rgba(17,24,39,0.88)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              padding: "5px 10px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            {c.label}
          </span>

          <a
            href={c.href}
            target={c.key !== "phone" ? "_blank" : undefined}
            rel="noopener noreferrer"
            title={c.title}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: c.bg,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${c.shadow}`,
              flexShrink: 0,
              textDecoration: "none",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {c.icon}
          </a>
        </div>
      ))}

      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Đóng liên hệ" : "Tư vấn kín đáo"}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: open ? "#374151" : "#1a3a2a",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: open
            ? "0 2px 12px rgba(55,65,81,0.35)"
            : "0 2px 16px rgba(26,58,42,0.45)",
          transition: "all 0.25s",
        }}
      >
        <span
          style={{
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 10H6v-2h12v2zm0-4H6V6h12v2z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  )
}
