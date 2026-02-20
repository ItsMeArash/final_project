'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { PasswordInput } from '@/components/ui/PasswordInput'

const inputBase =
  'w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400'

const inputError = 'border-red-500 focus:ring-red-500/30 focus:border-red-500'

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  showPasswordLabel?: string
  hidePasswordLabel?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, className, id, type, showPasswordLabel, hidePasswordLabel, ...props }, ref) => {
    const fieldId = id ?? `field-${label.replace(/\s/g, '-').toLowerCase()}`
    const isPassword = type === 'password'
    const inputClassName = cn(inputBase, error && inputError, className)

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        {isPassword ? (
          <PasswordInput
            ref={ref}
            id={fieldId}
            inputClassName={inputClassName}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            showPasswordLabel={showPasswordLabel}
            hidePasswordLabel={hidePasswordLabel}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={fieldId}
            type={type}
            className={inputClassName}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            {...props}
          />
        )}
        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
