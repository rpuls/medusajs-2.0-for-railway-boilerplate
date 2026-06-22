import { useEffect, useRef, useState } from "react"

export type ColumnDef = { id: string; width: number; min: number }

/** Persist + drag-to-resize cho 1 bảng. storageKey duy nhất theo từng bảng. */
export function useResizableColumns(storageKey: string, columns: ColumnDef[]) {
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return Object.fromEntries(columns.map(c => [c.id, c.width]))
  })

  const dragRef = useRef<{ id: string; startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(colWidths)) } catch {}
  }, [storageKey, colWidths])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const d = dragRef.current
      if (!d) return
      const col = columns.find(c => c.id === d.id)
      const min = col?.min ?? 40
      const next = Math.max(min, d.startWidth + (e.clientX - d.startX))
      setColWidths(prev => ({ ...prev, [d.id]: next }))
    }
    function onUp() { dragRef.current = null }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [columns])

  function onResizeMouseDown(colId: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      dragRef.current = { id: colId, startX: e.clientX, startWidth: colWidths[colId] ?? 100 }
    }
  }

  function resetColWidths() {
    setColWidths(Object.fromEntries(columns.map(c => [c.id, c.width])))
  }

  const totalWidth = columns.reduce((sum, c) => sum + (colWidths[c.id] ?? c.width), 0)

  return { colWidths, onResizeMouseDown, resetColWidths, totalWidth }
}

export function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 6,
        cursor: "col-resize", userSelect: "none", zIndex: 1,
      }}
    />
  )
}
