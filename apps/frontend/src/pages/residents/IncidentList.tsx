import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { incidentsService } from "@/services/incidents";

export default function IncidentList() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await incidentsService.getIncidents();
      setIncidents(data);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load incidents list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.resident?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.incidentType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      inc.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">
            <span className="text-slate-900 font-semibold">Incident & Risk</span> &gt;{" "}
            <span className="text-slate-500">Incident List</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 mt-1 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
            Incident List
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track regulatory reporting, investigate incidents, and manage clinical chart lock overrides.
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="outline"
          className="flex items-center gap-1.5 font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Search by ID, resident name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setStatusFilter("all")}
            variant={statusFilter === "all" ? "primary" : "outline"}
            className="font-bold text-xs"
            size="sm"
          >
            All Status
          </Button>
          <Button
            onClick={() => setStatusFilter("open")}
            variant={statusFilter === "open" ? "primary" : "outline"}
            className="font-bold text-xs"
            size="sm"
          >
            Open
          </Button>
          <Button
            onClick={() => setStatusFilter("resolved")}
            variant={statusFilter === "resolved" ? "primary" : "outline"}
            className="font-bold text-xs"
            size="sm"
          >
            Resolved
          </Button>
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center font-sans text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Clock className="w-6 h-6 animate-spin mr-2 text-blue-500" />
          <span>Loading incidents list...</span>
        </div>
      ) : errorMsg ? (
        <div className="p-6 text-center bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="font-bold">Error Loading Incidents</p>
          <p className="text-sm mt-1">{errorMsg}</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-500">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No Incidents Found</h3>
          <p className="text-sm mt-1 max-w-md mx-auto">
            Try adjusting your search terms, changing the status filters, or seeding demo data to populate records.
          </p>
          <Button
            onClick={() => navigate("/admin/data")}
            className="mt-4 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Demo Seeder
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-400">#{inc.id}</span>
                  <Badge variant={inc.status?.toLowerCase() === "open" ? "warning" : "priority"}>
                    {inc.status}
                  </Badge>
                  {inc.resident?.isChartLocked ? (
                    <Badge variant="alert" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </Badge>
                  ) : (
                    <Badge variant="priority" className="flex items-center gap-1">
                      <Unlock className="w-3 h-3 text-emerald-600" /> Active
                    </Badge>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {inc.incidentType} — {inc.resident?.fullName}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                  {inc.description}
                </p>
                <span className="text-xs text-slate-400 block mt-1.5 font-medium">
                  Reported by {inc.reporter?.name} · {new Date(inc.reportedAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <span className="text-xs text-slate-400 block font-semibold">Severity</span>
                  <span className="text-sm font-bold text-slate-700">{inc.severity}</span>
                </div>

                <Link to={`/incidents/${inc.id}`}>
                  <Button
                    variant="outline"
                    className="border-slate-200 font-bold hover:bg-slate-100 text-slate-700 flex items-center gap-1.5"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
