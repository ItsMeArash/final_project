import { useAuthStore } from '@/stores/authStore'

export const hasPermission = (permission: string): boolean => {
  return useAuthStore.getState().hasPermission(permission)
}

export const usePermissions = () => {
  const { hasPermission: checkPermission, permissions } = useAuthStore()
  return {
    hasPermission: checkPermission,
    permissions,
  }
}
