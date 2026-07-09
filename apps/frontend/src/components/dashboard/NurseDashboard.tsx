import * as React from "react";
import {
  ClipboardList,
  Layers,
  Edit3,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { useRouter } from "../../lib/router";

interface AssignedResident {
  id: string;
  name: string;
  room: string;
  detail: string;
  status: "Overdue" | "Review Due" | "Draft" | "Pending Review" | "On track";
}

interface OpenIncident {
  id: string;
  type: string;
  residentName: string;
  room: string;
  reportedAt: string;
  status: string;
  severity: "High" | "Medium";
}

const INITIAL_RESIDENTS: AssignedResident[] = [
  {
    id: "1",
    name: "Susan Wright",
    room: "114B",
    detail: "Assessment due 2026-07-05 (BR-02: 14-day)",
    status: "Overdue",
  },
  {
    id: "2",
    name: "James Porter",
    room: "210B",
    detail: "Reassessment due 2026-07-03 (BR-03: 90-day)",
    status: "Review Due",
  },
  {
    id: "3",
    name: "Mary Coleman",
    room: "118A",
    detail: "Care plan Draft - not yet submitted",
    status: "Draft",
  },
  {
    id: "4",
    name: "Elena Ramos",
    room: "106A",
    detail: "LOC classification awaiting confirm",
    status: "Pending Review",
  },
  {
    id: "5",
    name: "Thomas Baker",
    room: "220C",
    detail: "Care plan Active - on track",
    status: "On track",
  },
];

const INITIAL_INCIDENTS: OpenIncident[] = [
  {
    id: "1",
    type: "Fall",
    residentName: "Susan Wright",
    room: "114B",
    reportedAt: "Reported 2026-07-02 09:14 · Investigating",
    status: "Investigating",
    severity: "High",
  },
  {
    id: "2",
    type: "Skin tear",
    residentName: "James Porter",
    room: "210B",
    reportedAt: "Reported 2026-07-01 16:40 · Open",
    status: "Open",
    severity: "Medium",
  },
];

export function NurseDashboard() {
  const { navigate } = useRouter();
  const [residents, setResidents] =
    React.useState<AssignedResident[]>(INITIAL_RESIDENTS);
  const [incidents] = React.useState<OpenIncident[]>(INITIAL_INCIDENTS);

  // Toggle resident status for interactivity
  const handleToggleResidentStatus = (id: string) => {
    setResidents((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const transitions: Record<
            AssignedResident["status"],
            AssignedResident["status"]
          > = {
            Overdue: "Review Due",
            "Review Due": "Draft",
            Draft: "Pending Review",
            "Pending Review": "On track",
            "On track": "Overdue",
          };
          return { ...r, status: transitions[r.status] };
        }
        return r;
      }),
    );
  };

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      {/* Title Header */}
      <div>
        <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
          Dashboard
        </div>
        <h1 className="font-heading text-brand-primary-dark mt-0.5 text-3xl font-extrabold tracking-tight">
          Good morning, Anna
        </h1>
        <p className="text-brand-gray-muted mt-1 text-sm font-medium">
          12 residents assigned to you — Day shift
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {/* Assessments Due */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Assessments Due
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                3
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LOC Awaiting Confirm */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                LOC Awaiting Confirm
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                2
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Care Plans To Submit */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Care Plans To Submit
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                4
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reassessments Due */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Reassessments Due
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                2
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Column: Assigned Residents - Due Soon */}
        <Card className="h-full">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h2 className="font-heading text-brand-primary-dark text-lg font-bold">
                Assigned Residents — Due Soon
              </h2>
              <button
                onClick={() => {
                  navigate("/residents");
                }}
                className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View all <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <tbody className="divide-y divide-slate-100 text-sm">
                  {residents.map((resident) => (
                    <tr
                      key={resident.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="py-4 pr-3">
                        <div className="text-brand-primary-dark font-bold">
                          {resident.name} ·{" "}
                          <span className="font-semibold text-slate-400">
                            {resident.room}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-slate-400">
                          {resident.detail}
                        </div>
                      </td>
                      <td className="py-4 pl-3 text-right">
                        <button
                          onClick={() => {
                            handleToggleResidentStatus(resident.id);
                          }}
                          className="cursor-pointer transition-transform focus:outline-none active:scale-95"
                          title="Click to toggle status"
                        >
                          <Badge
                            variant={
                              resident.status === "Overdue"
                                ? "alert"
                                : resident.status === "On track"
                                  ? "priority"
                                  : "warning"
                            }
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              resident.status === "Overdue"
                                ? "border-transparent bg-red-100 text-red-700 hover:bg-red-200"
                                : resident.status === "Review Due"
                                  ? "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  : resident.status === "Draft"
                                    ? "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    : resident.status === "Pending Review"
                                      ? "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200"
                                      : "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            }`}
                          >
                            {resident.status}
                          </Badge>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Open Incidents */}
        <Card className="flex h-full flex-col justify-between">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h2 className="font-heading text-brand-primary-dark text-lg font-bold">
                Open Incidents
              </h2>
              <button
                onClick={() => {
                  navigate("/incident-risk");
                }}
                className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View all <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="text-brand-primary-dark font-bold">
                      {incident.type} — {incident.residentName} ·{" "}
                      <span className="font-semibold text-slate-400">
                        {incident.room}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-400">
                      {incident.reportedAt}
                    </div>
                  </div>
                  <Badge
                    variant={incident.severity === "High" ? "alert" : "warning"}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      incident.severity === "High"
                        ? "border-transparent bg-red-100 text-red-700"
                        : "border-transparent bg-amber-100 text-amber-700"
                    }`}
                  >
                    {incident.severity}
                  </Badge>
                </div>
              ))}

              {/* Meds Due Today (soon badge) */}
              <div className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 opacity-80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">
                      Meds Due Today
                    </span>
                    <Badge className="rounded-full border-transparent bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                      soon
                    </Badge>
                  </div>
                  <div className="text-xs font-medium text-slate-400">
                    Available when M3 eMAR ships.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
