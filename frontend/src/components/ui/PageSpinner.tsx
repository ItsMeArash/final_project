'use client'

interface PageSpinnerProps {
  /** Optional message shown below the spinner */
  message?: string
  /** Use full viewport height (default: true for page transitions) */
  fullScreen?: boolean
}

export function PageSpinner({ message = 'Loading...', fullScreen = true }: PageSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? 'min-h-[50vh]' : 'py-12'
      }`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
        aria-hidden
      />
      {message && (
        <p className="animate-pulse text-sm font-medium text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  )
}
