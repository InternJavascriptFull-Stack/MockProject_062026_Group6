import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/role";

// Helper components for cells
const CellBadge = ({ 
  data, 
  isEditing,
  onToggle 
}: { 
  data: { type: string } | null, 
  isEditing: boolean,
  onToggle: () => void 
}) => {
  if (isEditing) {
    const cycleState = () => {
      onToggle();
    };
    return (
      <div 
        onClick={cycleState}
        className="cursor-pointer inline-flex items-center justify-center p-1 border rounded-md hover:bg-slate-50 min-w-[60px]"
      >
        {!data ? (
          <span className="text-slate-300 font-bold">—</span>
        ) : data.type === "Full" ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-400">Full</Badge>
        ) : (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">View</Badge>
        )}
      </div>
    );
  }

  if (!data) return <span className="text-slate-300 font-bold">—</span>;
  if (data.type === "Full") {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-400">Full</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-700 border-blue-300">View</Badge>;
};

export default function RoleMatrix() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [localMatrix, setLocalMatrix] = useState<Record<string, Record<string, 'Full' | 'View' | null>>>({});

  // Queries
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles()
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.getPermissions()
  });

  // Fetch role permissions for all roles
  const { data: allRolePerms = {}, isLoading: isLoadingPerms } = useQuery({
    queryKey: ['rolePermissions', roles.map((r: any) => r.id).join(',')],
    queryFn: async () => {
      const result: Record<string, string[]> = {};
      for (const role of roles) {
        try {
          const perms = await roleService.getRolePermissions(role.id.toString());
          result[role.id.toString()] = perms;
        } catch (e) {
          result[role.id.toString()] = [];
        }
      }
      return result;
    },
    enabled: roles.length > 0
  });

  // Extract unique modules (prefixes before _VIEW or _MANAGE)
  const modules = useMemo(() => {
    const mods = new Set<string>();
    permissions.forEach((p: any) => {
      const prefix = p.actionCode.split('_')[0];
      if (prefix) mods.add(prefix);
    });
    return Array.from(mods).sort();
  }, [permissions]);

  // Sync server state to local state for editing
  useEffect(() => {
    if (!isEditing && roles.length > 0 && Object.keys(allRolePerms).length > 0) {
      const newLocal: Record<string, Record<string, 'Full' | 'View' | null>> = {};
      
      roles.forEach((role: any) => {
        newLocal[role.id.toString()] = {};
        const rolePerms = allRolePerms[role.id.toString()] || [];
        
        modules.forEach(mod => {
          const hasManage = rolePerms.includes(`${mod}_MANAGE`);
          const hasView = rolePerms.includes(`${mod}_VIEW`);
          
          if (hasManage) newLocal[role.id.toString()][mod] = 'Full';
          else if (hasView) newLocal[role.id.toString()][mod] = 'View';
          else newLocal[role.id.toString()][mod] = null;
        });
      });
      setLocalMatrix(newLocal);
    }
  }, [allRolePerms, roles, modules, isEditing]);

  const mutation = useMutation({
    mutationFn: async (updatedMatrix: Record<string, Record<string, 'Full' | 'View' | null>>) => {
      const promises = roles.map((role: any) => {
        const roleId = role.id.toString();
        const roleState = updatedMatrix[roleId];
        const newPermissions: string[] = [];
        
        modules.forEach(mod => {
          if (roleState[mod] === 'Full') {
            newPermissions.push(`${mod}_VIEW`);
            newPermissions.push(`${mod}_MANAGE`);
          } else if (roleState[mod] === 'View') {
            newPermissions.push(`${mod}_VIEW`);
          }
        });
        
        return roleService.updateRolePermissions(roleId, newPermissions);
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
      setIsEditing(false);
    }
  });

  const handleToggle = (roleId: string, mod: string) => {
    setLocalMatrix(prev => {
      const current = prev[roleId][mod];
      let next: 'Full' | 'View' | null = null;
      
      if (current === null) next = 'View';
      else if (current === 'View') next = 'Full';
      else next = null;
      
      return {
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [mod]: next
        }
      };
    });
  };

  const handleSave = () => {
    mutation.mutate(localMatrix);
  };

  if (isLoadingRoles || isLoadingPerms) {
    return <div className="p-8 text-center">Loading matrix...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">
            <Link to="/admin/roles" className="hover:text-slate-700">
              Admin
            </Link>{" "}
            &gt; <span className="text-slate-900">Roles</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
            Role &amp; Permission Matrix
          </h1>
          <p className="text-sm text-slate-500">
            Defines what each role can see and do across NHMS
          </p>
        </div>
        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Permissions"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Matrix</Button>
          )}
        </div>
      </div>

      {/* Role Directory Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Role Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role: any) => (
            <Card key={role.id} className="shadow-sm border-slate-200">
              <CardContent className="p-5">
                <div className="flex flex-col items-start gap-3 mb-3">
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {role.roleName}
                  </h3>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100">
                    Internal
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {role.description || "No description provided."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Permission Matrix Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Permission Matrix
        </h2>
        <div className="flex items-center gap-4 text-sm mb-4">
          <span className="font-medium text-slate-700">Legend:</span>
          <div className="flex items-center gap-1">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-400">
              Full
            </Badge>
            <span className="text-slate-600 ml-1">= create/edit</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
              View
            </Badge>
            <span className="text-slate-600 ml-1">= read-only</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-slate-400 font-bold">—</span>
            <span className="text-slate-600 ml-1">= hidden / no access</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-slate-900 whitespace-nowrap min-w-[200px]">
                  Module / Screen
                </th>
                {roles.map((role: any) => (
                  <th key={role.id} className="px-4 py-4 whitespace-nowrap min-w-[120px]">
                    {role.roleName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((mod) => (
                <tr key={mod} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-left text-slate-700 font-medium whitespace-nowrap">
                    {mod} Configuration
                  </td>
                  {roles.map((role: any) => {
                    const roleId = role.id.toString();
                    const state = localMatrix[roleId]?.[mod];
                    const data = state ? { type: state } : null;
                    
                    return (
                      <td key={roleId} className="px-4 py-3 align-middle">
                        <CellBadge 
                          data={data} 
                          isEditing={isEditing} 
                          onToggle={() => handleToggle(roleId, mod)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {modules.length === 0 && (
                <tr>
                  <td colSpan={roles.length + 1} className="p-4 text-slate-500 text-center">
                    No permissions found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
