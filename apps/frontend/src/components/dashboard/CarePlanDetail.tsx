import * as React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Award,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface CarePlanDetailProps {
  residentId: string;
  navigate: (to: string) => void;
}

// Mock resident data map for detail view
const RESIDENT_DETAILS: Record<
  string,
  {
    name: string;
    room: string;
    age: number;
    locTier: string;
    admissionDate: string;
    problems: string[];
    goals: string[];
    interventions: string[];
  }
> = {
  "1": {
    name: "Mary Coleman",
    room: "118A",
    age: 82,
    locTier: "Tier 2",
    admissionDate: "2025-03-12",
    problems: [
      "Cognitive decline (Mild dementia)",
      "Risk for falls related to balance impairment",
    ],
    goals: [
      "Maintain cognitive engagement through daily activities",
      "Remain fall-free during shift",
    ],
    interventions: [
      "Assist with daily memory puzzle exercises",
      "Escort during ambulation and use walker assistance",
    ],
  },
  "2": {
    name: "Elena Ramos",
    room: "106A",
    age: 79,
    locTier: "Tier 1",
    admissionDate: "2025-06-18",
    problems: ["Impaired physical mobility", "Chronic pain in knees"],
    goals: [
      "Walk 30 feet independently with cane",
      "Pain level managed below 4/10",
    ],
    interventions: [
      "Range of motion exercise twice daily",
      "Administer prescribed pain meds 30m before exercises",
    ],
  },
  "3": {
    name: "Thomas Baker",
    room: "220C",
    age: 88,
    locTier: "Tier 3",
    admissionDate: "2024-11-05",
    problems: [
      "Congestive heart failure management",
      "Severe memory impairment",
    ],
    goals: [
      "Oxygen saturation above 92%",
      "Participate in structured sensory stimulation",
    ],
    interventions: [
      "Monitor vitals and SpO2 every shift",
      "Provide 1-on-1 calming sensory therapy sessions",
    ],
  },
  "4": {
    name: "Grace Kim",
    room: "112B",
    age: 85,
    locTier: "Tier 4",
    admissionDate: "2024-05-30",
    problems: [
      "Advanced Alzheimer's disease",
      "Difficulty swallowing (dysphagia)",
    ],
    goals: ["No aspiration episodes", "Express comfort and safety cues"],
    interventions: [
      "Prepare pureed diet and monitor swallowing",
      "Implement calming routines and ambient sensory stimulation",
    ],
  },
};

export function CarePlanDetail({ residentId, navigate }: CarePlanDetailProps) {
  const resident = RESIDENT_DETAILS[residentId] ??
    RESIDENT_DETAILS["1"] ?? {
      name: "Mary Coleman",
      room: "118A",
      age: 82,
      locTier: "Tier 2",
      admissionDate: "2025-03-12",
      problems: [],
      goals: [],
      interventions: [],
    };
  const [comment, setComment] = React.useState("");
  const [selectedTier, setSelectedTier] = React.useState(resident.locTier);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleApprove = () => {
    setIsSuccess(true);
    setTimeout(() => {
      alert(
        `Care Plan for ${resident.name} has been successfully approved & signed under ${selectedTier}!`,
      );
      navigate("/dashboard");
    }, 800);
  };

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => {
            navigate("/dashboard");
          }}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span className="text-sm font-semibold tracking-wide">
            Care Plan successfully signed and approved. Redirecting...
          </span>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Care Plan Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                    Care Plan Review
                  </div>
                  <h1 className="font-heading text-brand-primary-dark mt-1 text-2xl font-extrabold tracking-tight">
                    {resident.name}
                  </h1>
                  <p className="text-brand-gray-muted mt-1 text-sm font-medium">
                    Room {resident.room} · Age {resident.age} · Admitted{" "}
                    {resident.admissionDate}
                  </p>
                </div>
                <div>
                  <Badge
                    variant="default"
                    className="rounded-full border-transparent bg-blue-600 px-3 py-1 text-xs font-bold text-white"
                  >
                    Active Care Plan
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Problems Card */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldAlert className="h-5 w-5 text-red-500" /> Active
                Diagnosed Problems
              </CardTitle>
              <CardDescription>
                Problems requiring ongoing staff supervision
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {resident.problems.map((prob, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{prob}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Goals Card */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-emerald-500" /> Specific Care
                Goals
              </CardTitle>
              <CardDescription>
                Target milestones and desired clinical outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {resident.goals.map((goal, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Signing Actions Form */}
        <div>
          <Card className="sticky top-24 h-full">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-500" /> Review Sign-Off
              </CardTitle>
              <CardDescription>
                Adjust level of care tier and provide signature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Level of care tier selection */}
              <div className="space-y-2">
                <label className="text-brand-primary-dark block text-xs font-bold tracking-wider uppercase">
                  Level of Care Tier
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => {
                    setSelectedTier(e.target.value);
                  }}
                  className="border-brand-border w-full rounded-lg border bg-white p-2.5 text-sm font-semibold focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Tier 1">Tier 1 (Mild Care)</option>
                  <option value="Tier 2">Tier 2 (Moderate Care)</option>
                  <option value="Tier 3">Tier 3 (High Support)</option>
                  <option value="Tier 4">Tier 4 (Intensive Care)</option>
                </select>
              </div>

              {/* Comments Textarea */}
              <div className="space-y-2">
                <label className="text-brand-primary-dark block text-xs font-bold tracking-wider uppercase">
                  Reviewer Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                  placeholder="Enter comments or revision requests..."
                  rows={4}
                  className="border-brand-border w-full rounded-lg border bg-white p-2.5 text-sm font-semibold focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleApprove}
                  variant="primary"
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
                  disabled={isSuccess}
                >
                  Approve & Sign Care Plan
                </Button>
                <Button
                  onClick={() => {
                    alert("Revision request submitted to case managers.");
                    navigate("/dashboard");
                  }}
                  variant="outline"
                  className="w-full rounded-lg border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-all"
                  disabled={isSuccess}
                >
                  Request Revision
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
