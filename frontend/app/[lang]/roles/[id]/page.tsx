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
        <div className="flex items-center gap-4 mb-6">
          <LocaleLink
            href="/roles"
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('roles.backToRoles')}
          </LocaleLink>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {roleData.role.name}
        </h1>
        <p className="text-gray-500 mb-6">
          {roleData.role.description || t('common.na')}
        </p>

        <div className="space-y-6 max-w-2xl">
          {groupedPermissions.map(({ key, permissions }) => (
            <fieldset key={key} className="border border-gray-200 rounded-lg p-4">
              <legend className="text-sm font-medium text-gray-700 px-2">
                {t(`roles.${key}`)}
              </legend>
              <div className="flex flex-wrap gap-4 mt-2">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(perm.id)}
                      onChange={() => handleToggle(perm.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{perm.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {assignMutation.isSuccess && (
          <p className="mt-4 text-green-600 text-sm">
            {t('roles.permissionsSaved')}
          </p>
        )}
        {assignMutation.isError && (
          <p className="mt-4 text-red-600 text-sm">{t('roles.errorSaving')}</p>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={assignMutation.isPending}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {assignMutation.isPending ? t('loading.default') : t('roles.savePermissions')}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
