'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'

export default function EditUserPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    role_id: '',
    is_active: true,
  })
  const [passwordChanged, setPasswordChanged] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', params.id],
    queryFn: () => usersService.getUser(params.id),
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getRoles,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        username: user.username,
        password: '',
        role_id: user.role_id,
        is_active: user.is_active,
      })
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersService.updateUser(params.id, data),
    onSuccess: () => {
      router.push('/users')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updateData: any = {
      full_name: formData.full_name,
      username: formData.username,
      role_id: formData.role_id,
      is_active: formData.is_active,
    }
    if (passwordChanged && formData.password) {
      updateData.password = formData.password
    }
    updateMutation.mutate(updateData)
  }

  if (isLoading) {
    return (
      <DashboardLayout requiredPermission="USER_UPDATE">
        <PageSpinner message={t('users.loadingUser')} fullScreen={false} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredPermission="USER_UPDATE">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('users.editUser')}</h1>

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
                {t('users.passwordLeaveBlank')}
              </label>
              <input
                type="password"
                minLength={8}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setPasswordChanged(true)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('users.role')}
              </label>
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

            {updateMutation.isError && (
              <div className="text-red-600 text-sm">
                {t('users.errorUpdating')}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? t('users.updating') : t('users.updateUser')}
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
