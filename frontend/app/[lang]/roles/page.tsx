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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('roles.title')}</h1>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roles.name')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roles.description')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roles.permissions')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles?.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-start">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-start">
                    {role.description || t('common.na')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-start">
                    -
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-start">
                    <LocaleLink
                      href={`/roles/${role.id}`}
                      className="inline-flex items-center gap-1.5 text-primary-600 transition-colors hover:text-primary-900"
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
