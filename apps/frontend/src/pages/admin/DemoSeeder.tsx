import React, { useState, useEffect } from "react";
import { AlertTriangle, Database, RefreshCw, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoDataService } from "@/services/demoData";

interface DatasetRow {
  key: string;
  name: string;
  countEstimate: string;
  actualCount: number;
  lastSeeded: string | null;
  status: "Seeded" | "Not Seeded";
}

export default function DemoSeeder() {
  const [statusData, setStatusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Popup state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: "seed-all" | "reset-all" | "load-dataset" | "clear-dataset";
    datasetKey?: string;
    datasetName?: string;
  } | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await demoDataService.getStatus();
      setStatusData(res);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg("Failed to load demo data status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleOpenConfirm = (
    type: "seed-all" | "reset-all" | "load-dataset" | "clear-dataset",
    datasetKey?: string,
    datasetName?: string
  ) => {
    setConfirmModal({
      show: true,
      type,
      datasetKey,
      datasetName
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { type, datasetKey } = confirmModal;
    setConfirmModal(null);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (type === "seed-all") {
        const res = await demoDataService.seedAll();
        if (res.success) {
          setSuccessMsg("Demo data seeded successfully.");
        } else {
          setErrorMsg(res.message || "Failed to seed demo data.");
        }
      } else if (type === "reset-all") {
        await demoDataService.resetAll();
        setSuccessMsg("All demo data cleared successfully.");
      } else if (type === "load-dataset" && datasetKey) {
        await demoDataService.loadDataset(datasetKey);
        setSuccessMsg(`Successfully loaded ${confirmModal.datasetName}.`);
      } else if (type === "clear-dataset" && datasetKey) {
        await demoDataService.clearDataset(datasetKey);
        setSuccessMsg(`Successfully cleared ${confirmModal.datasetName}.`);
      }
      await fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred executing database operation.");
      setIsLoading(false);
    }
  };

  const counts = statusData?.recordCounts || { residents: 0, carePlans: 0, incidents: 0, medications: 0 };
  const lastSeededText = statusData?.lastSeededAt
    ? new Date(statusData.lastSeededAt).toISOString().slice(0, 16).replace("T", " ")
    : null;

  const datasets: DatasetRow[] = [
    {
      key: "residents",
      name: "Residents",
      countEstimate: "~20",
      actualCount: counts.residents,
      lastSeeded: counts.residents > 0 ? lastSeededText : null,
      status: counts.residents > 0 ? "Seeded" : "Not Seeded"
    },
    {
      key: "care-plans",
      name: "Care Plans",
      countEstimate: "~15",
      actualCount: counts.carePlans,
      lastSeeded: counts.carePlans > 0 ? lastSeededText : null,
      status: counts.carePlans > 0 ? "Seeded" : "Not Seeded"
    },
    {
      key: "incidents",
      name: "Incidents",
      countEstimate: "~8",
      actualCount: counts.incidents,
      lastSeeded: counts.incidents > 0 ? lastSeededText : null,
      status: counts.incidents > 0 ? "Seeded" : "Not Seeded"
    },
    {
      key: "medications",
      name: "Medications",
      countEstimate: "~40",
      actualCount: counts.medications,
      lastSeeded: counts.medications > 0 ? lastSeededText : null,
      status: counts.medications > 0 ? "Seeded" : "Not Seeded"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto font-sans relative">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <span className="hover:text-slate-700 cursor-pointer">Admin</span> &gt;{" "}
          <span className="text-slate-900 font-semibold">Data</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Demo Data Seeder</h1>
        <p className="text-sm text-slate-500 mt-1">Load fixture datasets for demos and testing</p>
      </div>

      {/* Alert Banners */}
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

      {/* Dev Warning Callout Box */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-semibold">
            Dev / Staging only — not available in Production. All actions are simulated (NFR-05).
          </span>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenConfirm("seed-all")}
            disabled={isLoading || statusData?.seeded}
            className="bg-white border-amber-300 hover:bg-amber-100 text-amber-900 font-bold"
          >
            <Database className="w-4 h-4 mr-1.5" />
            Seed All Demo Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenConfirm("reset-all")}
            disabled={isLoading || !statusData?.seeded}
            className="bg-white border-red-300 hover:bg-red-50 text-red-700 font-bold"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Reset All Demo Data
          </Button>
        </div>
      </div>

      {/* Datasets Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-4">Dataset</th>
                  <th className="px-6 py-4">Records</th>
                  <th className="px-6 py-4">Last Seeded</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datasets.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {row.name} <span className="font-normal text-slate-400">(sample)</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {row.actualCount > 0 ? row.actualCount : row.countEstimate}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{row.lastSeeded || "—"}</td>
                    <td className="px-6 py-4">
                      {row.status === "Seeded" ? (
                        <Badge variant="priority">Seeded</Badge>
                      ) : (
                        <Badge variant="muted">Not Seeded</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoading || row.status === "Seeded"}
                          onClick={() => handleOpenConfirm("load-dataset", row.key, row.name)}
                          className="h-8 px-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                        >
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoading || row.status === "Not Seeded"}
                          onClick={() => handleOpenConfirm("clear-dataset", row.key, row.name)}
                          className="h-8 px-3 text-xs bg-white text-red-600 hover:bg-red-50 border-slate-200"
                        >
                          Clear
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Instruction Text */}
      <p className="mt-4 text-xs leading-relaxed text-slate-400 font-medium">
        Medications dataset is fixture-only reference data used by resident profile records — it does not imply a
        separate M3 eMAR screen, which remains out of scope for this MVP ("coming soon").
      </p>

      {/* Confirmation Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900">Confirmation</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {confirmModal.type === "seed-all" &&
                  "Bạn có chắc muốn tạo toàn bộ dữ liệu demo không? Thao tác này sẽ thêm các dữ liệu mẫu vào hệ thống."}
                {confirmModal.type === "reset-all" &&
                  "Bạn có chắc muốn xóa toàn bộ dữ liệu demo không? Thao tác này sẽ dọn dẹp các hồ sơ mẫu khỏi hệ thống."}
                {confirmModal.type === "load-dataset" &&
                  `Bạn có chắc muốn tạo dữ liệu demo cho ${confirmModal.datasetName} không?`}
                {confirmModal.type === "clear-dataset" &&
                  `Bạn có chắc muốn xóa dữ liệu demo của ${confirmModal.datasetName} không?`}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setConfirmModal(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant={
                  confirmModal.type === "reset-all" || confirmModal.type === "clear-dataset"
                    ? "primary"
                    : "secondary"
                }
                size="sm"
                onClick={handleConfirmAction}
                disabled={isLoading}
                className={
                  confirmModal.type === "reset-all" || confirmModal.type === "clear-dataset"
                    ? "bg-red-600 hover:bg-red-700 text-white font-bold"
                    : "bg-blue-600 hover:bg-blue-700 text-white font-bold"
                }
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                ) : confirmModal.type === "reset-all" || confirmModal.type === "clear-dataset" ? (
                  "Confirm Clear"
                ) : (
                  "Confirm Seed"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
