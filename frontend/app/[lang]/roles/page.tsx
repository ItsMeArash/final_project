'use client'

import { useQuery } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { rolesService } from '@/services/roles'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { LocaleLink } from '@/components/LocaleLink'
import { Pencil } from 'lucide-react'

export default function RolesPage() {
  const { t } = useDictionary()

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getRoles,
  })

  if (isLoading) {
    return (
      <DashboardLayout requiredPermission="ROLE_MANAGE">
        <PageSpinner message={t('roles.loadingRoles')} fullScreen={false} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredPermission="ROLE_MANAGE">
      <div>
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">{t('roles.title')}</h1>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('roles.name')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('roles.description')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('roles.permissions')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  {t('users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {roles?.map((role) => (
                <tr key={role.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-start text-sm font-medium text-gray-900 dark:text-gray-100">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                    {role.description || t('common.na')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-start text-sm font-medium">
                    <LocaleLink
                      href={`/roles/${role.id}`}
                      className="inline-flex items-center gap-1.5 text-primary-600 transition-colors hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <Pencil className="h-4 w-4" />
                      {t('roles.editPermissions')}
                    </LocaleLink>
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
