'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createUserSchema,
  getUpdateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from '@/schemas/userForm'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'
import { FormCheckbox } from './FormCheckbox'
import { LocaleLink } from '@/components/LocaleLink'
import { useDictionary } from '@/contexts/DictionaryContext'
import type { Role } from '@/services/roles'

interface UserFormBaseProps {
  roles: Role[] | undefined
  hasRolePermission: boolean
  isPending: boolean
  submitLabel: string
  pendingLabel: string
  errorMessage: string
  hasError: boolean
  onCancel: () => void
  title: string
  subtitle: string
}

interface CreateUserFormProps extends UserFormBaseProps {
  mode: 'create'
  defaultValues: CreateUserFormData
  onSubmit: (data: CreateUserFormData) => void
}

interface EditUserFormProps extends UserFormBaseProps {
  mode: 'edit'
  defaultValues: UpdateUserFormData
  onSubmit: (data: UpdateUserFormData) => void
}

export function UserForm(props: CreateUserFormProps | EditUserFormProps) {
  const {
    defaultValues,
    roles,
    hasRolePermission,
    onSubmit,
    isPending,
    submitLabel,
    pendingLabel,
    errorMessage,
    hasError,
    onCancel,
    title,
    subtitle,
  } = props

  const { t } = useDictionary()
  const isCreate = props.mode === 'create'
  const schema = isCreate ? createUserSchema(t) : getUpdateUserSchema(t)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema) as Resolver<CreateUserFormData | UpdateUserFormData>,
    defaultValues,
  })

  const roleOptions =
    roles?.map((r) => ({
      value: r.id,
      label: `${r.name}${r.description ? ` - ${r.description}` : ''}`,
    })) ?? []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-5 dark:border-gray-700 dark:bg-gray-700/30">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2">
              <FormField
                label={t('users.fullName')}
                {...register('full_name')}
                error={errors.full_name?.message as string | undefined}
                placeholder={t('validation.placeholderFullName')}
                autoComplete="name"
              />
            </div>

            <div>
              <FormField
                label={t('users.username')}
                {...register('username')}
                error={errors.username?.message as string | undefined}
                placeholder={t('validation.placeholderUsername')}
                autoComplete="username"
              />
            </div>

            <div>
              <FormField
                type="password"
                label={
                  isCreate
                    ? t('auth.password')
                    : t('users.passwordLeaveBlank')
                }
                {...register('password')}
                error={errors.password?.message as string | undefined}
                placeholder="••••••••"
                autoComplete={isCreate ? 'new-password' : 'current-password'}
                hint={isCreate ? t('validation.passwordHint') : undefined}
                showPasswordLabel={t('auth.showPassword')}
                hidePasswordLabel={t('auth.hidePassword')}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('users.role')}
                </span>
                {hasRolePermission && (
                  <LocaleLink
                    href="/roles"
                    className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {t('roles.manageRoles')}
                  </LocaleLink>
                )}
              </div>
              <FormSelect
                {...register('role_id')}
                options={roleOptions}
                placeholder={t('users.selectRole')}
                error={errors.role_id?.message as string | undefined}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <FormCheckbox
                label={t('common.active')}
                {...register('is_active')}
                error={errors.is_active?.message as string | undefined}
              />
            </div>
          </div>

          {hasError && (
            <div
              className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400"
              role="alert"
            >
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
