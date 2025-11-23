"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "@lib/i18n/hooks/use-translation"
import dynamic from "next/dynamic"
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent } from "react"

// Lazy load InstantSearch and hooks only when needed
const InstantSearch = dynamic(
  () => import("react-instantsearch-hooks-web").then((mod) => mod.InstantSearch),
  { ssr: false }
)

const SearchBarContent = dynamic(
  () => import("./search-bar-content"),
  { ssr: false }
)

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Inner component that uses InstantSearch hooks
const SearchBarContentWrapper = ({
  isSearchActive,
  setIsSearchActive,
}: {
  isSearchActive: boolean
  setIsSearchActive: (active: boolean) => void
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search value to reduce API calls (300ms delay)
  const debouncedSearchValue = useDebounce(searchValue, 300)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.currentTarget.value)
  }

  const handleReset = () => {
    setSearchValue("")
    inputRef.current?.focus()
  }

  const handleSubmit = (e?: FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (searchValue) {
      router.push(`/results/${searchValue}`)
      setIsSearchActive(false)
      inputRef.current?.blur()
    }
  }

  const handleFocus = () => {
    setIsSearchActive(true)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay blur to allow click events on results
    setTimeout(() => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(document.activeElement)
      ) {
        setIsSearchActive(false)
      }
    }, 200)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={t("common.searchPlaceholder") || "Search in the store"}
            spellCheck={false}
            type="search"
            value={searchValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full h-12 px-4 pr-12 rounded-lg border-2 border-border-base focus:border-primary focus:outline-none text-text-primary placeholder:text-text-tertiary bg-background-base"
          />
          <div className="absolute right-2 flex items-center gap-2">
            {searchValue && (
              <button
                onClick={handleReset}
                type="button"
                className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                aria-label={t("search.clear")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="p-2 text-text-secondary hover:text-primary transition-colors"
              aria-label={t("search.submit")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {/* Only load InstantSearch when search is active and user has typed something */}
      {isSearchActive && debouncedSearchValue && (
        <InstantSearch
          indexName={SEARCH_INDEX_NAME}
          searchClient={searchClient}
        >
          <SearchBarContent
            query={debouncedSearchValue}
            onClose={() => setIsSearchActive(false)}
          />
        </InstantSearch>
      )}
    </>
  )
}

const SearchBar = () => {
  const [isSearchActive, setIsSearchActive] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Close search on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSearchActive) {
        setIsSearchActive(false)
        const input = searchContainerRef.current?.querySelector("input")
        if (input) {
          input.blur()
        }
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isSearchActive])

  // Disable body scroll when search is active
  useEffect(() => {
    if (isSearchActive) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isSearchActive])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchActive &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchActive(false)
      }
    }

    if (isSearchActive) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isSearchActive])

  return (
    <>
      {/* Backdrop overlay when search is active - covers content but header stays visible (header is z-50) */}
      {isSearchActive && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49]"
          onClick={() => setIsSearchActive(false)}
        />
      )}

      {/* Search Container */}
      <div
        ref={searchContainerRef}
        className={`relative z-[51] transition-all ${isSearchActive ? "w-full max-w-4xl mx-auto" : "w-full"
          }`}
      >
        <SearchBarContentWrapper
          isSearchActive={isSearchActive}
          setIsSearchActive={setIsSearchActive}
        />
      </div>
    </>
  )
}

export default SearchBar
