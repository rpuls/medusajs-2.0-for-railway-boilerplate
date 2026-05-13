import { Container, Text } from "@medusajs/ui"
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react"

type Props = {
  name: string
  children: ReactNode
}

type State = {
  error: Error | null
}

class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[admin-widget:${this.props.name}] render error`,
      error,
      info.componentStack,
    )
  }

  render() {
    if (this.state.error) {
      return (
        <Container className="p-6">
          <Text size="small" weight="plus" className="text-ui-fg-error">
            Widget failed to render: {this.props.name}
          </Text>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            {this.state.error.message || String(this.state.error)}
          </Text>
          <Text size="xsmall" className="text-ui-fg-muted mt-2">
            See browser console for the full stack. The rest of the page is unaffected.
          </Text>
        </Container>
      )
    }
    return this.props.children
  }
}

export function withWidgetBoundary<P extends object>(
  Wrapped: ComponentType<P>,
  name: string,
): ComponentType<P> {
  const Boundaried = (props: P) => (
    <WidgetErrorBoundary name={name}>
      <Wrapped {...props} />
    </WidgetErrorBoundary>
  )
  Boundaried.displayName = `WithWidgetBoundary(${name})`
  return Boundaried
}
