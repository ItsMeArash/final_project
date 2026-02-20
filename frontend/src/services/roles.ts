import api from './api'

export interface Role {
  id: string
  name: string
  description: string
  created_at: string
}

export interface Permission {
  id: string
  name: string
  description: string
  created_at: string
}

export const rolesService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles')
    return response.data
  },

  getRolePermissions: async (roleId: string): Promise<{
    role: Role
    permissions: Permission[]
  }> => {
    const response = await api.get(`/roles/${roleId}/permissions`)
    return response.data
  },

  assignPermissions: async (
    roleId: string,
    permissionIds: string[]
  ): Promise<{
    message: string
    role: Role
    permissions: Permission[]
  }> => {
    const response = await api.post(`/roles/${roleId}/permissions`, {
      permission_ids: permissionIds,
    })
    return response.data
  },
}

export const permissionsService = {
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions')
    return response.data
  },
}
