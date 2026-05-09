import { useEffect } from "react"

/**
 * Injects a `@media print` stylesheet that strips Medusa admin chrome
 * (sidebar, header, buttons) and expands report cards to full width
 * when the operator hits Cmd+P on the Reports or Production page.
 *
 * Mounted via the page component itself — no widget zone needed since
 * the styles are scoped to print media.
 */
const PRINT_CSS = `
@media print {
  /* Hide left sidebar + top bar */
  nav, aside, header, [data-medusa-sidebar],
  [class*="sidebar"], [class*="topbar"], [class*="header-bar"] {
    display: none !important;
  }
  body, [data-medusa-app] {
    background: white !important;
  }
  /* Expand main content to full width */
  main, [class*="main"], [data-medusa-content] {
    margin: 0 !important;
    padding: 12mm !important;
    max-width: none !important;
  }
  /* Hide interactive controls */
  button, [role="tab"], select, input[type="search"],
  [class*="filter-bar"] {
    display: none !important;
  }
  /* Show all tab panels — operator might want everything */
  [role="tabpanel"] { display: block !important; }
  /* Avoid breaking inside report cards */
  [class*="report-card"], section {
    page-break-inside: avoid;
  }
  /* Headings stay with their content */
  h1, h2, h3 { page-break-after: avoid; }
  /* Tighter type for print */
  body { font-size: 10pt !important; }
}
@page { margin: 12mm; }
`

export const PrintStyles = () => {
  useEffect(() => {
    if (typeof document === "undefined") return
    const id = "sc-print-styles"
    if (document.getElementById(id)) return
    const tag = document.createElement("style")
    tag.id = id
    tag.textContent = PRINT_CSS
    document.head.appendChild(tag)
    return () => {
      tag.remove()
    }
  }, [])
  return null
}
