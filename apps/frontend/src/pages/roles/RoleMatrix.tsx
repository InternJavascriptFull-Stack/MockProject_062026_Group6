import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/role";

// Predefined screen mapping to match the wireframe exactly
const SCREENS = [
  { label: "AD-01...16 Admin Config", mod: "ADMIN_CONFIG" },
  { label: "M1-US-01 Resident List", mod: "RESIDENT_LIST" },
  { label: "M1-US-02 Profile Detail", mod: "PROFILE_DETAIL" },
  { label: "M1-US-06 Initial Assessment", mod: "INITIAL_ASSESSMENT" },
  { label: "M2-US-01 Care Plan List", mod: "CARE_PLAN_LIST" },
  { label: "M2-US-04 DON Review (Approve/Reject)", mod: "DON_REVIEW" },
  { label: "M2-US-06 Bedside Vitals", mod: "BEDSIDE_VITALS" },
  { label: "M7-US-01 Report Incident", mod: "REPORT_INCIDENT" },
  { label: "M7-US-04 Incident List", mod: "INCIDENT_LIST" },
  { label: "M2-US-10 IDT Acknowledgment", mod: "IDT_ACKNOWLEDGMENT" },
];

const SUB_LABELS: Record<string, Record<string, string>> = {
  "M1-US-01 Resident List": { "CNA": "assigned" },
  "M1-US-02 Profile Detail": { "Admission Staff": "Insurance/SSN", "Nurse (RN/LPN)": "+clinical", "CNA": "care subset" },
  "M2-US-04 DON Review (Approve/Reject)": { "Nurse (RN/LPN)": "status only", "DON (Director of Nursing)": "DON only" },
  "M2-US-06 Bedside Vitals": { "Nurse (RN/LPN)": "vitals" },
  "M7-US-04 Incident List": { "DON (Director of Nursing)": "oversight" },
};

const ORDERED_COLUMNS = [
  "Admission Staff",
  "Nurse (RN/LPN)",
  "CNA",
  "DON (Director of Nursing)",
  "System Admin"
];

