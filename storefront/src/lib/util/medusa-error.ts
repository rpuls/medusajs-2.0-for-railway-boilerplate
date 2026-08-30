const asSentence = (value: string): string => {
  const trimmed = value.trim()

  if (!trimmed) {
    return "Something went wrong."
  }

  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)

  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`
}

/**
 * Turns an error from the Medusa JS SDK into a message worth showing a customer.
 *
 * The SDK is fetch-based and throws `FetchError`, which carries the API's own
 * error message plus the HTTP status. It has no axios-style `response` or
 * `request` property, so anything checking for those falls through and reports
 * the wrong thing.
 */
export default function medusaError(error: any): never {
  // A FetchError: the request reached the server and came back non-2xx. Its
  // `message` is already the API's own message, falling back to the status text.
  if (error && typeof error.status === "number") {
    const message =
      typeof error.message === "string" && error.message.trim()
        ? error.message
        : error.statusText || `Request failed with status ${error.status}`

    console.error(`Medusa API error ${error.status}:`, message)

    throw new Error(asSentence(message))
  }

  // A network-level failure: the backend is down, unreachable or misconfigured,
  // so the request never got a response and there is no status to report.
  if (error instanceof TypeError) {
    console.error("Could not reach the Medusa backend:", error.message)

    throw new Error("Could not reach the store. Please try again.")
  }

  console.error("Unexpected error talking to Medusa:", error)

  throw new Error(asSentence(error?.message ?? String(error)))
}
