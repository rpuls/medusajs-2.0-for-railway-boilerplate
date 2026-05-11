"use client"

import {
  THREE_TUNING_DEFAULTS,
  type ThreeTuning,
} from "./tuner-panel"

/**
 * Preset history for the Three.js particle field.
 *
 * The tuner has accumulated several distinct physics models over the past
 * weeks of iteration. Without a record of what was tried, it's easy to
 * loop back to a configuration that's already been rejected.
 *
 * CURATED presets are derived from git history of `tuner-panel.tsx` and
 * `index.tsx`. They represent named eras of the animation and let the user
 * (and Claude) replay a prior behavioural mode for direct visual comparison.
 *
 * USER presets are saved live by the user via the "Save current" button —
 * stored in localStorage under USER_PRESETS_LS_KEY, growing as more
 * experiments are recorded.
 *
 * Both kinds are merged with `THREE_TUNING_DEFAULTS` so partial presets
 * from older commits (which lacked fields like `trailingProbability`) still
 * apply cleanly.
 */

export type Preset = {
  /** Stable id used for selection. For curated presets this is hand-coded;
   * for user presets it's `user:<timestamp>`. */
  id: string
  name: string
  /** Optional one-liner describing the behaviour or why it was rejected. */
  note?: string
  /** Wall-clock when the preset was created (user presets only). */
  savedAt?: number
  /** Partial — defaults fill in missing fields when applied. */
  tuning: Partial<ThreeTuning>
}

/**
 * Curated checkpoints from git history of the threejs page. Each is a
 * distinct behavioural era. Order: oldest → newest. The last entry is the
 * current default for parity with the Reset button.
 *
 * To regenerate: run `git log --oneline -- storefront/src/modules/home/components/home-particle-three/`
 * and inspect the defaults in each commit's tuner-panel.tsx.
 */
export const CURATED_PRESETS: Preset[] = [
  {
    id: "carry-only-923f0af",
    name: "1. Carry only (commit 923f0af)",
    note: "First named build. Pure in-disk carry-lerp toward cursor. No wake mechanism. Particles bunch under the cursor and slowly return — no trail behind.",
    tuning: {
      particleCount: 140000,
      cursorRadius: 98,
      cursorDisplacement: 20,
      carryStrength: 0.75,
      inBlend: 8,
      outBlend: 0.5,
      pointSize: 2.5,
      // Wake disabled — these fields didn't exist in this era.
      trailingProbability: 0,
      trailFollowMs: 200,
      wakeBandSpreadBmp: 0,
      wakeAlongStretchBmp: 0,
    },
  },
  {
    id: "velocity-shove-9fa81b8",
    name: "2. Velocity shove (commit 9fa81b8)",
    note: "Added flow/vortex velocity layer with a units bug — particles flung outward in a massive halo. User rejected as 'massive push'.",
    tuning: {
      particleCount: 140000,
      cursorRadius: 98,
      cursorDisplacement: 20,
      carryStrength: 0.75,
      inBlend: 8,
      outBlend: 0.5,
      pointSize: 2.5,
      // Disable cursor-history wake so this preset reproduces its era.
      trailingProbability: 0,
      trailFollowMs: 200,
      wakeBandSpreadBmp: 0,
      wakeAlongStretchBmp: 0,
    },
  },
  {
    id: "cursor-history-current",
    name: "3. Cursor-history wake (current)",
    note: "Current build. Ports newmix's history-playback model. Visible band trailing the cursor's past path; trailingProbability controls density.",
    tuning: { ...THREE_TUNING_DEFAULTS },
  },
  {
    id: "newmix-reference",
    name: "4. Newmix reference (canvas-page values)",
    note: "Tuning values copied from the working canvas-2D /au/particle-logo newmix preset. Use as the target for the threejs port.",
    tuning: {
      particleCount: 140000,
      cursorRadius: 75,
      cursorDisplacement: 18,
      carryStrength: 0.85,
      inBlend: 10,
      outBlend: 0.4,
      pointSize: 2.5,
      trailingProbability: 0.65,
      trailFollowMs: 2500,
      wakePace: 0.52,
      wakePaceJitter: 0.4,
      wakeTimeOffsetMs: 1400,
      wakeAlongStretchBmp: 22,
      wakeBandSpreadBmp: 14,
      wakeReleaseStaggerMs: 600,
    },
  },
]

const USER_PRESETS_LS_KEY = "particle-threejs-user-presets-v1"

export function loadUserPresets(): Preset[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(USER_PRESETS_LS_KEY)
    if (raw == null) return []
    const parsed = JSON.parse(raw) as Preset[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveUserPresets(presets: Preset[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(USER_PRESETS_LS_KEY, JSON.stringify(presets))
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Persist a new user preset. Returns the updated list. */
export function appendUserPreset(
  existing: Preset[],
  name: string,
  tuning: ThreeTuning
): Preset[] {
  const savedAt = Date.now()
  const next: Preset[] = [
    ...existing,
    {
      id: `user:${savedAt}`,
      name: name.trim() || `Preset ${existing.length + 1}`,
      savedAt,
      tuning: { ...tuning },
    },
  ]
  saveUserPresets(next)
  return next
}

/** Remove a user preset by id. Curated ids are silently ignored. */
export function deleteUserPreset(existing: Preset[], id: string): Preset[] {
  if (!id.startsWith("user:")) return existing
  const next = existing.filter((p) => p.id !== id)
  saveUserPresets(next)
  return next
}

/** Apply a preset on top of defaults — partial entries fill from the
 * default object so old presets don't poison missing fields with NaN. */
export function applyPreset(p: Preset): ThreeTuning {
  return { ...THREE_TUNING_DEFAULTS, ...p.tuning }
}
