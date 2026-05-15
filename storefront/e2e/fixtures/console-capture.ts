import { test as baseTest, Page } from "@playwright/test"

type ConsoleLog = {
  type: "log" | "warn" | "error" | "debug" | "info"
  message: string
  args: string[]
  timestamp: string
}

export type ConsoleCaptureFixture = {
  consoleLogs: ConsoleLog[]
  clearLogs: () => void
}

export const test = baseTest.extend<ConsoleCaptureFixture>({
  consoleLogs: [],
  clearLogs: async ({}, use) => {
    await use(() => {
      // Provided by fixture context
    })
  },
})

/**
 * Capture browser console messages (log, warn, error, etc).
 * Useful for debugging client-side issues.
 */
export async function setupConsoleCapture(
  page: Page,
  consoleLogs: ConsoleLog[]
): Promise<void> {
  page.on("console", (msg) => {
    const args: string[] = []
    try {
      // Try to get serialized arguments
      msg.args().forEach((arg) => {
        arg.jsonValue()
          .then((val) => {
            args.push(JSON.stringify(val))
          })
          .catch(() => {
            args.push(String(arg))
          })
      })
    } catch {
      // Fallback to just the message
    }

    consoleLogs.push({
      type: msg.type() as any,
      message: msg.text(),
      args,
      timestamp: new Date().toISOString(),
    })
  })

  // Also capture page errors (uncaught exceptions)
  page.on("pageerror", (error) => {
    consoleLogs.push({
      type: "error",
      message: `Uncaught ${error.name}: ${error.message}`,
      args: [error.stack || ""],
      timestamp: new Date().toISOString(),
    })
  })
}
