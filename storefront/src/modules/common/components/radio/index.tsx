"use client"

import { useEffect, useState } from "react"

const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  // Use client-side only rendering to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  const [clientChecked, setClientChecked] = useState(false)
  
  // After component mounts, update the client state to match the prop
  useEffect(() => {
    setIsMounted(true)
    setClientChecked(checked)
  }, [checked])

  // During SSR and initial client render, use a consistent state
  // This prevents hydration mismatch
  const dataState = isMounted ? (clientChecked ? "checked" : "unchecked") : "unchecked"

  return (
    <>
      <button
        type="button"
        role="radio"
        aria-checked={isMounted ? clientChecked : "false"}
        data-state={dataState}
        className="group relative flex h-5 w-5 items-center justify-center outline-none"
        data-testid={dataTestId || 'radio-button'}
      >
        <div className="shadow-borders-base group-hover:shadow-borders-strong-with-shadow bg-ui-bg-base group-data-[state=checked]:bg-ui-bg-interactive group-data-[state=checked]:shadow-borders-interactive group-focus:!shadow-borders-interactive-with-focus group-disabled:!bg-ui-bg-disabled group-disabled:!shadow-borders-base flex h-[14px] w-[14px] items-center justify-center rounded-full transition-all">
          {/* Only render the span on the client side after mounting */}
          {isMounted && clientChecked && (
            <span
              data-state={dataState}
              className="group flex items-center justify-center"
            >
              <div className="bg-ui-bg-base shadow-details-contrast-on-bg-interactive group-disabled:bg-ui-fg-disabled rounded-full group-disabled:shadow-none h-1.5 w-1.5"></div>
            </span>
          )}
        </div>
      </button>
    </>
  )
}

export default Radio
