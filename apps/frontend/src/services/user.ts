import { session } from '../utils/session';

const BASE_URL = '/api/users';

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface UserDTO {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  roleId: string | number;
  role?: { id: string | number; roleName: string };
  createdAt: string;
}

export const userService = {
  async getUsers(page = 1, limit = 10, search = '') {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search });
    const res = await fetch(`${BASE_URL}?${query.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getUserById(id: string) {
    const res = await fetch(`${BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async createUser(data: Omit<UserDTO, 'id' | 'employeeCode' | 'createdAt' | 'role'>) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  async updateUser(id: string, data: Partial<Omit<UserDTO, 'id' | 'employeeCode' | 'createdAt' | 'role'>>) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'LOCKED') {
    const res = await fetch(`${BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update user status');
    return res.json();
  }
};
