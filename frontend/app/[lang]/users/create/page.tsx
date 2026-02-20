'use client'

import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useDictionary } from '@/contexts/DictionaryContext'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { UserForm } from '@/components/form/UserForm'
import { useAuthStore } from '@/stores/authStore'

export default function CreateUserPage() {
  const { t } = useDictionary()
  const router = useRouter()
  const params = useParams()
  const { hasPermission } = useAuthStore()
  const lang = params?.lang as string

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

  const handleSubmit = (data: Parameters<typeof usersService.createUser>[0]) => {
    createMutation.mutate(data)
  }

  return (
    <DashboardLayout requiredPermission="USER_CREATE">
      <div className="-m-8 flex min-h-[calc(100vh-4rem)] flex-col p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          {t('users.createUser')}
        </h1>

        <div className="flex-1">
          <UserForm
            mode="create"
            defaultValues={{
              full_name: '',
              username: '',
              password: '',
              role_id: '',
              is_active: true,
            }}
            roles={roles}
            hasRolePermission={!!hasPermission('ROLE_MANAGE')}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            submitLabel={t('users.createUser')}
            pendingLabel={t('users.creating')}
            errorMessage={t('users.errorCreating')}
            hasError={createMutation.isError}
            onCancel={() => router.back()}
            title={t('users.createUser')}
            subtitle={t('users.formSubtitleCreate')}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
