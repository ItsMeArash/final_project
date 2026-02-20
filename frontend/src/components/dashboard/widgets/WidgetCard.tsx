'use client'

interface WidgetCardProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function WidgetCard({ title, children, actions, className = '' }: WidgetCardProps) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <h3 className="drag-handle flex flex-1 cursor-grab items-center gap-2 truncate text-sm font-semibold text-gray-800 active:cursor-grabbing dark:text-gray-200">
          {title}
        </h3>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
