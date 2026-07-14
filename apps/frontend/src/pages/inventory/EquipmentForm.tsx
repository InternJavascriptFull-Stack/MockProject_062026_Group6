import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/authUi/input";
import { Label } from "@/components/authUi/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/authUi/select";
import { EQUIPMENT_CATEGORY, EQUIPMENT_STATUS, EQUIPMENT_STATUS_LABEL, EQUIPMENT_UNIT, type EquipmentStatus } from "@/constants/inventory";
import { equipmentSupplyService } from "@/services/equipmentSupply";

const equipmentSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    category: z.string().min(1, "Category is required"),
    code: z
        .string()
        .min(1, "Asset tag is required")
        .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only"),
    unit: z.string().min(1, "Unit is required"),
    quantityOnHand: z.number().int().min(0),
    reorderThreshold: z.number().int().min(0),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
    itemType: z.enum(["EQUIPMENT", "SUPPLY"]),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const DEFAULT_VALUES: EquipmentFormValues = {
    name: "",
    category: "",
    code: "",
    unit: EQUIPMENT_UNIT.ITEM,
    quantityOnHand: 0,
    reorderThreshold: 0,
    status: EQUIPMENT_STATUS.ACTIVE,
    itemType: "EQUIPMENT",
};

export default function EquipmentForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(isEditMode);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (!id) return;
        void (async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const item = await equipmentSupplyService.getById(id);
                reset({
                    name: item.name,
                    category: item.category,
                    code: item.code,
                    unit: item.unit,
                    quantityOnHand: item.quantityOnHand,
                    reorderThreshold: item.reorderThreshold,
                    status: item.status,
                    itemType: item.itemType ?? "EQUIPMENT",
                });
            } catch (loadError) {
                setErrorMessage((loadError as Error).message);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id, reset]);

    async function onSubmit(values: EquipmentFormValues) {
        setErrorMessage("");
        try {
            if (id) {
                const { code: _code, itemType: _itemType, ...updateInput } = values;
                await equipmentSupplyService.update(id, updateInput);
            } else {
                await equipmentSupplyService.create({
                    ...values,
                    status: values.status as EquipmentStatus,
                });
            }
            navigate("/admin/equipment", { replace: true });
        } catch (submitError) {
            setErrorMessage((submitError as Error).message);
        }
    }

    return (
        <div className="mx-auto max-w-5xl font-sans">
            <div className="mb-6">
                <div className="mb-1 text-sm font-medium text-slate-500">
                    <Link to="/admin/equipment" className="hover:text-slate-700">
                        Admin &gt; Equipment &amp; Supply
                    </Link>{" "}
                    &gt; {isEditMode ? "Edit Item" : "Add Item"}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{isEditMode ? "Edit Inventory Item" : "Add Inventory Item"}</h1>
                <p className="mt-1 text-sm text-slate-500">Maintain durable equipment and consumable supply records.</p>
            </div>

            {errorMessage && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}

            {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading inventory item...</div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Label className="mb-2 block font-semibold text-slate-700">Item Name *</Label>
                                <Input {...register("name")} placeholder="Wheelchair — Standard" />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-slate-700">Item Type *</Label>
                                <Controller
                                    control={control}
                                    name="itemType"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger disabled={isEditMode}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EQUIPMENT">Durable Equipment</SelectItem>
                                                <SelectItem value="SUPPLY">Consumable Supply</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-slate-700">Category *</Label>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(EQUIPMENT_CATEGORY).map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-slate-700">Asset / Stock Code *</Label>
                                <Input {...register("code")} disabled={isEditMode} placeholder="EQ-2001" />
                                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-slate-700">Unit *</Label>
                                <Controller
                                    control={control}
                                    name="unit"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(EQUIPMENT_UNIT).map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-slate-700">Quantity on Hand *</Label>
                                <Input type="number" min={0} {...register("quantityOnHand", { valueAsNumber: true })} />
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-slate-700">Reorder Threshold *</Label>
                                <Input type="number" min={0} {...register("reorderThreshold", { valueAsNumber: true })} />
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-slate-700">Status *</Label>
                                <Controller
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(EQUIPMENT_STATUS).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {EQUIPMENT_STATUS_LABEL[status]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate("/admin/equipment")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Item"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
