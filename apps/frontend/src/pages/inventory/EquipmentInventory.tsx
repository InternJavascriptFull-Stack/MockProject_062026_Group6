import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Users, Clock, Wallet, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/authUi/select";

// ── Seed data (matches the AD-16 mockup; swap for equipmentSupplyService later) ──

interface DmeRow {
  id: string;
  name: string;
  category: string;
  assetTag: string;
  inUse: number;
  total: number;
  status: "In Service" | "Under Maintenance";
  assignedTo: string;
  unitValue: number;
}

const DME_ROWS: DmeRow[] = [
  { id: "eq-1042", name: "Hoyer Lift", category: "Mobility", assetTag: "EQ-1042", inUse: 2, total: 3, status: "In Service", assignedTo: "Multiple", unitValue: 4200 },
  { id: "eq-1077", name: "Wheelchair (Bariatric)", category: "Mobility", assetTag: "EQ-1077", inUse: 1, total: 1, status: "In Service", assignedTo: "Robert Hayes", unitValue: 2800 },
  { id: "eq-0995", name: "Hospital Bed — Electric", category: "Positioning", assetTag: "EQ-0995", inUse: 5, total: 6, status: "In Service", assignedTo: "Multiple", unitValue: 3600 },
  { id: "eq-1140", name: "Oxygen Concentrator", category: "Respiratory", assetTag: "EQ-1140", inUse: 3, total: 4, status: "Under Maintenance", assignedTo: "—", unitValue: 1950 },
  { id: "eq-0810", name: "Walker — Standard", category: "Mobility", assetTag: "EQ-0810", inUse: 6, total: 8, status: "In Service", assignedTo: "Multiple", unitValue: 180 },
];

interface ConsumableRow {
  id: string;
  name: string;
  category: string;
  stockOnHand: string;
  reorderThreshold: string;
  unitCost: string;
  privatePayRate: string;
  status: "OK" | "Low Stock";
}

const CONSUMABLE_ROWS: ConsumableRow[] = [
  { id: "cs-briefs", name: "Incontinence Briefs (L)", category: "Incontinence", stockOnHand: "340 units", reorderThreshold: "200 units", unitCost: "$0.85/unit", privatePayRate: "$1.20/unit", status: "OK" },
  { id: "cs-dressing", name: "Wound Dressing 4x4", category: "Wound Care", stockOnHand: "45 boxes", reorderThreshold: "60 boxes", unitCost: "$6.20/box", privatePayRate: "$8.50/box", status: "Low Stock" },
  { id: "cs-gloves", name: "Nitrile Gloves (M)", category: "PPE", stockOnHand: "1,200 pairs", reorderThreshold: "500 pairs", unitCost: "$0.12/pair", privatePayRate: "$0.20/pair", status: "OK" },
  { id: "cs-nutrition", name: "Nutritional Suppl. (Vanilla)", category: "Nutrition", stockOnHand: "80 cases", reorderThreshold: "40 cases", unitCost: "$18.50/case", privatePayRate: "$24.00/case", status: "OK" },
];

const DME_CATEGORIES = ["All", ...new Set(DME_ROWS.map((row) => row.category))];
const DME_STATUSES = ["All", "In Service", "Under Maintenance"];

const currency = (value: number) =>
  `$${value.toLocaleString("en-US")}`;

