"use client"

import { useRouter, useParams } from "next/navigation"
import { MagnifyingGlassMini, XMarkMini } from "@medusajs/icons"
import { useEffect, useRef, useState, FormEvent, ChangeEvent } from "react"
import { HttpTypes } from "@medusajs/types"

import { search } from "@modules/search/actions"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

export default function SearchModal() {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "vn"
  const searchRef = useRef(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState("")
  const [results, setResults] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(false)

  const handleOutsideClick = (event: MouseEvent) => {
    if (event.target === searchRef.current) {
      router.back()
    }
  }

  useEffect(() => {
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!value) {
      setResults([])
      return
    }
    const timeout = setTimeout(() => {
      setLoading(true)
      search(value, countryCode)
        .then(setResults)
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [value, countryCode])

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value)
  }

  const onReset = () => {
    setValue("")
    inputRef.current?.focus()
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (value) {
      router.push(`/results/${value}`)
    }
  }

  return (
    <div className="relative z-[75]">
      <div className="fixed inset-0 bg-opacity-75 backdrop-blur-md opacity-100 h-screen w-screen" />
      <div className="fixed inset-0 px-5 sm:p-0" ref={searchRef}>
        <div className="flex flex-col justify-start w-full h-fit transform p-5 items-center text-left align-middle transition-all max-h-[75vh] bg-transparent shadow-none">
          <div
            className="flex absolute flex-col h-fit w-full sm:w-[50vw]"
            data-testid="search-modal-container"
          >
            <div className="w-full flex items-center gap-x-2 p-4 bg-[rgba(3,7,18,0.5)] text-ui-fg-on-color backdrop-blur-2xl rounded-rounded">
              <MagnifyingGlassMini />
              <form action="" noValidate onSubmit={onSubmit} className="w-full">
                <div className="flex items-center justify-between">
                  <input
                    ref={inputRef}
                    data-testid="search-input"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    placeholder="Tìm sản phẩm..."
                    spellCheck={false}
                    type="search"
                    value={value}
                    onChange={onChange}
                    className="txt-compact-large h-6 placeholder:text-ui-fg-on-color placeholder:transition-colors focus:outline-none flex-1 bg-transparent"
                  />
                  {value && (
                    <button
                      onClick={onReset}
                      type="button"
                      className="items-center justify-center text-ui-fg-on-color focus:outline-none gap-x-2 px-2 txt-compact-large flex"
                    >
                      <XMarkMini />
                      Xóa
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="mt-1 w-full bg-white rounded-rounded overflow-hidden">
              {value && (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4"
                  data-testid="search-results"
                >
                  {results.slice(0, 6).map((product) => (
                    <LocalizedClientLink
                      key={product.id}
                      href={`/products/${product.handle}`}
                      data-testid="search-result"
                      onClick={() => router.back()}
                      className="flex flex-col gap-2 p-2 rounded-rounded hover:bg-ui-bg-subtle"
                    >
                      <Thumbnail
                        thumbnail={product.thumbnail}
                        size="square"
                        className="w-full"
                      />
                      <span className="text-sm text-ui-fg-subtle line-clamp-2">
                        {product.title}
                      </span>
                    </LocalizedClientLink>
                  ))}

                  {!loading && results.length === 0 && (
                    <p className="col-span-full text-center text-ui-fg-muted py-4">
                      Không tìm thấy sản phẩm.
                    </p>
                  )}
                </div>
              )}

              {value && (
                <LocalizedClientLink
                  href={`/results/${value}`}
                  className="block text-center py-3 border-t border-ui-border-base text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                >
                  Xem tất cả kết quả
                </LocalizedClientLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
