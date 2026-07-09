import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, CheckSquare, Clock, XSquare, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/authUi/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/authUi/select';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user';

export default function UserList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Simple debounce for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, 10, debouncedSearch],
    queryFn: () => userService.getUsers(page, 10, debouncedSearch),
  });

  const users = data?.data || [];
  const meta = data?.meta || { total: 0 };

  // Filter local users by role/status for now since the API only searches by string.
  // In a real app, roleId/status would be passed to API.
  const filteredUsers = users.filter((user: any) => {
    let matchRole = true;
    let matchStatus = true;
    if (roleFilter !== 'All') {
      matchRole = user.role?.roleName === roleFilter;
    }
    if (statusFilter !== 'All') {
      // API returns ACTIVE/INACTIVE/LOCKED, filter maps slightly differently or directly
      // Mapping from UI filter to API status:
      // Active -> ACTIVE
      // Suspended / Deactivated -> INACTIVE / LOCKED
      // Invited -> N/A (We'll assume ACTIVE for now, or match exactly)
      if (statusFilter === 'Active') matchStatus = user.status === 'ACTIVE';
      else if (statusFilter === 'Suspended') matchStatus = user.status === 'INACTIVE';
      else if (statusFilter === 'Deactivated') matchStatus = user.status === 'LOCKED';
      else matchStatus = user.status === statusFilter.toUpperCase();
    }
    return matchRole && matchStatus;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="priority">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="alert">Inactive</Badge>;
      case 'LOCKED':
        return <Badge variant="muted">Locked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderMFABadge = (mfa: string) => {
    if (mfa === 'Enabled') {
      return <Badge variant="priority">Enabled</Badge>;
    }
    return <Badge variant="warning">Not-set</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <span className="hover:text-slate-700 cursor-pointer">Admin</span> &gt; <span className="text-slate-900">Users</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">User List</h1>
        <p className="text-sm text-slate-500 mt-1">
          All user accounts — search by email or phone (§5G.2 identity field contract)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center">
            <div className="flex-shrink-0 bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{meta.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center">
            <div className="flex-shrink-0 bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <CheckSquare className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Active</p>
              <p className="text-2xl font-bold text-slate-900">
                {users.filter((u: any) => u.status === 'ACTIVE').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center">
            <div className="flex-shrink-0 bg-yellow-50 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Invited</p>
              <p className="text-2xl font-bold text-slate-900">
                0
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center">
            <div className="flex-shrink-0 bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <XSquare className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Suspended / Deactivated</p>
              <p className="text-2xl font-bold text-slate-900">
                {users.filter((u: any) => u.status === 'INACTIVE' || u.status === 'LOCKED').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-2 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by email or phone"
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select defaultValue="All" onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full bg-white">
                <span className="truncate">Role: {roleFilter}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="System Admin">System Admin</SelectItem>
                <SelectItem value="Facility Manager">Facility Manager</SelectItem>
                <SelectItem value="Nurse">Nurse</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Accountant">Accountant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-52">
            <Select defaultValue="All" onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-white">
                <span className="truncate">Status: {statusFilter}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
          onClick={() => navigate('/admin/users/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="text-xs text-slate-500 mb-2">
        Sorted by account creation, newest first (§1.6)
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">2FA</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-red-500">
                  Error loading users
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3 text-slate-500">{user.phoneNumber || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{user.role?.roleName || '—'}</td>
                  <td className="px-4 py-3">{renderStatusBadge(user.status)}</td>
                  <td className="px-4 py-3">{renderMFABadge('Not-set')}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Deactivate / Reactivate actions available from row menu (AD-04, soft-delete — history preserved).
      </div>
    </div>
  );
}
