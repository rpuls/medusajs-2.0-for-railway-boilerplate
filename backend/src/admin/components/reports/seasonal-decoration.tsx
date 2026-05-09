import { useEffect, useMemo, useRef } from "react"

/**
 * Tiny seasonal touch — date-aware decoration. Renders nothing outside
 * its narrow date windows and is pure CSS / canvas particles, so the
 * cost when inactive is zero.
 *
 * Windows (Australia/Sydney):
 *   - Dec 23-26  ❄ snow
 *   - Dec 31 + Jan 1  🎆 small fireworks burst on mount
 *   - Feb 14  ♥ floating heart in the corner
 *
 * Disabled per-user via localStorage `sc:seasonal_decoration_off`.
 */
const STORAGE_OFF = "sc:seasonal_decoration_off"

type Season = "snow" | "fireworks" | "valentines" | null

const detectSeason = (now: Date): Season => {
  // Sydney offset
  const sydMs = now.getTime() + 10 * 3_600_000
  const d = new Date(sydMs)
  const m = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  if (m === 12 && day >= 23 && day <= 26) return "snow"
  if ((m === 12 && day === 31) || (m === 1 && day === 1)) return "fireworks"
  if (m === 2 && day === 14) return "valentines"
  return null
}

export const SeasonalDecoration = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const season = useMemo(() => detectSeason(new Date()), [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!season) return
    try {
      if (localStorage.getItem(STORAGE_OFF) === "true") return
    } catch {
      /* ignore */
    }
    if (season === "snow") {
      // Inject a stylesheet + a few snowflake spans inside our container.
      const container = containerRef.current
      if (!container) return
      const style = document.createElement("style")
      style.textContent = `
        @keyframes sc-snowfall {
          0% { transform: translateY(-12vh) translateX(0); opacity: 0; }
          10% { opacity: 0.7; }
          100% { transform: translateY(110vh) translateX(40px); opacity: 0; }
        }
      `
      container.appendChild(style)
      const flakes = 30
      for (let i = 0; i < flakes; i++) {
        const flake = document.createElement("span")
        flake.textContent = "❄"
        flake.style.position = "fixed"
        flake.style.top = "0"
        flake.style.left = `${Math.random() * 100}vw`
        flake.style.fontSize = `${10 + Math.random() * 14}px`
        flake.style.opacity = "0"
        flake.style.color = "#cbd5e1"
        flake.style.pointerEvents = "none"
        flake.style.zIndex = "9999"
        flake.style.animation = `sc-snowfall ${10 + Math.random() * 10}s linear ${Math.random() * 8}s infinite`
        container.appendChild(flake)
      }
      return () => {
        container.innerHTML = ""
      }
    }
    if (season === "fireworks") {
      // One-shot burst on mount: small canvas in top-right
      const container = containerRef.current
      if (!container) return
      const canvas = document.createElement("canvas")
      canvas.width = 240
      canvas.height = 160
      canvas.style.position = "fixed"
      canvas.style.top = "60px"
      canvas.style.right = "20px"
      canvas.style.pointerEvents = "none"
      canvas.style.zIndex = "9999"
      container.appendChild(canvas)
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = []
      const colors = ["#fde68a", "#fca5a5", "#a7f3d0", "#bfdbfe", "#fbcfe8"]
      const burst = (x: number, y: number) => {
        for (let i = 0; i < 24; i++) {
          const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.2
          const speed = 1.5 + Math.random() * 1.5
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 60,
            color: colors[Math.floor(Math.random() * colors.length)],
          })
        }
      }
      const start = Date.now()
      let frame = 0
      const tick = () => {
        frame += 1
        if (frame === 1) burst(80, 80)
        if (frame === 30) burst(160, 60)
        if (frame === 60) burst(120, 100)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.04
          p.life -= 1
          if (p.life > 0) {
            ctx.fillStyle = p.color
            ctx.globalAlpha = Math.max(0, p.life / 60)
            ctx.beginPath()
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.globalAlpha = 1
        if (Date.now() - start < 6000) {
          requestAnimationFrame(tick)
        } else {
          canvas.remove()
        }
      }
      requestAnimationFrame(tick)
      return () => {
        canvas.remove()
      }
    }
    if (season === "valentines") {
      const container = containerRef.current
      if (!container) return
      const heart = document.createElement("span")
      heart.textContent = "♥"
      heart.style.position = "fixed"
      heart.style.bottom = "16px"
      heart.style.right = "16px"
      heart.style.fontSize = "24px"
      heart.style.color = "#e11d48"
      heart.style.opacity = "0.7"
      heart.style.zIndex = "9999"
      heart.style.pointerEvents = "none"
      heart.title = "Happy Valentine's Day"
      container.appendChild(heart)
      return () => {
        heart.remove()
      }
    }
  }, [season])

  return <div ref={containerRef} aria-hidden="true" />
}
