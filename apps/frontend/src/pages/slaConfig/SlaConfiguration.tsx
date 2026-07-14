import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";

// SLA rows are keyed to the fixed AD-08 severity tiers. Minor requires no external
// report, so its deadline/body are non-editable (N/A).
interface SlaRow {
  id: number;
  severity: string;
  externalReportRequired: boolean;
  reportingDeadline: string;
  regulatoryBody: string;
  badgeClass: string;
}

const SEED_ROWS: SlaRow[] = [
  {
    id: 1,
    severity: "Critical",
    externalReportRequired: true,
    reportingDeadline: "24 hours",
    regulatoryBody: "CA Dept. of Public Health",
    badgeClass: "bg-red-100 text-red-700 border-red-300",
  },
  {
    id: 2,
    severity: "Major",
    externalReportRequired: true,
    reportingDeadline: "24 hours",
    regulatoryBody: "CA Dept. of Public Health",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-300",
  },
  {
    id: 3,
    severity: "Moderate",
    externalReportRequired: true,
    reportingDeadline: "48 hours",
    regulatoryBody: "CA Dept. of Public Health",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-300",
  },
  {
    id: 4,
    severity: "Minor",
    externalReportRequired: false,
    reportingDeadline: "— (not required)",
    regulatoryBody: "—",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-300",
  },
];

export default function SlaConfiguration() {
  const [rows, setRows] = useState<SlaRow[]>(SEED_ROWS);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleFieldChange = (
    id: number,
    field: "reportingDeadline" | "regulatoryBody",
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleCancel = () => {
    setRows(SEED_ROWS);
    setEditingId(null);
  };

  const handleSave = () => {
    // Backend not wired yet — persist to local state only for now (NFR-06).
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <span className="hover:text-slate-700 cursor-pointer">Admin</span> &gt;{" "}
          <span className="text-slate-900">SLA Config</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          SLA Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Regulatory reporting deadlines by incident severity (NFR-06)
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
        <p className="text-sm font-semibold text-blue-700">
          Deadlines fixed to AD-08 severity tiers. Simulated — nothing is transmitted
          externally (NFR-05).
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-40">Severity</th>
              <th className="px-6 py-3">External Report Required</th>
              <th className="px-6 py-3">Reporting Deadline</th>
              <th className="px-6 py-3">Regulatory Body</th>
              <th className="px-6 py-3 text-right w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isEditing = editingId === row.id;
              return (
                <tr key={row.id} className="align-middle hover:bg-slate-50/60">
                  <td className="px-6 py-5">
                    <Badge className={row.badgeClass}>{row.severity}</Badge>
                  </td>
                  <td className="px-6 py-5 text-slate-700">
                    {row.externalReportRequired ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {isEditing && row.externalReportRequired ? (
                      <Input
                        value={row.reportingDeadline}
                        onChange={(e) =>
                          handleFieldChange(row.id, "reportingDeadline", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      row.reportingDeadline
                    )}
                  </td>
                  <td className="px-6 py-5 text-slate-700">
                    {isEditing && row.externalReportRequired ? (
                      <Input
                        value={row.regulatoryBody}
                        onChange={(e) =>
                          handleFieldChange(row.id, "regulatoryBody", e.target.value)
                        }
                      />
                    ) : (
                      row.regulatoryBody
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {row.externalReportRequired ? (
                      <button
                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        onClick={() => setEditingId(isEditing ? null : row.id)}
                      >
                        {isEditing ? "Done" : "Edit"}
                      </button>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500 leading-relaxed">
        Only Deadline and Regulatory Body are editable. Values match M7 Incident List (SLA
        Countdown), Incident Detail, and Submit External Report modal (S6) — e.g. Major=24h,
        Moderate=48h window.
      </p>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200 pb-10">
        <Button
          type="button"
          variant="outline"
          className="px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
