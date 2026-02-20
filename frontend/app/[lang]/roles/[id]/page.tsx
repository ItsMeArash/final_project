'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import {
  rolesService,
  permissionsService,
  type Permission,
} from '@/services/roles'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { LocaleLink } from '@/components/LocaleLink'
import { ArrowLeft } from 'lucide-react'

const GROUP_PREFIXES: Record<string, string> = {
  USER_: 'userManagement',
  ROLE_: 'roleManagement',
  ANALYTICS_: 'analytics',
  CHAT_: 'chat',
}

function getGroupKey(perm: Permission): string {
  for (const [prefix, key] of Object.entries(GROUP_PREFIXES)) {
    if (perm.name.startsWith(prefix)) return key
  }
  return 'other'
}

export default function RoleDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { t } = useDictionary()
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: roleData, isLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesService.getRolePermissions(id),
  })

  const { data: allPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsService.getPermissions,
  })

  useEffect(() => {
    if (roleData?.permissions) {
      setSelectedIds(new Set(roleData.permissions.map((p) => p.id)))
    }
  }, [roleData?.permissions])

  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return []
    const groups: Record<string, Permission[]> = {}
    for (const p of allPermissions) {
      const key = getGroupKey(p)
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    }
    const order = ['userManagement', 'roleManagement', 'analytics', 'chat', 'other']
    return order
      .filter((k) => groups[k]?.length)
      .map((k) => ({ key: k, permissions: groups[k]! }))
  }, [allPermissions])

  const assignMutation = useMutation({
    mutationFn: (permissionIds: string[]) =>
      rolesService.assignPermissions(id, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', id] })
    },
  })

  const handleToggle = (permId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })
  }

  const handleSave = () => {
    assignMutation.mutate(Array.from(selectedIds))
  }

  if (isLoading || !roleData) {
    return (
      <DashboardLayout requiredPermission="ROLE_MANAGE">
        <PageSpinner message={t('roles.loadingRole')} fullScreen={false} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredPermission="ROLE_MANAGE">
      <div>
        <div className="mb-6 flex items-center gap-4">
          <LocaleLink
            href="/roles"
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('roles.backToRoles')}
          </LocaleLink>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {roleData.role.name}
        </h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          {roleData.role.description || t('common.na')}
        </p>

        <div className="max-w-2xl space-y-6">
          {groupedPermissions.map(({ key, permissions }) => (
            <fieldset key={key} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <legend className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t(`roles.${key}`)}
              </legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(perm.id)}
                      onChange={() => handleToggle(perm.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{perm.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {assignMutation.isSuccess && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">
            {t('roles.permissionsSaved')}
          </p>
        )}
        {assignMutation.isError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{t('roles.errorSaving')}</p>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={assignMutation.isPending}
            className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {assignMutation.isPending ? t('loading.default') : t('roles.savePermissions')}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
