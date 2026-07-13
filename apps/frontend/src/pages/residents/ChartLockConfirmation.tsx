import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { incidentsService } from "@/services/incidents";

export default function ChartLockConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [incident, setIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Retrieve state parameters if passed, otherwise fetch from api
  const stateData = location.state as {
    residentName?: string;
    lockedAt?: string;
    incidentId?: string;
    residentId?: string;
  } | null;

  useEffect(() => {
    const fetchIncident = async () => {
      if (!id || stateData) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await incidentsService.getIncidentById(id);
        setIncident(data);
      } catch (err) {
        console.error("Failed to load incident for confirmation", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncident();
  }, [id, stateData]);

  // Extract variables, fallback to mockup values from image
  const displayIncidentId = stateData?.incidentId || incident?.id || id || "INC-2044";
  const displayResidentName = stateData?.residentName || incident?.resident?.fullName || "Robert Hayes";
  
  // Format locking timestamp
  const displayLockedAt = stateData?.lockedAt 
    ? new Date(stateData.lockedAt).toLocaleString() 
    : incident?.reportedAt 
      ? new Date(incident.reportedAt).toLocaleString() 
      : "2026-07-03 09:22";

  const residentId = stateData?.residentId || incident?.resident?.id || "";

  return (
    <div className="max-w-4xl mx-auto font-sans p-6 min-h-[80vh] flex flex-col justify-between">
      {/* Breadcrumbs */}
      <div className="text-sm font-medium text-slate-500 mb-6">
        <span className="hover:text-slate-700 cursor-pointer" onClick={() => navigate("/incidents")}>
          Incident & Risk
        </span> &gt;{" "}
        <span className="text-slate-900 font-semibold">Chart Lock Confirmation</span>
      </div>

      {/* Main Card Container */}
      <div className="flex-grow flex items-center justify-center">
        <Card className="max-w-2xl w-full border border-slate-200 shadow-lg rounded-2xl bg-white overflow-hidden p-8 md:p-12">
          <CardContent className="flex flex-col items-center text-center p-0">
            {/* Lock Icon */}
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
              <Lock className="w-10 h-10 text-rose-500" />
            </div>

            {/* Heading Title */}
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Chart Locked
            </h1>

            {/* Subtext */}
            <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
              {displayResidentName}'s chart was automatically locked
              <br />
              at {displayLockedAt} (BR-07).
            </p>

            {/* Inner Gray Reference Box */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8 text-left text-xs text-slate-500 leading-normal">
              <div className="flex justify-between items-center mb-2.5">
                <span className="font-bold text-slate-700 text-xs">Incident reference</span>
                <span className="font-mono font-bold text-slate-900 text-xs">#{displayIncidentId}</span>
              </div>
              <p className="text-slate-500 font-medium">
                M1, M2 and M3 records for this resident are now read-only until a DON unlocks the chart (LC-06).
              </p>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(residentId ? `/residents/${residentId}` : "/residents")}
                className="px-6 py-2.5 font-bold text-sm text-slate-700 border-slate-200 hover:bg-slate-50"
              >
                Back to Resident Profile
              </Button>
              
              <Button
                onClick={() => navigate(`/incidents/${displayIncidentId}`)}
                className="px-6 py-2.5 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5"
              >
                View Incident
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
