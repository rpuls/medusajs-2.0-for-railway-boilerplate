"use client"

/**
 * Space Invaders component. Owns the RAF loop, mounts the canvas, wires
 * input → tick → renderer + particles. State held in a ref (mutated by
 * tick); React state is used only for HUD-adjacent values (current score,
 * game-over flag) so the surrounding chrome can re-render when they change.
 *
 * Layout mirrors Tetris: portrait playfield with a side panel showing
 * Score / Wave / Lives + a Restart / Play-again button.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { GameComponentProps } from "../types"

import {
  ALIEN_COLS,
  ALIEN_HSPACE,
  ALIEN_ROWS,
  ALIEN_VSPACE,
  LOGICAL_H,
  LOGICAL_W,
  PLAYER_RGB,
  SHAKE_DECAY,
} from "./constants"
import type { GameEvent } from "./events"
import { createInvadersInput } from "./input"
import { InvadersParticleSystem } from "./particles"
import { createRenderState, renderFrame } from "./renderer"
import { createInitialState } from "./state"
import { tick } from "./tick"
import type { GameState } from "./types"

export type InvadersInternalProps = GameComponentProps

export default function InvadersInternal({
  size = "xl",
  onScoreChange,
  onGameOverChange,
}: InvadersInternalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  /** Authoritative game state — mutated by the tick. */
  const stateRef = useRef<GameState>(createInitialState())
  /** Render-only smoothing state (player tilt etc.). */
  const renderStateRef = useRef(createRenderState())
  const inputRef = useRef(createInvadersInput())
  const particlesRef = useRef(new InvadersParticleSystem())
  /** Frame counter for time-based animations (walk cycle, shimmer). */
  const frameCountRef = useRef(0)

  /** Surface state — only used by the HUD outside the canvas. Updated
   * from the RAF loop via a separate sync ref so the loop's useEffect
   * doesn't depend on these values (otherwise the loop would tear down
   * and restart on every score change). */
  const [score, setScore] = useState<number>(0)
  const [wave, setWave] = useState<number>(1)
  const [lives, setLives] = useState<number>(3)
  const [gameOverUI, setGameOverUI] = useState<boolean>(false)
  const [pausedUI, setPausedUI] = useState<boolean>(false)
  /** Last synced values per-field so the loop only fires setState when the
   * surface state actually drifts from React's view. */
  const lastSyncedRef = useRef({
    score: 0,
    wave: 1,
    lives: 3,
    gameOverUI: false,
    pausedUI: false,
  })

  /** Highscore persists across restarts on the same page lifetime. Browser
   * storage isn't worth the cookie/storage churn for a 404-page minigame. */
  const highScoreRef = useRef(0)

  /** Notify parents (the rotation island) of score / game-over changes. */
  const onScoreChangeRef = useRef(onScoreChange)
  onScoreChangeRef.current = onScoreChange
  const onGameOverChangeRef = useRef(onGameOverChange)
  onGameOverChangeRef.current = onGameOverChange
  useEffect(() => {
    onScoreChangeRef.current?.(score)
  }, [score])
  useEffect(() => {
    onGameOverChangeRef.current?.(gameOverUI)
  }, [gameOverUI])

  /** Reduce-motion: dial down screen shake + slow the death wash.
   * Stored in a ref so the RAF loop reads a live value without depending
   * on the React state and tearing itself down on toggle. */
  const reduceMotionRef = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reduceMotionRef.current = mq.matches
    const h = () => {
      reduceMotionRef.current = mq.matches
    }
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  /** Restart: replace the state object with a fresh one (keep highscore). */
  const restart = useCallback(() => {
    const fresh = createInitialState(highScoreRef.current)
    stateRef.current = fresh
    /** Reset the sync ref so the loop's per-frame check writes through. */
    lastSyncedRef.current = {
      score: 0,
      wave: 1,
      lives: fresh.lives,
      gameOverUI: false,
      pausedUI: false,
    }
    setScore(0)
    setWave(1)
    setLives(fresh.lives)
    setGameOverUI(false)
    setPausedUI(false)
  }, [])

  /** Wire input attach to the canvas container. Keyboard handlers are
   * window-scoped (so the player doesn't have to keep clicking to focus);
   * touch handlers are container-scoped (only fire when touching the game). */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    return inputRef.current.attach(el)
  }, [])

  /** Main RAF loop. */
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2)

    const layoutCanvas = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width < 4) return
      const targetCssH = rect.width * (LOGICAL_H / LOGICAL_W)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${targetCssH}px`
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(targetCssH * dpr))
    }
    layoutCanvas()
    const ro = new ResizeObserver(layoutCanvas)
    ro.observe(container)

    const eventQueue: GameEvent[] = []
    const sink = (event: GameEvent) => {
      eventQueue.push(event)
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const state = stateRef.current

      /** -------- Input → tick -------- */
      const input = inputRef.current.consume()
      tick(state, input, sink)
      frameCountRef.current += 1

      /** Drain events into the particle system. */
      for (const ev of eventQueue) {
        particlesRef.current.handleEvent(ev)
      }
      eventQueue.length = 0

      /** Continuous emits driven by state (not events). */
      if (state.phase.kind === "playing") {
        particlesRef.current.emitThruster(state.playerX, state.playerVx)
      } else if (state.phase.kind === "waveSpawn") {
        /** Approx fly-in positions: aliens slide from off-screen above to
         * their formation slots; emit dust at intermediate positions. */
        const t =
          1 - state.phase.framesLeft / 80
        const eased = 1 - Math.pow(1 - t, 3)
        const positions: Array<{ x: number; y: number }> = []
        for (let r = 0; r < ALIEN_ROWS; r++) {
          for (let c = 0; c < ALIEN_COLS; c++) {
            const tx = state.formationX + c * ALIEN_HSPACE
            const ty = state.formationY + r * ALIEN_VSPACE
            const startY = -30 - r * 12
            positions.push({
              x: tx,
              y: startY + (ty - startY) * eased,
            })
          }
        }
        particlesRef.current.emitWaveSpawnDust(positions)
      }

      particlesRef.current.step(performance.now())

      /** -------- Sync surface state for the HUD (only when changed) --------
       * Compare against `lastSyncedRef`, NOT the closure-captured value, so
       * we don't keep firing setState every frame after the closure goes
       * stale (the RAF loop's effect has empty deps). */
      const sync = lastSyncedRef.current
      if (state.score !== sync.score) {
        sync.score = state.score
        setScore(state.score)
      }
      if (state.wave !== sync.wave) {
        sync.wave = state.wave
        setWave(state.wave)
      }
      if (state.lives !== sync.lives) {
        sync.lives = state.lives
        setLives(state.lives)
      }
      const isGameOver = state.phase.kind === "gameOver"
      if (isGameOver !== sync.gameOverUI) {
        sync.gameOverUI = isGameOver
        setGameOverUI(isGameOver)
      }
      if (isGameOver && state.score > highScoreRef.current) {
        highScoreRef.current = state.score
      }
      const isPaused = state.phase.kind === "paused"
      if (isPaused !== sync.pausedUI) {
        sync.pausedUI = isPaused
        setPausedUI(isPaused)
      }

      /** -------- Render -------- */
      ctx.save()
      /** Scale logical → device pixel space. */
      const sx = canvas.width / LOGICAL_W
      const sy = canvas.height / LOGICAL_H
      ctx.scale(sx, sy)
      /** Screen shake — translate the entire scene by a small randomised
       * offset, attenuated by reduceMotion. */
      const shakeAmp = reduceMotionRef.current ? state.shake * 0.3 : state.shake
      if (shakeAmp > 0) {
        ctx.translate(
          (Math.random() - 0.5) * shakeAmp,
          (Math.random() - 0.5) * shakeAmp
        )
      }
      renderFrame(ctx, state, renderStateRef.current, frameCountRef.current)
      particlesRef.current.render(ctx)
      ctx.restore()
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  /** Empty deps — the loop reads state via refs, and surface-state setters
   * are stable. `reduceMotion` lives in a ref-equivalent path: re-running
   * on its change would tear down the loop, but we want a smooth toggle.
   * Read it from a ref instead. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Restart on R-key edge in game-over state. */
  useEffect(() => {
    if (!gameOverUI) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R" || e.key === "Enter") {
        restart()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [gameOverUI, restart])

  const wrapPad =
    size === "xl"
      ? "p-8 small:p-10 max-w-6xl"
      : size === "lg"
      ? "p-6 small:p-8 max-w-5xl"
      : "p-4 small:p-5 max-w-2xl"
  const colGap =
    size === "xl" ? "gap-12" : size === "lg" ? "gap-9" : "gap-6"
  const sideMinW =
    size === "xl"
      ? "min-w-[18rem]"
      : size === "lg"
      ? "min-w-[15rem]"
      : "min-w-[10rem]"
  /** Match Tetris's playfield width tier: xl ≈ 22rem wide; lg ≈ 18rem. */
  const playWidth =
    size === "xl"
      ? "w-[22rem] small:w-[26rem]"
      : size === "lg"
      ? "w-[18rem] small:w-[22rem]"
      : "w-[14rem]"

  return (
    <div className={`text-white ${wrapPad}`}>
      <div className={`flex flex-col small:flex-row ${colGap} small:items-start`}>
        <div
          className="inline-block outline-none"
          tabIndex={0}
          role="application"
          aria-label="Mini Space Invaders. Focus this area to use the keyboard."
        >
          <p className="text-[11px] text-white/40 mb-3 tracking-wide">
            ← / → move · space = fire · P = pause · R = restart
          </p>
          <div
            ref={containerRef}
            className={`relative ${playWidth} rounded-md`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 0 32px 4px rgba(120,180,255,0.10), 0 0 80px 12px rgba(120,180,255,0.06)",
              touchAction: "none",
            }}
          >
            <canvas ref={canvasRef} className="block w-full rounded-md bg-black" />
          </div>
        </div>

        <div className={`flex flex-col gap-5 ${sideMinW} text-sm text-white`}>
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
              Score
            </p>
            <p
              className="font-bold tabular-nums tracking-tight"
              style={{
                fontSize:
                  size === "xl"
                    ? "2.75rem"
                    : size === "lg"
                    ? "2.25rem"
                    : "1.625rem",
                lineHeight: 1.05,
                textShadow:
                  "0 0 12px rgba(120,180,255,0.45), 0 0 30px rgba(120,180,255,0.25)",
              }}
            >
              {score}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
              Wave
            </p>
            <p
              className="font-bold tabular-nums tracking-tight"
              style={{
                fontSize:
                  size === "xl"
                    ? "2.25rem"
                    : size === "lg"
                    ? "1.75rem"
                    : "1.25rem",
                lineHeight: 1.05,
                textShadow:
                  "0 0 10px rgba(120,180,255,0.35), 0 0 24px rgba(120,180,255,0.18)",
              }}
            >
              {wave}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
              Lives
            </p>
            <div className="mt-2 flex gap-1.5" aria-label={`${lives} lives remaining`}>
              {Array.from({ length: lives }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-3 w-5 rounded-sm"
                  style={{
                    background: `rgb(${PLAYER_RGB[0]}, ${PLAYER_RGB[1]}, ${PLAYER_RGB[2]})`,
                    boxShadow:
                      "0 0 6px 1px rgba(61,207,194,0.55)",
                  }}
                />
              ))}
            </div>
          </div>
          {gameOverUI ? (
            <p className="text-sm text-white font-medium" role="status">
              Game over
            </p>
          ) : pausedUI ? (
            <p className="text-sm text-white/70 font-medium" role="status">
              Paused
            </p>
          ) : null}
          <button
            type="button"
            onClick={restart}
            className="w-fit mt-1 rounded-md border border-white/25 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-ui-fg-base"
          >
            {gameOverUI ? "Play again" : "Restart"}
          </button>
        </div>
      </div>
    </div>
  )
}
