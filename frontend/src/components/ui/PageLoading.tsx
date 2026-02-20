import { PageSpinner } from './PageSpinner'

interface PageLoadingProps {
  /** Optional message shown below the spinner */
  message?: string
}

/**
 * Loading fallback for Next.js loading.tsx files.
 * Shows a top progress bar and centered spinner during page transitions.
 */
export default function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="relative flex-1 bg-white">
      <div
        className="absolute inset-x-0 top-0 h-1 animate-pulse bg-primary-600/30"
        aria-hidden
      />
      <div className="p-8">
        <PageSpinner message={message} fullScreen />
      </div>
    </div>
  )
}
