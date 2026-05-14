"use client"

import { createContext, useContext, useMemo, useState } from "react"

type CustomizeModeContextValue = {
  isCustomizing: boolean
  setIsCustomizing: (value: boolean) => void
}

const CustomizeModeContext = createContext<CustomizeModeContextValue | null>(null)

export function CustomizeModeProvider({ children }: { children: React.ReactNode }) {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const value = useMemo(
    () => ({ isCustomizing, setIsCustomizing }),
    [isCustomizing]
  )
  return (
    <CustomizeModeContext.Provider value={value}>
      {children}
    </CustomizeModeContext.Provider>
  )
}

export function useCustomizeMode(): CustomizeModeContextValue {
  const ctx = useContext(CustomizeModeContext)
  if (!ctx) {
    throw new Error("useCustomizeMode must be used within CustomizeModeProvider")
  }
  return ctx
}

export function useCustomizeModeOptional(): CustomizeModeContextValue | null {
  return useContext(CustomizeModeContext)
}
