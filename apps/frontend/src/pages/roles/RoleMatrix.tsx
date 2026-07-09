import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock Data
const roleDirectory = [
  {
    title: "Admission Staff",
    type: "Internal",
    desc: "Manages resident intake: pre-admission screening, admission forms, and profile creation. Full access to M1 registration.",
  },
  {
    title: "Nurse (RN/LPN)",
    type: "Internal",
    desc: "Performs clinical assessments, drafts and manages care plans, records bedside vitals. Cannot approve care plans (DON).",
  },
  {
    title: "CNA",
    type: "Internal",
    desc: "Executes daily assigned tasks and records bedside vitals for assigned residents. Mobile-first view (NFR-04).",
  },
  {
    title: "DON (Director of Nursing)",
    type: "Internal",
    desc: "Reviews/approves care plans, oversees incidents with SLA tracking, monitors staffing ratio + census/billing snapshot.",
  },
  {
    title: "System Admin",
    type: "Internal",
    desc: "Configures facility settings, rates, staffing thresholds, user accounts, and equipment inventory. No clinical access.",
  },
  {
    title: "Physician",
    type: "External IDT",
    desc: "Limited-access external signer. Reviews care plans for residents under their care; e-signs M2-US-10 only.",
  },
  {
    title: "Dietary",
    type: "External IDT",
    desc: "Limited-access external signer. Reviews nutrition-related care plan sections; e-signs M2-US-10 only.",
  },
];

const matrixData = [
  {
    screen: "AD-01...16 Admin Config",
    admission: null,
    nurse: null,
    cna: null,
    don: null,
    sysadmin: { type: "Full", sub: "" },
  },
  {
    screen: "M1-US-01 Resident List",
    admission: { type: "Full", sub: "" },
    nurse: { type: "View", sub: "" },
    cna: { type: "View", sub: "assigned" },
    don: { type: "View", sub: "" },
    sysadmin: null,
  },
  {
    screen: "M1-US-02 Profile Detail",
    admission: { type: "Full", sub: "Insurance/SSN" },
    nurse: { type: "View", sub: "+clinical" },
    cna: { type: "View", sub: "care subset" },
    don: { type: "View", sub: "" },
    sysadmin: null,
  },
  {
    screen: "M1-US-06 Initial Assessment",
    admission: null,
    nurse: { type: "Full", sub: "" },
    cna: null,
    don: { type: "View", sub: "" },
    sysadmin: null,
  },
  {
    screen: "M2-US-01 Care Plan List",
    admission: null,
    nurse: { type: "Full", sub: "" },
    cna: null,
    don: { type: "Full", sub: "" },
    sysadmin: null,
  },
  {
    screen: "M2-US-04 DON Review (Approve/Reject)",
    admission: null,
    nurse: { type: "View", sub: "status only" },
    cna: null,
    don: { type: "Full", sub: "DON only" },
    sysadmin: null,
  },
  {
    screen: "M2-US-06 Bedside Vitals",
    admission: null,
    nurse: { type: "Full", sub: "vitals" },
    cna: { type: "Full", sub: "" },
    don: { type: "View", sub: "" },
    sysadmin: null,
  },
  {
    screen: "M7-US-01 Report Incident",
    admission: null,
    nurse: { type: "Full", sub: "" },
    cna: { type: "Full", sub: "" },
    don: { type: "Full", sub: "" },
    sysadmin: null,
  },
  {
    screen: "M7-US-04 Incident List",
    admission: null,
    nurse: { type: "View", sub: "" },
    cna: null,
    don: { type: "Full", sub: "oversight" },
    sysadmin: null,
  },
  {
    screen: "M2-US-10 IDT Acknowledgment",
    admission: null,
    nurse: { type: "View", sub: "" },
    cna: null,
    don: { type: "View", sub: "" },
    sysadmin: null,
  },
];

// Helper components for cells
const CellBadge = ({ data }: { data: { type: string; sub?: string } | null }) => {
  if (!data) return <span className="text-slate-300">—</span>;

  let baseClass =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  if (data.type === "Full") {
    baseClass += " bg-emerald-100 text-emerald-700 border-emerald-400";
  } else if (data.type === "View") {
    baseClass += " bg-blue-100 text-blue-700 border-blue-300";
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className={baseClass}>{data.type}</div>
      {data.sub && (
        <span className="text-[10px] text-slate-500 whitespace-nowrap">
          {data.sub}
        </span>
      )}
    </div>
  );
};

export default function RoleMatrix() {
  return (
    <div className="max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6">
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

      {/* Role Directory Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Role Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleDirectory.map((role, idx) => (
            <Card key={idx} className="shadow-sm border-slate-200">
              <CardContent className="p-5">
                <div className="flex flex-col items-start gap-3 mb-3">
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {role.title}
                  </h3>
                  {role.type === "Internal" ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100">
                      {role.type}
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-100">
                      {role.type}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {role.desc}
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
                <th className="px-4 py-4 text-left font-bold text-slate-900 whitespace-nowrap min-w-[250px]">
                  Screen
                </th>
                <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">
                  Admission
                </th>
                <th className="px-4 py-4 whitespace-nowrap min-w-[140px]">
                  Nurse (RN/LPN)
                </th>
                <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">
                  CNA
                </th>
                <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">
                  DON
                </th>
                <th className="px-4 py-4 whitespace-nowrap min-w-[140px]">
                  System Admin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-4 text-left text-slate-700 font-medium whitespace-nowrap">
                    {row.screen}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <CellBadge data={row.admission} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <CellBadge data={row.nurse} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <CellBadge data={row.cna} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <CellBadge data={row.don} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <CellBadge data={row.sysadmin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-slate-500 max-w-3xl leading-relaxed">
          Physician &amp; Dietary (External IDT) — Full (e-sign) only on M2-US-10
          IDT Acknowledgment; no other screen access (§4A.2). Full matrix (all 19
          screens): see Master Plan §4A.
        </div>
      </div>
    </div>
  );
}
