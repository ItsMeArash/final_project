'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { useDictionary } from '@/contexts/DictionaryContext'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { UserForm } from '@/components/form/UserForm'
import { useAuthStore } from '@/stores/authStore'

export default function EditUserPage() {
  const params = useParams()
  const id = params?.id as string
  const lang = params?.lang as string
  const { t } = useDictionary()
  const router = useRouter()
  const { hasPermission } = useAuthStore()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getUser(id),
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getRoles,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof usersService.updateUser>[1]) =>
      usersService.updateUser(id, data),
    onSuccess: () => {
      router.push(`/${lang}/users`)
    },
  })

  const handleSubmit = (data: Parameters<typeof usersService.updateUser>[1]) => {
    const updateData: Record<string, unknown> = {
      full_name: data.full_name,
      username: data.username,
      role_id: data.role_id,
      is_active: data.is_active,
    }
    if (data.password && data.password.trim()) {
      updateData.password = data.password
    }
    updateMutation.mutate(updateData as Parameters<typeof usersService.updateUser>[1])
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
      <div className="-m-4 flex min-h-[calc(100vh-4rem)] flex-col p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('users.editUser')}
        </h1>

        <div className="flex-1">
          <UserForm
            mode="edit"
            defaultValues={{
              full_name: user?.full_name ?? '',
              username: user?.username ?? '',
              password: '',
              role_id: user?.role_id ?? '',
              is_active: user?.is_active ?? true,
            }}
            roles={roles}
            hasRolePermission={!!hasPermission('ROLE_MANAGE')}
            onSubmit={handleSubmit}
            isPending={updateMutation.isPending}
            submitLabel={t('users.updateUser')}
            pendingLabel={t('users.updating')}
            errorMessage={t('users.errorUpdating')}
            hasError={updateMutation.isError}
            onCancel={() => router.back()}
            title={t('users.editUser')}
            subtitle={t('users.formSubtitleEdit')}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
