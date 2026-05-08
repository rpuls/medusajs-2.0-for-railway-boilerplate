/**
 * Input handling for Space Invaders. Wraps both keyboard (arrows, WASD,
 * space, P/Esc) and touch (left-half/right-half move + tap-to-fire).
 *
 * Input state is held internally; the component reads a snapshot each frame
 * via `consume()`, which also resets the edge-triggered flags so a single
 * key press doesn't fire repeatedly across multiple frames.
 */

import type { InputState } from "./tick"

/** Internal mutable buffer the listeners write into; `consume()` returns a
 * shallow copy and clears the edge flags. */
type InternalInput = {
  left: boolean
  right: boolean
  fire: boolean
  pauseQueued: boolean
  restartQueued: boolean
}

export type InvadersInput = {
  attach: (el: HTMLElement) => () => void
  consume: () => InputState
  setRestart: () => void
}

export function createInvadersInput(): InvadersInput {
  const buf: InternalInput = {
    left: false,
    right: false,
    fire: false,
    pauseQueued: false,
    restartQueued: false,
  }

  /** Keyboard listeners need to be installed at the window level so the
   * player doesn't have to keep clicking the canvas to retain focus, but
   * we ALSO must respect the brief: "should never trap keyboard focus —
   * users need to be able to tab away to the back-to-home link." So we
   * only consume keys when the canvas is currently focused/active. The
   * focused-element check below makes Tab work as expected. */
  const onKeyDown = (e: KeyboardEvent) => {
    /** If the user is typing in an input/textarea, don't intercept. */
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === "INPUT" || tag === "TEXTAREA") return
    /** Ignore key auto-repeat — we use sustained `keydown`/`keyup` for
     * left/right/fire and edge-triggered for pause/restart. The repeat
     * doesn't matter for sustained keys, but Pause shouldn't fire 30×/s
     * if the player holds the key. */
    if (e.repeat) {
      /** Still mark sustained inputs (no-op since they're already true). */
      return
    }
    switch (e.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        buf.left = true
        e.preventDefault()
        break
      case "ArrowRight":
      case "d":
      case "D":
        buf.right = true
        e.preventDefault()
        break
      case " ":
      case "ArrowUp":
      case "w":
      case "W":
        buf.fire = true
        e.preventDefault()
        break
      case "p":
      case "P":
      case "Escape":
        buf.pauseQueued = true
        break
      case "r":
      case "R":
        buf.restartQueued = true
        break
    }
  }
  const onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        buf.left = false
        break
      case "ArrowRight":
      case "d":
      case "D":
        buf.right = false
        break
      case " ":
      case "ArrowUp":
      case "w":
      case "W":
        buf.fire = false
        break
    }
  }

  /** Touch handlers attached to a specific element so they only fire when
   * the player is interacting with the game area. */
  const attach = (el: HTMLElement): (() => void) => {
    /** Track active touches by id so multi-touch (e.g. holding move while
     * tapping fire elsewhere) works naturally. */
    const moveTouches = new Map<number, "left" | "right">()

    const touchStart = (e: TouchEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      for (const t of Array.from(e.changedTouches)) {
        const x = t.clientX - rect.left
        const fracX = x / rect.width
        /** Tap also fires — every new touch triggers a single fire frame. */
        buf.fire = true
        if (fracX < 0.5) {
          moveTouches.set(t.identifier, "left")
          buf.left = true
        } else {
          moveTouches.set(t.identifier, "right")
          buf.right = true
        }
      }
    }
    const touchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        const dir = moveTouches.get(t.identifier)
        moveTouches.delete(t.identifier)
        if (dir === "left") {
          /** Only clear the flag if no other touch is holding left. */
          let stillLeft = false
          moveTouches.forEach((v) => {
            if (v === "left") stillLeft = true
          })
          if (!stillLeft) buf.left = false
        } else if (dir === "right") {
          let stillRight = false
          moveTouches.forEach((v) => {
            if (v === "right") stillRight = true
          })
          if (!stillRight) buf.right = false
        }
      }
      /** Auto-fire while ANY touch is held — desktop "hold space" parity.
       * Clear fire only when the last touch lifts. */
      if (moveTouches.size === 0) {
        buf.fire = false
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    el.addEventListener("touchstart", touchStart, { passive: false })
    el.addEventListener("touchend", touchEnd)
    el.addEventListener("touchcancel", touchEnd)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      el.removeEventListener("touchstart", touchStart)
      el.removeEventListener("touchend", touchEnd)
      el.removeEventListener("touchcancel", touchEnd)
    }
  }

  const consume = (): InputState => {
    const out: InputState = {
      left: buf.left,
      right: buf.right,
      fire: buf.fire,
      pauseEdge: buf.pauseQueued,
      restartEdge: buf.restartQueued,
    }
    /** Edge-triggered flags reset on consume so each press fires once. */
    buf.pauseQueued = false
    buf.restartQueued = false
    return out
  }

  const setRestart = () => {
    buf.restartQueued = true
  }

  return { attach, consume, setRestart }
}
