import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";

// Fixed 4-level taxonomy (AD-08). Only the description is editable per BR notes.
interface SeverityRow {
  id: number;
  level: string;
  description: string;
  example: string;
  badgeClass: string;
}

const SEED_LEVELS: SeverityRow[] = [
  {
    id: 1,
    level: "Minor",
    description: "Low-risk event; no injury or intervention required.",
    example: "e.g. minor skin tear, no treatment needed",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-300",
  },
  {
    id: 2,
    level: "Moderate",
    description: "Injury requiring minor treatment; no hospitalization.",
    example: "e.g. bruise requiring first aid, missed dose",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-300",
  },
  {
    id: 3,
    level: "Major",
    description: "Significant injury requiring treatment; possible hospitalization.",
    example: "e.g. fall with fracture, med error",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-300",
  },
  {
    id: 4,
    level: "Critical",
    description: "Life-threatening event requiring emergency intervention.",
    example: "e.g. elopement, cardiac event",
    badgeClass: "bg-red-100 text-red-700 border-red-300",
  },
];

export default function IncidentSeverityLevels() {
  const [levels, setLevels] = useState<SeverityRow[]>(SEED_LEVELS);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDescriptionChange = (id: number, value: string) => {
    setLevels((prev) =>
      prev.map((row) => (row.id === id ? { ...row, description: value } : row)),
    );
  };

  const handleCancel = () => {
    setLevels(SEED_LEVELS);
    setEditingId(null);
  };

  const handleSave = () => {
    // Backend not wired yet — persist to local state only for now (AD-08).
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <span className="hover:text-slate-700 cursor-pointer">Admin</span> &gt;{" "}
          <span className="text-slate-900">Incident Severity</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Incident Severity Levels
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Taxonomy used across Incident &amp; Risk (M7) — 4 levels, fixed
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
        <p className="text-sm font-semibold text-blue-700">
          Fixed 4-level taxonomy, referenced across all M7 Incident wireframes. Only
          descriptions are editable.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-40">Level</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Example</th>
              <th className="px-6 py-3 text-right w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {levels.map((row) => {
              const isEditing = editingId === row.id;
              return (
                <tr key={row.id} className="align-middle hover:bg-slate-50/60">
                  <td className="px-6 py-5">
                    <Badge className={row.badgeClass}>{row.level}</Badge>
                  </td>
                  <td className="px-6 py-5 text-slate-700">
                    {isEditing ? (
                      <Input
                        value={row.description}
                        onChange={(e) =>
                          handleDescriptionChange(row.id, e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      row.description
                    )}
                  </td>
                  <td className="px-6 py-5 text-slate-500">{row.example}</td>
                  <td className="px-6 py-5 text-right">
                    <button
                      className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      onClick={() => setEditingId(isEditing ? null : row.id)}
                    >
                      {isEditing ? "Done" : "Edit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500 leading-relaxed">
        Levels cannot be added or deleted here. Chart-lock (BR-07) triggers on every incident
        regardless of severity — severity only determines the external-reporting deadline (see
        SLA Configuration, AD-09).
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