function StatCard({
  icon,
  iconWrapClass,
  label,
  value,
}: {
  icon: ReactNode;
  iconWrapClass: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 flex items-center">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${iconWrapClass}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EquipmentInventory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"dme" | "consumable">("dme");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredDme = DME_ROWS.filter((row) => {
    const matchCategory =
      categoryFilter === "All" || row.category === categoryFilter;
    const matchStatus = statusFilter === "All" || row.status === statusFilter;
    return matchCategory && matchStatus;
  });

  const totalItems = DME_ROWS.reduce((sum, row) => sum + row.total, 0);
  const inUse = DME_ROWS.reduce((sum, row) => sum + row.inUse, 0);
  const underMaintenance = DME_ROWS.filter(
    (row) => row.status === "Under Maintenance",
  ).length;
  const totalAssetValue = DME_ROWS.reduce(
    (sum, row) => sum + row.unitValue * row.total,
    0,
  );

  const tabClass = (active: boolean) =>
    `-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <span className="hover:text-slate-700 cursor-pointer">Admin</span> &gt;{" "}
          <span className="text-slate-900">Equipment &amp; Supply</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Equipment &amp; Supply Inventory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Durable Medical Equipment (DME) asset register and Consumable Supplies stock — see
          Master Plan §9.1 for billing model
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-6 border-b border-slate-200">
        <button className={tabClass(tab === "dme")} onClick={() => setTab("dme")}>
          Durable Medical Equipment (DME)
        </button>
        <button
          className={tabClass(tab === "consumable")}
          onClick={() => setTab("consumable")}
        >
          Consumable Supplies
        </button>
      </div>

      {tab === "dme" ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <StatCard
              icon={<Layers className="w-6 h-6 text-blue-600" />}
              iconWrapClass="bg-blue-50"
              label="Total DME Items"
              value={String(totalItems)}
            />
            <StatCard
              icon={<Users className="w-6 h-6 text-emerald-600" />}
              iconWrapClass="bg-emerald-50"
              label="In Use"
              value={String(inUse)}
            />
            <StatCard
              icon={<Clock className="w-6 h-6 text-amber-600" />}
              iconWrapClass="bg-amber-50"
              label="Under Maintenance"
              value={String(underMaintenance)}
            />
            <StatCard
              icon={<Wallet className="w-6 h-6 text-purple-600" />}
              iconWrapClass="bg-purple-50"
              label="Total Asset Value"
              value={currency(totalAssetValue)}
            />
          </div>

          {/* Filters + Add */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-500">
                {inUse} of {totalItems} units currently in use
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="w-full md:w-44">
                <Select defaultValue="All" onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full bg-white">
                    <span className="truncate">Category: {categoryFilter}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {DME_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-44">
                <Select defaultValue="All" onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-white">
                    <span className="truncate">Status: {statusFilter}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {DME_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                onClick={() => navigate("/admin/equipment/add")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </div>
          </div>

          {/* DME table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Asset Tag</th>
                  <th className="px-6 py-3">Qty (In Use/Total)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned To</th>
                  <th className="px-6 py-3">Unit Value</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDme.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      No equipment matches the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDme.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.category}</td>
                      <td className="px-6 py-4 text-slate-500">{row.assetTag}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {row.inUse} / {row.total}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={row.status === "In Service" ? "priority" : "warning"}
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.assignedTo}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {currency(row.unitValue)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          onClick={() => navigate(`/admin/equipment/${row.id}/edit`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            Unit Value is an internal reference for depreciation/maintenance planning only.
            DME used inside the facility is bundled into the per-diem rate (CMS SNF
            Consolidated Billing, §9.1) — it is never billed per-item to Medicare Part A.
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Consumable Supplies</h2>
              <p className="text-sm text-slate-500 mt-1">
                Unit Cost = internal COGS tracking. Private-Pay Rate = simulated billing rate
                for residents not on Medicare Part A (§9.1, NFR-05).
              </p>
            </div>
            <span className="flex-shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              Tab 2 of 2
            </span>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Stock on Hand</th>
                  <th className="px-6 py-3">Reorder Threshold</th>
                  <th className="px-6 py-3">Unit Cost</th>
                  <th className="px-6 py-3">Private-Pay Rate</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CONSUMABLE_ROWS.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-slate-600">{row.category}</td>
                    <td className="px-6 py-4 text-slate-700">{row.stockOnHand}</td>
                    <td className="px-6 py-4 text-slate-500">{row.reorderThreshold}</td>
                    <td className="px-6 py-4 text-slate-700">{row.unitCost}</td>
                    <td className="px-6 py-4 text-slate-700">{row.privatePayRate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={row.status === "OK" ? "priority" : "alert"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
