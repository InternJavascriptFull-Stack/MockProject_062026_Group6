import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/authUi/input";
import { Label } from "@/components/authUi/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/authUi/select";
import {
    EQUIPMENT_CATEGORY,
    EQUIPMENT_STATUS,
    EQUIPMENT_UNIT,
    INVENTORY_STATUS_LABEL,
    ITEM_TYPE,
    SUPPLY_STATUS,
    type InventoryStatus,
} from "@/constants/inventory";
import { equipmentSupplyService } from "@/services/equipmentSupply";

// Business rules per item type (AD-16): durable equipment carries an asset tag
// but no stock fields; consumable supplies track stock but get a generated code.
const equipmentSchema = z
    .object({
        itemType: z.enum([ITEM_TYPE.EQUIPMENT, ITEM_TYPE.SUPPLY]),
        name: z.string().min(1, "Item name is required"),
        category: z.string().min(1, "Category is required"),
        code: z.string(),
        unit: z.string(),
        quantityOnHand: z.number({ message: "Quantity must be a number" }).int().min(0, "Quantity cannot be negative"),
        reorderThreshold: z.number({ message: "Threshold must be a number" }).int().min(0, "Threshold cannot be negative"),
        status: z.string().min(1, "Status is required"),
    })
    .superRefine((values, ctx) => {
        if (values.itemType === ITEM_TYPE.EQUIPMENT) {
            if (!values.code.trim()) {
                ctx.addIssue({ code: "custom", path: ["code"], message: "Asset tag is required for equipment" });
            } else if (!/^[A-Za-z0-9-]+$/.test(values.code)) {
                ctx.addIssue({ code: "custom", path: ["code"], message: "Use letters, numbers and dashes only" });
            }
            if (!(values.status in EQUIPMENT_STATUS)) {
                ctx.addIssue({ code: "custom", path: ["status"], message: "Select an equipment status" });
            }
        } else {
            if (!values.unit.trim()) {
                ctx.addIssue({ code: "custom", path: ["unit"], message: "Unit is required for supplies" });
            }
            if (!(values.status in SUPPLY_STATUS)) {
                ctx.addIssue({ code: "custom", path: ["status"], message: "Select a supply status" });
            }
        }
    });

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const DEFAULT_VALUES: EquipmentFormValues = {
    itemType: ITEM_TYPE.EQUIPMENT,
    name: "",
    category: "",
    code: "",
    unit: EQUIPMENT_UNIT.UNIT,
    quantityOnHand: 0,
    reorderThreshold: 0,
    status: EQUIPMENT_STATUS.AVAILABLE,
};

export default function EquipmentForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EquipmentFormValues>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: DEFAULT_VALUES,
    });

    const itemType = watch("itemType");
    const isEquipment = itemType === ITEM_TYPE.EQUIPMENT;
    const statusOptions = Object.values(isEquipment ? EQUIPMENT_STATUS : SUPPLY_STATUS);

    const itemQuery = useQuery({
        queryKey: ["equipment-supply", id],
        queryFn: () => equipmentSupplyService.getById(id as string),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (!itemQuery.data) return;
        const item = itemQuery.data;
        reset({
            itemType: item.itemType,
            name: item.name,
            category: item.category,
            code: item.code,
            unit: item.unit,
            quantityOnHand: item.quantityOnHand,
            reorderThreshold: item.reorderThreshold,
            status: item.status,
        });
    }, [itemQuery.data, reset]);

    const saveMutation = useMutation({
        mutationFn: (values: EquipmentFormValues) => {
            const status = values.status as InventoryStatus;
            if (id) {
                return equipmentSupplyService.update(id, {
                    name: values.name,
                    category: values.category,
                    status,
                    ...(values.itemType === ITEM_TYPE.SUPPLY
                        ? { quantityOnHand: values.quantityOnHand, reorderThreshold: values.reorderThreshold }
                        : {}),
                });
            }
            return equipmentSupplyService.create(
                values.itemType === ITEM_TYPE.EQUIPMENT
                    ? { itemType: values.itemType, name: values.name, category: values.category, code: values.code, status }
                    : {
                          itemType: values.itemType,
                          name: values.name,
                          category: values.category,
                          unit: values.unit,
                          quantityOnHand: values.quantityOnHand,
                          reorderThreshold: values.reorderThreshold,
                          status,
                      },
            );
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["equipment-supplies"] });
            if (id) await queryClient.invalidateQueries({ queryKey: ["equipment-supply", id] });
            navigate("/admin/equipment", { replace: true });
        },
    });

    // Each item type has its own valid status list, so switching type resets status.
    function handleItemTypeChange(nextType: string) {
        setValue("itemType", nextType as EquipmentFormValues["itemType"], { shouldDirty: true });
        setValue("status", nextType === ITEM_TYPE.EQUIPMENT ? EQUIPMENT_STATUS.AVAILABLE : SUPPLY_STATUS.OK, { shouldDirty: true });
    }

    function onSubmit(values: EquipmentFormValues) {
        saveMutation.mutate(values);
    }

    const loadErrorMessage = itemQuery.error ? (itemQuery.error as Error).message : "";
    const saveErrorMessage = saveMutation.error ? (saveMutation.error as Error).message : "";

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

            {(loadErrorMessage || saveErrorMessage) && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadErrorMessage || saveErrorMessage}</div>
            )}

            {isEditMode && itemQuery.isLoading ? (
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
                                        <Select value={field.value} onValueChange={handleItemTypeChange}>
                                            <SelectTrigger disabled={isEditMode}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ITEM_TYPE.EQUIPMENT}>Durable Equipment</SelectItem>
                                                <SelectItem value={ITEM_TYPE.SUPPLY}>Consumable Supply</SelectItem>
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

                            {isEquipment && (
                                <div>
                                    <Label className="mb-2 block font-semibold text-slate-700">Asset Tag *</Label>
                                    <Input {...register("code")} disabled={isEditMode} placeholder="EQ-2001" />
                                    {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                                </div>
                            )}

                            {!isEquipment && (
                                <>
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
                                        {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>}
                                    </div>

                                    <div>
                                        <Label className="mb-2 block font-semibold text-slate-700">Quantity on Hand *</Label>
                                        <Input type="number" min={0} {...register("quantityOnHand", { valueAsNumber: true })} />
                                        {errors.quantityOnHand && <p className="mt-1 text-sm text-red-600">{errors.quantityOnHand.message}</p>}
                                    </div>

                                    <div>
                                        <Label className="mb-2 block font-semibold text-slate-700">Reorder Threshold *</Label>
                                        <Input type="number" min={0} {...register("reorderThreshold", { valueAsNumber: true })} />
                                        {errors.reorderThreshold && <p className="mt-1 text-sm text-red-600">{errors.reorderThreshold.message}</p>}
                                    </div>
                                </>
                            )}

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
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {INVENTORY_STATUS_LABEL[status]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate("/admin/equipment")} disabled={saveMutation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? "Saving..." : "Save Item"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