// Helper components for cells
const CellBadge = ({ 
  data, 
  isEditing,
  onToggle,
  subLabel
}: { 
  data: { type: string } | null, 
  isEditing: boolean,
  onToggle: () => void,
  subLabel?: string
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-1 min-h-[40px]">
      {!data ? (
        <span className="text-slate-300 font-bold">—</span>
      ) : data.type === "Full" ? (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-400 font-semibold rounded-full px-2.5 py-0.5 text-xs">Full</Badge>
      ) : (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-semibold rounded-full px-2.5 py-0.5 text-xs">View</Badge>
      )}
      {subLabel && data && (
        <span className="text-[10px] text-slate-500 whitespace-nowrap leading-none mt-0.5">
          {subLabel}
        </span>
      )}
    </div>
  );

  if (isEditing) {
    return (
      <div 
        onClick={onToggle}
        className="cursor-pointer inline-flex items-center justify-center p-1 border border-transparent hover:border-slate-200 rounded-md hover:bg-slate-50 min-w-[60px]"
      >
        {content}
      </div>
    );
  }

  return content;
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

  // Sort and filter roles to match wireframe
  const roleDirectory = useMemo(() => {
    return [...roles].sort((a: any, b: any) => {
      // Internal first, then IDT
      const typeA = ["Physician", "Dietary"].includes(a.roleName) ? 1 : 0;
      const typeB = ["Physician", "Dietary"].includes(b.roleName) ? 1 : 0;
      return typeA - typeB;
    });
  }, [roles]);

  const columnRoles = useMemo(() => {
    const cols = ORDERED_COLUMNS.map(name => roles.find((r: any) => r.roleName === name)).filter(Boolean);
    return cols;
  }, [roles]);

  // Sync server state to local state for editing
  useEffect(() => {
    if (!isEditing && roles.length > 0 && Object.keys(allRolePerms).length > 0) {
      const newLocal: Record<string, Record<string, 'Full' | 'View' | null>> = {};
      
      roles.forEach((role: any) => {
        newLocal[role.id.toString()] = {};
        const rolePerms = allRolePerms[role.id.toString()] || [];
        
        SCREENS.forEach(screen => {
          const hasManage = rolePerms.includes(`${screen.mod}_MANAGE`);
          const hasView = rolePerms.includes(`${screen.mod}_VIEW`);
          
          if (hasManage) newLocal[role.id.toString()][screen.mod] = 'Full';
          else if (hasView) newLocal[role.id.toString()][screen.mod] = 'View';
          else newLocal[role.id.toString()][screen.mod] = null;
        });
      });
      setLocalMatrix(newLocal);
    }
  }, [allRolePerms, roles, isEditing]);

  const mutation = useMutation({
    mutationFn: async (updatedMatrix: Record<string, Record<string, 'Full' | 'View' | null>>) => {
      const promises = roles.map((role: any) => {
        const roleId = role.id.toString();
        const roleState = updatedMatrix[roleId];
        const newPermissions: string[] = [];
        
        SCREENS.forEach(screen => {
          if (roleState[screen.mod] === 'Full') {
            newPermissions.push(`${screen.mod}_VIEW`);
            newPermissions.push(`${screen.mod}_MANAGE`);
          } else if (roleState[screen.mod] === 'View') {
            newPermissions.push(`${screen.mod}_VIEW`);
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
    <div className="max-w-[1200px] font-sans">
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
            Read-only reference — defines what each role can see and do across NHMS
            (Master Plan §4A)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roleDirectory.map((role: any) => {
            const isExternal = ["Physician", "Dietary"].includes(role.roleName);
            return (
              <Card key={role.id} className="shadow-sm border-slate-200">
                <CardContent className="p-5">
                  <div className="flex flex-col items-start gap-3 mb-3">
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {role.roleName}
                    </h3>
                    {!isExternal ? (
                      <Badge className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-full font-semibold px-3">
                        Internal
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-50 rounded-full font-semibold px-3">
                        External IDT
                      </Badge>
                    )}
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    {role.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            );
          })}
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
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-400 font-semibold rounded-full px-2.5 py-0.5 text-xs">
              Full = create/edit
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-semibold rounded-full px-2.5 py-0.5 text-xs">
              View = read-only
            </Badge>
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
                <th className="px-6 py-4 text-left font-bold text-slate-900 whitespace-nowrap min-w-[250px]">
                  Screen
                </th>
                {columnRoles.map((role: any) => {
                  // Special mapping for headers just to match wireframe exactly
                  let headerText = role.roleName;
                  if (headerText === "Admission Staff") headerText = "Admission";
                  if (headerText === "DON (Director of Nursing)") headerText = "DON";
                  return (
                    <th key={role.id} className="px-2 py-4 font-bold text-slate-900 whitespace-nowrap min-w-[120px]">
                      {headerText}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCREENS.map((screen) => (
                <tr key={screen.mod} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-left text-slate-700 font-medium whitespace-nowrap">
                    {screen.label}
                  </td>
                  {columnRoles.map((role: any) => {
                    const roleId = role.id.toString();
                    const state = localMatrix[roleId]?.[screen.mod];
                    const data = state ? { type: state } : null;
                    const subLabel = SUB_LABELS[screen.label]?.[role.roleName];
                    
                    return (
                      <td key={roleId} className="px-2 py-3 align-middle h-16">
                        <CellBadge 
                          data={data} 
                          isEditing={isEditing} 
                          onToggle={() => handleToggle(roleId, screen.mod)}
                          subLabel={subLabel}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {SCREENS.length === 0 && (
                <tr>
                  <td colSpan={columnRoles.length + 1} className="p-4 text-slate-500 text-center">
                    No permissions found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-[13px] text-slate-500 max-w-3xl leading-relaxed">
          Physician &amp; Dietary (External IDT) — Full (e-sign) only on M2-US-10
          IDT Acknowledgment; no other screen access (§4A.2). Full matrix (all 19
          screens): see Master Plan §4A.
        </div>
      </div>
    </div>
  );
}
