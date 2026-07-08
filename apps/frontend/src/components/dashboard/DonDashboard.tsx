import * as React from "react";
import {
  Clock,
  ShieldAlert,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface PendingCarePlan {
  id: string;
  residentName: string;
  room: string;
  submittedBy: string;
  role: string;
  submittedDate: string;
  locTier: string;
  waitingTime: string;
}

const INITIAL_CARE_PLANS: PendingCarePlan[] = [
  {
    id: "1",
    residentName: "Mary Coleman",
    room: "118A",
    submittedBy: "Anna Lee",
    role: "RN",
    submittedDate: "2026-07-02",
    locTier: "Tier 2",
    waitingTime: "18h",
  },
  {
    id: "2",
    residentName: "Elena Ramos",
    room: "106A",
    submittedBy: "Anna Lee",
    role: "RN",
    submittedDate: "2026-07-01",
    locTier: "Tier 1",
    waitingTime: "1d 6h",
  },
  {
    id: "3",
    residentName: "Thomas Baker",
    room: "220C",
    submittedBy: "Priya Nair",
    role: "LPN",
    submittedDate: "2026-07-03",
    locTier: "Tier 3",
    waitingTime: "2h",
  },
  {
    id: "4",
    residentName: "Grace Kim",
    room: "112B",
    submittedBy: "Anna Lee",
    role: "RN",
    submittedDate: "2026-06-30",
    locTier: "Tier 4",
    waitingTime: "2d 1h",
  },
];

export function DonDashboard() {
  const [carePlans, setCarePlans] =
    React.useState<PendingCarePlan[]>(INITIAL_CARE_PLANS);

  const handleReview = (id: string, name: string) => {
    alert(`Reviewing Care Plan for ${name}`);
    setCarePlans((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      {/* Title Header */}
      <div>
        <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
          Dashboard
        </div>
        <h1 className="font-heading text-brand-primary-dark mt-0.5 text-3xl font-extrabold tracking-tight">
          Good morning, Denise
        </h1>
        <p className="text-brand-gray-muted mt-1 text-sm font-medium">
          Facility overview — Riverside Wing
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {/* Pending Review */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Pending Review
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                {carePlans.length + 2}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Incidents */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Open Incidents
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                3
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reassessments Due */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Reassessments Due
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                4
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Compliance Alerts
              </div>
              <div className="font-heading text-brand-primary-dark mt-0.5 text-2xl font-extrabold">
                2
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staffing Ratio Warning Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-red-800">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
        <span className="text-sm font-semibold tracking-wide">
          Staffing ratio below target on Night shift (Wing B): 1 : 9 (target 1 :
          8)
        </span>
      </div>

      {/* Care Plans Pending Review */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h2 className="font-heading text-brand-primary-dark text-lg font-bold">
              Care Plans Pending Review
            </h2>
            <button
              onClick={() => {
                alert("Viewing all pending reviews...");
              }}
              className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View all <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b text-xs font-bold tracking-wider text-slate-400 uppercase">
                  <th className="pr-4 pb-3">Resident</th>
                  <th className="px-4 pb-3">Submitted By</th>
                  <th className="px-4 pb-3">Submitted</th>
                  <th className="px-4 pb-3">LOC Tier</th>
                  <th className="px-4 pb-3">Waiting</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {carePlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="text-brand-primary-dark py-4 pr-4 font-bold">
                      {plan.residentName} ·{" "}
                      <span className="font-semibold text-slate-400">
                        {plan.room}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {plan.submittedBy},{" "}
                      <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                        {plan.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-500">
                      {plan.submittedDate}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="default"
                        className="bg-brand-primary-dark rounded-md border-transparent px-2 py-0.5 text-xs font-semibold text-white"
                      >
                        {plan.locTier}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-600">
                      {plan.waitingTime}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => {
                          handleReview(plan.id, plan.residentName);
                        }}
                        className="cursor-pointer text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {carePlans.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center font-medium text-slate-400"
                    >
                      No care plans pending review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Census & LOC Mix + Billing Snapshot */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Column: Census + LOC Mix */}
        <Card className="flex h-full flex-col justify-between">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-heading text-brand-primary-dark text-lg font-bold">
                  Census + LOC Mix
                </h2>
              </div>
              <button
                onClick={() => {
                  alert("Redirecting to Residents list...");
                }}
                className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View residents <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Current Census
                </div>
                <div className="font-heading text-brand-primary-dark mt-1 text-2xl font-extrabold">
                  42 / 48 beds
                </div>
                <div className="mt-0.5 text-xs font-bold text-emerald-600">
                  87.5% occupancy
                </div>
              </div>

              {/* Progress Bars for LOC Tiers */}
              <div className="space-y-3 pt-2">
                {/* Tier 1 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Tier 1 (0-8)</span>
                    <span className="text-brand-primary-dark">9</span>
                  </div>
                  <Progress
                    value={(9 / 16) * 100}
                    barClassName="bg-emerald-500"
                  />
                </div>

                {/* Tier 2 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Tier 2 (9-16)</span>
                    <span className="text-brand-primary-dark">14</span>
                  </div>
                  <Progress
                    value={(14 / 16) * 100}
                    barClassName="bg-blue-500"
                  />
                </div>

                {/* Tier 3 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Tier 3 (17-24)</span>
                    <span className="text-brand-primary-dark">12</span>
                  </div>
                  <Progress
                    value={(12 / 16) * 100}
                    barClassName="bg-amber-500"
                  />
                </div>

                {/* Tier 4 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Tier 4 (25-32)</span>
                    <span className="text-brand-primary-dark">7</span>
                  </div>
                  <Progress value={(7 / 16) * 100} barClassName="bg-red-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Billing Snapshot */}
        <Card className="flex h-full flex-col justify-between">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h2 className="font-heading text-brand-primary-dark text-lg font-bold">
                Billing Snapshot
              </h2>
              <Badge className="rounded-full border-transparent bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 lowercase">
                read-only
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500">
                    Est. daily revenue
                  </span>
                  <span className="text-brand-primary-dark font-extrabold">
                    $18,942.00
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500">
                    Est. monthly revenue
                  </span>
                  <span className="text-brand-primary-dark font-extrabold">
                    $575,540.00
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500">
                    Pending authorizations
                  </span>
                  <span className="text-brand-primary-dark font-extrabold">
                    3 residents
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500">
                    Medicare 100-day cap alerts
                  </span>
                  <span className="text-brand-primary-dark font-extrabold text-red-600">
                    1 resident
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400 italic">
                Simulated — not a billing transaction.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
