"use client"

import React from "react"

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
  showDetails: boolean
}

class PdpCustomizerBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, showDetails: false }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface to the browser console so it shows up in Vercel runtime logs and
    // in the user's devtools — the inline message also exposes details for
    // diagnosis on production.
    // eslint-disable-next-line no-console
    console.error("PDP customizer crashed:", error, info)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, showDetails: false })
  }

  private toggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error
      return (
        <section className="mt-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <p className="text-sm font-medium">
            Customizer is temporarily unavailable for this product.
          </p>
          <p className="mt-1 text-xs">
            The product page still works. Try again, or continue with the
            standard product options below.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-md bg-amber-900 px-3 py-1.5 font-medium text-amber-50 hover:bg-amber-800"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.toggleDetails}
              className="underline underline-offset-2 hover:text-amber-950"
            >
              {this.state.showDetails ? "Hide details" : "Show details"}
            </button>
          </div>
          {this.state.showDetails && err && (
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-amber-100 p-2 text-[11px] leading-snug text-amber-950">
              {err.name}: {err.message}
              {err.stack ? `\n\n${err.stack}` : ""}
            </pre>
          )}
        </section>
      )
    }

    return this.props.children
  }
}

export default PdpCustomizerBoundary
