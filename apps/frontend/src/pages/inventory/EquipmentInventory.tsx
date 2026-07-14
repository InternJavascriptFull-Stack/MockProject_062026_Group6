import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/authUi/input";
import { EQUIPMENT_STATUS_LABEL, type EquipmentStatus } from "@/constants/inventory";
import { equipmentSupplyService, type EquipmentSupplyDTO } from "@/services/equipmentSupply";

export default function EquipmentInventory() {
    const navigate = useNavigate();
    const [items, setItems] = useState<EquipmentSupplyDTO[]>([]);
    const [search, setSearch] = useState("");
    const [itemType, setItemType] = useState("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadItems();
    }, []);

    async function loadItems() {
        setIsLoading(true);
        setError("");
        try {
            setItems(await equipmentSupplyService.getAll());
        } catch (loadError) {
            setError((loadError as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return items.filter((item) => {
            const matchesSearch =
                !normalizedSearch ||
                item.name.toLowerCase().includes(normalizedSearch) ||
                item.code.toLowerCase().includes(normalizedSearch) ||
                item.category.toLowerCase().includes(normalizedSearch);
            const matchesType = itemType === "ALL" || item.itemType === itemType;
            return matchesSearch && matchesType;
        });
    }, [items, search, itemType]);

    function statusLabel(status: EquipmentStatus): string {
        return EQUIPMENT_STATUS_LABEL[status] ?? status.replaceAll("_", " ");
    }

    return (
        <div className="mx-auto max-w-7xl font-sans">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="mb-1 text-sm font-medium text-slate-500">Admin &gt; Equipment &amp; Supply</div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Equipment &amp; Supply Inventory</h1>
                    <p className="mt-1 text-sm text-slate-500">Track durable equipment and consumable stock from the facility database.</p>
                </div>
                <Button onClick={() => navigate("/admin/equipment/add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </div>

            <div className="mb-5 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative min-w-[260px] flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search item, asset tag, or category" className="pl-9" />
                </div>
                <select value={itemType} onChange={(event) => setItemType(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option value="ALL">All item types</option>
                    <option value="EQUIPMENT">Durable equipment</option>
                    <option value="SUPPLY">Consumable supplies</option>
                </select>
                <Button variant="outline" onClick={() => void loadItems()} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                        <tr>
                            <th className="px-5 py-3">Item</th>
                            <th className="px-5 py-3">Type</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Code</th>
                            <th className="px-5 py-3">Stock</th>
                            <th className="px-5 py-3">Threshold</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                                    Loading inventory...
                                </td>
                            </tr>
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                                    No inventory items found.
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => {
                                const isLowStock = item.itemType === "SUPPLY" && item.quantityOnHand <= item.reorderThreshold;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 font-semibold text-slate-900">{item.name}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.itemType === "EQUIPMENT" ? "Equipment" : "Supply"}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.category}</td>
                                        <td className="px-5 py-4 text-slate-500">{item.code}</td>
                                        <td className="px-5 py-4 text-slate-700">
                                            {item.quantityOnHand} {item.unit}
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">{item.reorderThreshold}</td>
                                        <td className="px-5 py-4">
                                            <Badge variant={isLowStock ? "warning" : "priority"}>{isLowStock ? "Low Stock" : statusLabel(item.status)}</Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button className="font-semibold text-blue-600 hover:underline" onClick={() => navigate(`/admin/equipment/${item.id}/edit`)}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
