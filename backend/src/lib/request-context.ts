import { ulid } from "ulid"
import { AsyncLocalStorage } from "async_hooks"
import * as fs from "fs"
import * as path from "path"

export interface RequestContext {
  requestId: string
  traceId?: string
  userId?: string
  timestamp: number
}

class RequestContextStore {
  private store = new AsyncLocalStorage<RequestContext>()
  private logPath = path.join(process.cwd(), "logs", "requests.jsonl")

  constructor() {
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logPath)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
  }

  /**
   * Initialize a new request context with a unique request ID.
   * Runs the callback within that context.
   */
  run<T>(callback: () => T, overrides?: Partial<RequestContext>): T {
    const context: RequestContext = {
      requestId: ulid(),
      timestamp: Date.now(),
      ...overrides,
    }
    return this.store.run(context, callback)
  }

  /**
   * Get the current request context, or undefined if not in a request.
   */
  get(): RequestContext | undefined {
    return this.store.getStore()
  }

  /**
   * Get the current request ID, or generate a new one if not in a request.
   */
  getRequestId(): string {
    return this.store.getStore()?.requestId ?? ulid()
  }

  /**
   * Log a structured JSON entry with context.
   */
  log(
    level: "info" | "warn" | "error",
    message: string,
    data?: Record<string, any>
  ): void {
    const context = this.get()
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: context?.requestId,
      traceId: context?.traceId,
      userId: context?.userId,
      ...data,
    }

    // Write to file (JSON Lines format)
    const logEntry = JSON.stringify(entry)
    fs.appendFileSync(this.logPath, logEntry + "\n")

    // Also log to console
    const prefix = `[${context?.requestId || "no-ctx"}]`
    if (level === "error") {
      console.error(prefix, message, data ? JSON.stringify(data) : "")
    } else if (level === "warn") {
      console.warn(prefix, message, data ? JSON.stringify(data) : "")
    } else {
      console.log(prefix, message, data ? JSON.stringify(data) : "")
    }
  }
}

export const requestContextStore = new RequestContextStore()
