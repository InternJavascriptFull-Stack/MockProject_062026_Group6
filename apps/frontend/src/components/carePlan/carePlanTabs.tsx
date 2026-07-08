import * as React from "react";
import { Printer, Share2 } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
}

/**
 * CarePlanTabs component offering tab navigation for the care plan view.
 */
export function CarePlanTabs() {
  const tabs: TabItem[] = [
    { id: "activeProblems", label: "Active Problems" },
    { id: "goalsInterventions", label: "Goals & Interventions" },
    { id: "adlTasks", label: "ADL Tasks" },
    { id: "progressNotes", label: "Progress Notes" },
    { id: "vitalsHistory", label: "Vitals History" },
  ];

  const [activeTab, setActiveTab] = React.useState("activeProblems");

  return (
    <div className="border-brand-border flex w-full items-center justify-between overflow-x-auto border-b bg-white px-8 sm:overflow-x-visible">
      {/* Tabs List */}
      <div className="flex gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`relative cursor-pointer border-b-2 py-4.5 text-sm font-semibold tracking-wide transition-all ${
                isActive
                  ? "border-brand-primary-dark text-brand-primary-dark font-bold"
                  : "text-brand-gray-muted hover:text-brand-primary-dark border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Action Icons */}
      <div className="hidden items-center gap-2 md:flex">
        <button
          type="button"
          onClick={() => {
            alert("Print Care Plan");
          }}
          className="border-brand-border text-brand-primary-dark cursor-pointer rounded-lg border p-2 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Printer className="h-4.5 w-4.5 stroke-[2.2]" />
        </button>
        <button
          type="button"
          onClick={() => {
            alert("Share Care Plan");
          }}
          className="border-brand-border text-brand-primary-dark cursor-pointer rounded-lg border p-2 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Share2 className="h-4.5 w-4.5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
}
