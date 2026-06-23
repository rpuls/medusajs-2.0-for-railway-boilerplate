"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { clx } from "@medusajs/ui"

export const BODY_GOALS = [
  { value: "all", label: "Tất cả" },
  { value: "binding", label: "Làm phẳng ngực" },
  { value: "shoulder", label: "Rộng vai" },
  { value: "hip", label: "Che hông" },
  { value: "active", label: "Vận động" },
] as const

export type BodyGoal = (typeof BODY_GOALS)[number]["value"]

// Maps goal → product tag that must be present
export const GOAL_TAG_MAP: Record<string, string> = {
  binding: "binding",
  shoulder: "shoulder",
  hip: "hip",
  active: "active",
}

const BodyGoalFilter = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = (searchParams.get("goal") as BodyGoal) || "all"

  const setGoal = useCallback(
    (goal: BodyGoal) => {
      const params = new URLSearchParams(searchParams)
      if (goal === "all") {
        params.delete("goal")
      } else {
        params.set("goal", goal)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant mb-1">
        Mục tiêu
      </p>
      <div className="flex flex-col gap-y-1">
        {BODY_GOALS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => setGoal(g.value)}
            className={clx(
              "text-left px-3 py-2 rounded-lg text-sm font-vietnam transition-colors",
              current === g.value
                ? "bg-kin-primary text-white font-semibold"
                : "text-kin-on-surface-variant hover:bg-kin-warm-grey/30"
            )}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default BodyGoalFilter
