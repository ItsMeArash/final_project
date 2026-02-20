'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface FormCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const fieldId = id ?? `checkbox-${label.replace(/\s/g, '-').toLowerCase()}`

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-50 has-[:checked]:border-primary-300 has-[:checked]:bg-primary-50/50 dark:border-gray-600 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 dark:has-[:checked]:border-primary-500 dark:has-[:checked]:bg-primary-900/30"
        >
          <input
            ref={ref}
            type="checkbox"
            id={fieldId}
            className={cn(
              'h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500/30 dark:border-gray-600 dark:bg-gray-700',
              error && 'border-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            {...props}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </label>
        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormCheckbox.displayName = 'FormCheckbox'
