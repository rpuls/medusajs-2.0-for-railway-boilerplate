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
      {children}
    </div>
  )
}
