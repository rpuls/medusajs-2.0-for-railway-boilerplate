import { ReactNode } from "react"

export default function BlehLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh" }}>
      {children}
    </div>
  )
}
