"use client"

import { useReducedMotion, useInView } from "framer-motion"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

function isScramblable(char: string): boolean {
  return /[A-Za-z0-9]/.test(char)
}

function buildScrambled(target: string): string {
  return target
    .split("")
    .map((ch) => {
      if (ch === " ") return " "
      if (!isScramblable(ch)) return ch
      return CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? ch
    })
    .join("")
}

type ScrambleDecodeTextProps = {
  text: string
  className?: string
}

export default function ScrambleDecodeText({
  text,
  className,
}: ScrambleDecodeTextProps) {
  const [mounted, setMounted] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || reducedMotion) {
    return <span className={className}>{text}</span>
  }

  return <ScrambleDecodeInner text={text} className={className} />
}

function ScrambleDecodeInner({
  text,
  className,
}: ScrambleDecodeTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.45 })
  const [display, setDisplay] = useState(() => buildScrambled(text))
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const letterCount = useMemo(
    () => text.split("").filter(isScramblable).length,
    [text]
  )

  const run = useCallback(() => {
    stop()
    setDisplay(buildScrambled(text))
    let frame = 0
    const denom = Math.max(1, letterCount)
    const totalFrames = Math.min(
      52,
      Math.max(26, Math.round(letterCount * 1.05))
    )
    const chars = text.split("")

    tickRef.current = setInterval(() => {
      frame += 1
      let li = 0
      setDisplay(
        chars
          .map((ch) => {
            if (ch === " ") return " "
            if (!isScramblable(ch)) return ch
            const revealFrame = Math.ceil(((li + 1) / denom) * totalFrames)
            li += 1
            if (frame >= revealFrame) {
              return ch
            }
            return (
              CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? ch
            )
          })
          .join("")
      )
      if (frame >= totalFrames) {
        stop()
        setDisplay(text)
      }
    }, 42)
  }, [letterCount, stop, text])

  useEffect(() => {
    if (!inView) {
      return
    }
    run()
    return () => stop()
  }, [inView, run, stop])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
