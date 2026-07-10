import { session } from '../utils/session';

const BASE_URL = '/api';

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface Role {
  id: string;
  roleName: string;
  description: string;
}

export interface Permission {
  id: string;
  actionCode: string;
}

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const res = await fetch(`${BASE_URL}/roles`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch roles');
    return res.json();
  },

  async getPermissions(): Promise<Permission[]> {
    const res = await fetch(`${BASE_URL}/permissions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return res.json();
  },

  async getRolePermissions(roleId: string): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/roles/${roleId}/permissions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch role permissions');
    return res.json();
  },

  async updateRolePermissions(roleId: string, permissions: string[]) {
    const res = await fetch(`${BASE_URL}/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ permissions }),
    });
    if (!res.ok) throw new Error('Failed to update role permissions');
    return res.json();
  }
};
