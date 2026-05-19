"use client"

import React, { useEffect, useRef, useState } from "react"

type ChatMessage = { role: "user" | "assistant"; content: string }

const SESSION_KEY = "scp_chat_v1"
const SUGGESTED_QUESTIONS = [
  "What's the minimum order for screen printing?",
  "How does pricing work for embroidery?",
  "Should I do DTF or screen print for 50 hoodies?",
  "What file format do I need to send?",
]

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) setMessages(JSON.parse(stored))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages))
    } catch {
      /* ignore */
    }
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || pending) return
    setError(null)
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
    setMessages(next)
    setInput("")
    setPending(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message ?? "Sorry, the chat is unavailable right now.")
      } else if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
      }
    } catch {
      setError("Couldn't reach the chat service. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed right-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-[var(--brand-primary,#002a5c)] text-white shadow-lg hover:opacity-90 tablet:right-5 tablet:bottom-5 tablet:px-4 tablet:py-3 tablet:text-sm tablet:font-medium"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <span className="tablet:hidden" aria-hidden>
          {open ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z" />
            </svg>
          )}
        </span>
        <span className="hidden tablet:inline">{open ? "Close" : "Chat with us"}</span>
      </button>

      {open && (
        <div
          className="fixed right-3 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-50 flex h-[min(70dvh,520px)] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-xl tablet:right-5 tablet:bottom-20 tablet:h-[520px] tablet:w-[360px] tablet:max-w-[calc(100vw-2.5rem)]"
        >
          <div className="border-b border-ui-border-base bg-[var(--brand-primary,#002a5c)] px-4 py-3 text-white">
            <div className="text-sm font-semibold">SC Prints assistant</div>
            <div className="text-xs opacity-80">
              AI-assisted answers — final pricing via the on-page estimator.
            </div>
          </div>

          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-3 text-sm">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-ui-fg-subtle">
                  Ask me about decoration methods, minimums, turnaround, or files. Try:
                </p>
                <div className="flex flex-col gap-1">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-md border border-ui-border-base px-2 py-1 text-left text-xs text-ui-fg-base hover:bg-ui-bg-subtle"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`whitespace-pre-wrap rounded-md px-3 py-2 ${
                      m.role === "user"
                        ? "ml-8 bg-[var(--brand-primary,#002a5c)] text-white"
                        : "mr-8 bg-ui-bg-subtle text-ui-fg-base"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {pending && (
                  <div className="mr-8 rounded-md bg-ui-bg-subtle px-3 py-2 text-ui-fg-subtle">
                    Thinking…
                  </div>
                )}
                {error && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            className="flex items-end gap-2 border-t border-ui-border-base p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              rows={2}
              placeholder="Ask about pricing, methods, files…"
              className="flex-1 resize-none rounded-md border border-ui-border-base px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="rounded-md bg-[var(--brand-primary,#002a5c)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatWidget
