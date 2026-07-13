import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  UserCheck,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { incidentsService } from "@/services/incidents";
import { session } from "@/utils/session";

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = session.getUser();

  const [incident, setIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal overlays
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Form states
  const [lockReason, setLockReason] = useState("");
  const [unlockReason, setUnlockReason] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await incidentsService.getIncidentById(id);
      setIncident(data);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load incident details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleLockChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowLockModal(false);

    try {
      const response = await incidentsService.lockChart(id, lockReason);
      setLockReason("");
      navigate(`/incidents/${id}/lock-confirm`, {
        state: {
          residentName: inc.resident?.fullName,
          lockedAt: response.data?.lockedAt || new Date().toISOString(),
          incidentId: id,
          residentId: inc.resident?.id
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to lock chart");
      setIsLoading(false);
    }
  };

  const handleUnlockChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!unlockReason.trim()) {
      setErrorMsg("Reason is required to unlock chart");
      return;
    }
    if (!passwordConfirm) {
      setErrorMsg("Password confirmation is required");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowUnlockModal(false);

    try {
      await incidentsService.unlockChart(id, unlockReason, passwordConfirm);
      setSuccessMsg("Chart unlocked successfully");
      setUnlockReason("");
      setPasswordConfirm("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to unlock chart");
      setIsLoading(false);
    }
  };

  if (isLoading && !incident) {
    return (
      <div className="flex h-64 items-center justify-center font-sans text-slate-500">
        <Clock className="w-6 h-6 animate-spin mr-2 text-blue-500" />
        <span>Loading incident details...</span>
      </div>
    );
  }

  // Fallback UI or mockup detail data if backend record not found
  const inc = incident || {
    id: id || "INC-2044",
    incidentType: "Fall",
    status: "OPEN",
    description: "Resident found on bathroom floor after slipping. Assessed immediately for injuries.",
    reportedAt: "2026-07-03 09:15",
    resident: {
      id: "res-id",
      fullName: "Robert Hayes",
      isChartLocked: true
    },
    reporter: {
      name: "Anna Lee, RN"
    },
    severity: "High"
  };

  const isLocked = inc.resident?.isChartLocked;
  const isDonOrAdmin =
    currentUser?.roleName === "DON (Director of Nursing)" ||
    currentUser?.roleName === "System Admin";

  return (
    <div className="max-w-6xl mx-auto font-sans relative">
      {/* Breadcrumb & Navigation */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <span className="hover:text-slate-700 cursor-pointer">Incident & Risk</span> &gt;{" "}
          <span className="hover:text-slate-700 cursor-pointer">Incident List</span> &gt;{" "}
          <span className="text-slate-900 font-semibold">#{inc.id}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Incident #{inc.id} — {inc.resident?.fullName}
          </h1>
          <Badge variant="warning">{inc.status}</Badge>
          <Badge variant="alert">{inc.severity} Severity</Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1.5">
          {inc.incidentType} · Room 204B · Reported by {inc.reporter?.name} · {inc.reportedAt}
        </p>
      </div>

      {/* Alert Messaging */}
      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                Report Details (read-only)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-slate-400 font-medium">Location</span>
                  <span className="text-slate-800 font-semibold">Room 204B — bathroom</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-slate-400 font-medium">Witnesses</span>
                  <span className="text-slate-800 font-semibold">Marcus Rivera, CNA</span>
                </div>
                <div className="md:col-span-3">
                  <span className="block text-slate-400 font-medium">Description</span>
                  <p className="text-slate-800 mt-1 leading-relaxed">{inc.description}</p>
                </div>
                <div className="md:col-span-3">
                  <span className="block text-slate-400 font-medium">Immediate Action Taken</span>
                  <p className="text-slate-800 mt-1 leading-relaxed">
                    Assisted resident to upright position, performed initial assessments, vitals checked, and notified DON.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Card */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Attachments (simulated)</h3>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>incident_form_signed.pdf</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Timeline</h3>
            <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6 text-sm">
              {/* Lock Node */}
              {isLocked && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 bg-red-100 border border-red-300 w-5 h-5 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-red-600" />
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Chart locked (BR-07)</strong>
                    <span className="text-xs text-slate-500 font-medium block">
                      System · 2026-07-03 09:22
                    </span>
                  </div>
                </div>
              )}

              {/* Notification Node */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 bg-blue-50 border border-blue-200 w-5 h-5 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-blue-600" />
                </span>
                <div>
                  <strong className="text-slate-900 block">DON notified · SLA countdown started</strong>
                  <span className="text-xs text-slate-500 font-medium block">System · 2026-07-03 09:20</span>
                </div>
              </div>

              {/* Report Node */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0 bg-slate-100 border border-slate-200 w-5 h-5 rounded-full flex items-center justify-center">
                  <UserCheck className="w-3 h-3 text-slate-500" />
                </span>
                <div>
                  <strong className="text-slate-900 block">Incident reported</strong>
                  <span className="text-xs text-slate-500 font-medium block">
                    {inc.reporter?.name} · {inc.reportedAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side summary cards */}
        <div className="flex flex-col gap-6">
          {/* SLA Card */}
          <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
            <span className="text-xs font-semibold text-emerald-600 block uppercase tracking-wider mb-1">
              SLA — Regulatory Reporting
            </span>
            <div className="text-2xl font-bold tracking-tight text-emerald-950 mb-1">14h remaining</div>
            <p className="text-xs text-emerald-700 leading-normal">
              Report by 2026-07-04 09:15
              <br />
              Rule 6 · 24-48h regulatory window
            </p>
          </div>

          {/* Chart Status Card */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-2">
                Chart Status
              </span>
              <div className="flex items-center gap-3">
                {isLocked ? (
                  <>
                    <Badge variant="alert">Locked</Badge>
                    <span className="text-xs text-slate-400 font-semibold">since 09:22</span>
                  </>
                ) : (
                  <>
                    <Badge variant="priority">Active</Badge>
                    <span className="text-xs text-slate-400 font-semibold">Ready for edit</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Actions Card */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-5 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">
                Clinical Actions
              </span>

              <Button
                variant="outline"
                className="w-full text-slate-700 border-slate-200 font-semibold"
                disabled={isLocked}
              >
                Add Progress Note
              </Button>

              <Button
                variant="outline"
                className="w-full text-slate-700 border-slate-200 font-semibold"
                disabled={isLocked}
              >
                Submit External Report
              </Button>

              {isLocked ? (
                isDonOrAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => setShowUnlockModal(true)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold"
                  >
                    <Unlock className="w-4 h-4 mr-1.5" />
                    Unlock Chart
                  </Button>
                )
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowLockModal(true)}
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-bold"
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  Lock Chart
                </Button>
              )}

              <Button variant="primary" className="w-full font-bold" disabled={isLocked}>
                Mark Resolved
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              {isLocked && (
                <span className="text-[10px] text-slate-400 font-medium leading-normal mt-1 block text-center">
                  Unlock chart to enable actions (UC-M7-10).
                </span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lock Chart Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleLockChart}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 text-blue-600 mb-3">
                <Lock className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">Lock Resident Chart</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                After locking, this resident's chart (admissions, profiles, care plans, incidents, medication orders)
                will be read-only until an authorized personnel unlocks it.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Reason for lock</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[80px]"
                  placeholder="e.g. Incident investigation completed"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowLockModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Confirm Lock
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Unlock Chart Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleUnlockChart}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <Unlock className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">Unlock Resident Chart</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 font-semibold">
                Restores edit access to {inc.resident?.fullName}'s chart across M1 / M2 / M3 (LC-06).
              </p>

              {/* Status Note Card */}
              <div className="mb-4 flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <strong className="text-xs text-slate-700 block">Locked since {inc.reportedAt}</strong>
                  <span className="text-[10px] text-slate-400 font-semibold block">Incident #{inc.id} (BR-07)</span>
                </div>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Reason for unlock <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 min-h-[80px]"
                    placeholder="Physician order clarification needed; DON approved temporary unlock for addendum entry."
                    value={unlockReason}
                    onChange={(e) => setUnlockReason(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Re-enter password to confirm</label>
                  <input
                    type="password"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="••••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>

              {/* Warning override sign tag */}
              <div className="mt-4 flex gap-2 items-start text-[10px] text-slate-400 font-medium leading-normal">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  {currentUser?.firstName} {currentUser?.lastName}, {currentUser?.roleName ?? "DON"} · signing this override.
                  <br />
                  Recorded immutably in the audit log (NFR-02).
                </span>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowUnlockModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold">
                Unlock & Sign
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
