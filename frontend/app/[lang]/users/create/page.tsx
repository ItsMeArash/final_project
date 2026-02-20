'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LocaleLink } from '@/components/LocaleLink'
import { useAuthStore } from '@/stores/authStore'

export default function CreateUserPage() {
  const { t } = useDictionary()
  const router = useRouter()
  const params = useParams()
  const { hasPermission } = useAuthStore()
  const lang = params?.lang as string
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    role_id: '',
    is_active: true,
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getRoles,
  })

  const createMutation = useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      router.push(`/${lang}/users`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData as Parameters<typeof usersService.createUser>[0])
  }

  return (
    <DashboardLayout requiredPermission="USER_CREATE">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('users.createUser')}</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('users.fullName')}
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('users.username')}
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('users.role')}
                </label>
                {hasPermission('ROLE_MANAGE') && (
                  <LocaleLink
                    href="/roles"
                    className="text-sm text-primary-600 hover:text-primary-900"
                  >
                    {t('roles.manageRoles')}
                  </LocaleLink>
                )}
              </div>
              <select
                required
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('users.selectRole')}</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{t('common.active')}</span>
              </label>
            </div>

            {createMutation.isError && (
              <div className="text-red-600 text-sm">{t('users.errorCreating')}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {createMutation.isPending ? t('users.creating') : t('users.createUser')}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
