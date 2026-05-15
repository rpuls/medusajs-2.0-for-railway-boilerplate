import { test as baseTest, Page } from "@playwright/test"

type APILog = {
  method: string
  url: string
  status?: number
  requestHeaders: Record<string, string>
  responseHeaders?: Record<string, string>
  requestBody?: string
  responseBody?: string
  timestamp: string
}

export type APISpyFixture = {
  apiLogs: APILog[]
  clearLogs: () => void
}

export const test = baseTest.extend<APISpyFixture>({
  apiLogs: [],
  clearLogs: async ({}, use) => {
    await use(() => {
      // Provided by fixture context
    })
  },
})

/**
 * Intercept page API requests/responses for debugging.
 * Logs are automatically included in test report on failure.
 */
export async function setupAPISpy(
  page: Page,
  apiLogs: APILog[]
): Promise<void> {
  const requests = new Map<string, APILog>()

  page.on("request", (request) => {
    const key = `${request.method()}-${request.url()}`
    const headers: Record<string, string> = {}
    Object.entries(request.headers()).forEach(([k, v]) => {
      headers[k] = v
    })

    const log: APILog = {
      method: request.method(),
      url: request.url(),
      requestHeaders: headers,
      timestamp: new Date().toISOString(),
    }

    try {
      const postData = request.postData()
      if (postData) {
        log.requestBody = postData
      }
    } catch {
      // Some requests don't have bodies
    }

    requests.set(key, log)
  })

  page.on("response", (response) => {
    const key = `${response.request().method()}-${response.request().url()}`
    const log = requests.get(key)

    if (log) {
      log.status = response.status()

      const headers: Record<string, string> = {}
      Object.entries(response.headers()).forEach(([k, v]) => {
        headers[k] = v
      })
      log.responseHeaders = headers

      // Only capture response body for failed requests
      if (response.status() >= 400) {
        response
          .text()
          .then((text) => {
            log.responseBody = text
          })
          .catch(() => {
            // Ignore errors reading body
          })
      }

      apiLogs.push(log)
      requests.delete(key)
    }
  })
}
