'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { usersService } from '@/services/users'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { useAuthStore } from '@/stores/authStore'
import { LocaleLink } from '@/components/LocaleLink'
import { UserPlus, Pencil, Trash2 } from 'lucide-react'

export default function UsersPage() {
  const { t } = useDictionary()
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getUsers,
  })

  const deleteMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout requiredPermission="USER_READ">
        <PageSpinner message={t('users.loadingUsers')} fullScreen={false} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredPermission="USER_READ">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('users.title')}</h1>
          {hasPermission('USER_CREATE') && (
            <LocaleLink
              href="/users/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <UserPlus className="h-4 w-4" />
              {t('users.createUser')}
            </LocaleLink>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.name')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.username')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.role')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-start">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-start">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-start">
                    {user.role && hasPermission('ROLE_MANAGE') ? (
                      <LocaleLink
                        href={`/roles/${user.role.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {user.role.name}
                      </LocaleLink>
                    ) : (
                      user.role?.name || t('common.na')
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-start">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-start">
                    <div className="inline-flex flex-wrap items-center gap-2">
                      {hasPermission('USER_UPDATE') && (
                        <LocaleLink
                          href={`/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 text-primary-600 transition-colors hover:text-primary-900"
                        >
                          <Pencil className="h-4 w-4" />
                          {t('users.edit')}
                        </LocaleLink>
                      )}
                      {hasPermission('USER_DELETE') && (
                        <button
                          onClick={() => {
                            if (confirm(t('users.deleteConfirm'))) {
                              deleteMutation.mutate(user.id)
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-red-600 transition-colors hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('users.delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
