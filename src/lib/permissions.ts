export type Role = 'super_admin' | 'admin' | 'editor' | 'member'

const matrix: Record<string, Role[]> = {
  'posts:create': ['super_admin', 'admin', 'editor'],
  'posts:edit_any': ['super_admin', 'admin'],
  'posts:delete': ['super_admin', 'admin'],
  'posts:publish': ['super_admin', 'admin', 'editor'],
  'members:manage': ['super_admin', 'admin'],
  'leadership:manage': ['super_admin', 'admin'],
  'events:manage': ['super_admin', 'admin', 'editor'],
  'gallery:manage': ['super_admin', 'admin', 'editor'],
  'publications:manage': ['super_admin', 'admin'],
  'contact:view': ['super_admin', 'admin'],
  'settings:manage': ['super_admin'],
}

export const can = (role: Role, action: string): boolean => {
  return matrix[action]?.includes(role) ?? false
}
