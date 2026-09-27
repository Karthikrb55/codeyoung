import React, { Component } from "react"
import type { ReactNode } from "react"
import { AlertCircle } from "lucide-react"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
          <div className="max-w-md space-y-4">
            <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Our team has been notified.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
              onClick={() => window.location.href = '/'}
            >
              Return Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
