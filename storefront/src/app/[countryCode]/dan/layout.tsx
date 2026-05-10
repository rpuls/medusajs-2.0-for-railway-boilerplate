import { IM_Fell_English } from "next/font/google"
import { ReactNode } from "react"

const imFell = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
})

export default function DanLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={imFell.className}
      style={{ backgroundColor: "#f9c8d4", minHeight: "100vh", color: "#1a1a1a" }}
    >
      <style>{`
        .dan-header { view-transition-name: dan-header; }
        .dan-content { view-transition-name: dan-content; }

        @keyframes dan-header-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dan-header-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes dan-content-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dan-content-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-12px); }
        }

        ::view-transition-old(dan-header) {
          animation: 220ms ease both dan-header-out;
        }
        ::view-transition-new(dan-header) {
          animation: 280ms ease both dan-header-in;
        }
        ::view-transition-old(dan-content) {
          animation: 240ms ease both dan-content-out;
        }
        ::view-transition-new(dan-content) {
          animation: 360ms 60ms ease both dan-content-in;
        }
      `}</style>
      {children}
    </div>
  )
}
