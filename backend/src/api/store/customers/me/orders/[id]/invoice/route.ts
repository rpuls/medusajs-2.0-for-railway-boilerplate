import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"

import {
  CONTACT_NOTIFICATION_EMAIL,
  SUPPORT_REPLY_TO_EMAIL,
} from "../../../../../../../lib/constants"

const INVOICE_BRAND = {
  siteName: "SC PRINTS",
  contactEmail:
    SUPPORT_REPLY_TO_EMAIL ?? CONTACT_NOTIFICATION_EMAIL ?? "info@scprints.com.au",
}

/**
 * GET /store/customers/me/orders/:id/invoice
 *   → { html, meta }
 *
 * Returns a self-contained HTML invoice (printable from the browser
 * via window.print()) plus a small `meta` block the storefront can
 * use to set the file name on a downloaded PDF.
 *
 * Why not server-side PDF? Sharp + headless Chrome adds a lot of weight
 * for what's essentially print-stylesheet HTML. The storefront opens
 * the HTML in a new window, hits print, and the browser produces a
 * crisp PDF — handles fonts, page breaks, paper sizes, etc. for free.
 */
const formatMoney = (
  amount: number | string | null | undefined,
  currency: string
): string => {
  const n =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number.parseFloat(amount)
        : 0
  if (!Number.isFinite(n)) return ""
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: (currency || "AUD").toUpperCase(),
  }).format(n)
}

const escape = (s: string): string =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  const orderId = req.params.id
  if (!orderId) {
    return res.status(400).json({ error: "id required" })
  }

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "shipping_address", "billing_address"],
    })
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.")
  }
  if (order?.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.")
  }

  const currency = String(order.currency_code ?? "AUD").toUpperCase()
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const taxExempt = meta.tax_exempt === true
  const taxExemptReason =
    typeof meta.tax_exempt_reason === "string" ? meta.tax_exempt_reason : null
  const taxExemptAbn =
    typeof meta.tax_exempt_abn === "string" ? meta.tax_exempt_abn : null

  const placed = order.created_at ? new Date(order.created_at) : new Date()
  const dateStr = placed.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const shipping = (order.shipping_address ?? {}) as Record<string, any>
  const billing = (order.billing_address ?? shipping) as Record<string, any>

  const items = (order.items as Array<Record<string, any>>) ?? []
  const itemRows = items
    .map((it) => {
      const title = escape(String(it.title ?? it.product_title ?? "Item"))
      const sku = it.variant_sku ? `<div class="sku">SKU ${escape(String(it.variant_sku))}</div>` : ""
      const qty = Number(it.quantity ?? 0)
      const unit = formatMoney(it.unit_price, currency)
      const total = formatMoney(it.total ?? Number(it.unit_price ?? 0) * qty, currency)
      return `<tr><td>${title}${sku}</td><td class="num">${qty}</td><td class="num">${unit}</td><td class="num">${total}</td></tr>`
    })
    .join("")

  const subtotal = formatMoney(order.subtotal, currency)
  const shippingTotal = formatMoney(order.shipping_total, currency)
  const taxTotal = taxExempt ? formatMoney(0, currency) : formatMoney(order.tax_total, currency)
  const grandTotal = taxExempt
    ? formatMoney(
        (Number(order.total ?? 0) - Number(order.tax_total ?? 0)),
        currency
      )
    : formatMoney(order.total, currency)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Tax invoice ${escape(String(order.display_id ?? ""))}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; font-size: 12px; line-height: 1.45; margin: 0; }
  .wrap { max-width: 800px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .muted { color: #555; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
  .label { text-transform: uppercase; letter-spacing: 0.6px; font-size: 10px; color: #666; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; text-align: left; color: #666; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  .sku { font-size: 10px; color: #999; }
  .totals { margin-top: 16px; margin-left: auto; width: 280px; }
  .totals td { border-bottom: none; padding: 4px 0; }
  .totals td.amount { text-align: right; font-variant-numeric: tabular-nums; }
  .totals tr.grand td { border-top: 2px solid #111; padding-top: 8px; font-weight: 700; font-size: 14px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600; }
  .footer { margin-top: 32px; font-size: 10px; color: #777; }
  .print-cta { display: block; margin: 16px auto 0; padding: 10px 18px; background: #111; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
  @media print { .print-cta { display: none; } }
</style>
</head>
<body>
<div class="wrap">
  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
    <div>
      <h1>Tax Invoice</h1>
      <div class="muted">Order ${escape(String(order.display_id ?? orderId))} · ${escape(dateStr)}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:14px;font-weight:700;">${escape(INVOICE_BRAND.siteName)}</div>
      ${INVOICE_BRAND.contactEmail ? `<div class="muted">${escape(INVOICE_BRAND.contactEmail)}</div>` : ""}
      ${taxExempt ? `<div style="margin-top:6px;"><span class="badge">No-GST invoice (tax-exempt)</span></div>` : ""}
    </div>
  </div>

  <div class="grid-2">
    <div>
      <div class="label">Bill to</div>
      <div>${escape(String(billing.first_name ?? order.email ?? ""))} ${escape(String(billing.last_name ?? ""))}</div>
      ${billing.company ? `<div>${escape(String(billing.company))}</div>` : ""}
      ${billing.address_1 ? `<div>${escape(String(billing.address_1))}</div>` : ""}
      ${billing.address_2 ? `<div>${escape(String(billing.address_2))}</div>` : ""}
      <div>${escape(String(billing.city ?? ""))} ${escape(String(billing.province ?? ""))} ${escape(String(billing.postal_code ?? ""))}</div>
      <div class="muted">${escape(String(order.email ?? ""))}</div>
      ${taxExemptAbn ? `<div class="muted" style="margin-top:6px;">ABN ${escape(taxExemptAbn)}</div>` : ""}
    </div>
    <div>
      <div class="label">Ship to</div>
      <div>${escape(String(shipping.first_name ?? ""))} ${escape(String(shipping.last_name ?? ""))}</div>
      ${shipping.address_1 ? `<div>${escape(String(shipping.address_1))}</div>` : ""}
      ${shipping.address_2 ? `<div>${escape(String(shipping.address_2))}</div>` : ""}
      <div>${escape(String(shipping.city ?? ""))} ${escape(String(shipping.province ?? ""))} ${escape(String(shipping.postal_code ?? ""))}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="num">Qty</th>
        <th class="num">Unit</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows || `<tr><td colspan="4" class="muted">No line items.</td></tr>`}</tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td class="amount">${subtotal}</td></tr>
    ${Number(order.shipping_total ?? 0) > 0 ? `<tr><td>Shipping</td><td class="amount">${shippingTotal}</td></tr>` : ""}
    <tr>
      <td>${taxExempt ? "GST (exempt)" : "GST"}</td>
      <td class="amount">${taxTotal}</td>
    </tr>
    <tr class="grand"><td>Total ${currency}</td><td class="amount">${grandTotal}</td></tr>
  </table>

  ${taxExempt
    ? `<p class="muted" style="margin-top:24px;">This is a no-GST tax invoice issued to a tax-exempt customer${taxExemptReason ? `: ${escape(taxExemptReason)}` : ""}.</p>`
    : ""}

  <div class="footer">Generated ${escape(new Date().toLocaleString("en-AU"))} · SC PRINTS · ${escape(String(orderId))}</div>

  <button type="button" class="print-cta" onclick="window.print()">Print / save as PDF</button>
</div>
<script>setTimeout(function(){ try { window.focus(); window.print(); } catch(e) {} }, 350);</script>
</body>
</html>`

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.send(html)
}
