import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/authUi/input";
import { Label } from "@/components/authUi/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/authUi/select";
import {
  EQUIPMENT_CATEGORY,
  EQUIPMENT_STATUS,
  EQUIPMENT_STATUS_LABEL,
  EQUIPMENT_UNIT,
} from "@/constants/inventory";

// Fields mirror the POST/PUT /api/equipment-supplies contract (docs/API_Document.md).
const equipmentSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  code: z
    .string()
    .min(1, "Asset tag is required")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only (e.g. EQ-2001)"),
  unit: z.string().min(1, "Unit is required"),
  quantityOnHand: z
    .number({ message: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  reorderThreshold: z
    .number({ message: "Reorder threshold must be a number" })
    .int("Reorder threshold must be a whole number")
    .min(0, "Reorder threshold cannot be negative"),
  status: z.string().min(1, "Status is required"),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

export default function EquipmentForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      category: "",
      code: "",
      unit: EQUIPMENT_UNIT.ITEM,
      quantityOnHand: 0,
      reorderThreshold: 0,
      status: EQUIPMENT_STATUS.ACTIVE,
    },
  });

  const onSubmit = async (data: EquipmentFormValues) => {
    setErrorMsg("");
    try {
      // Backend not wired yet — validate + navigate back for now. When the API is ready:
      //   isEditMode
      //     ? equipmentSupplyService.update(id!, rest)
      //     : equipmentSupplyService.create(data)
      navigate("/admin/equipment", { replace: true });
    } catch (err) {
      setErrorMsg((err as Error).message || "An error occurred");
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <Link to="/admin/equipment" className="hover:text-slate-700">
            Admin
          </Link>{" "}
          &gt;{" "}
          <Link to="/admin/equipment" className="hover:text-slate-700">
            Equipment &amp; Supply
          </Link>{" "}
          &gt;{" "}
          <span className="text-slate-900">
            {isEditMode ? "Change Equipment" : "Add Equipment"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          {isEditMode ? "Change Equipment" : "Add Equipment"}
        </h1>
        <p className="text-sm text-slate-500">
          Durable Medical Equipment asset register (AD-16) — internal reference only, never
          billed per-item (§9.1).
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md font-medium text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left card (Equipment details) ── */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Equipment Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item name */}
                <div className="md:col-span-2">
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. Wheelchair — Standard"
                    className={errors.name ? "border-red-500 focus:ring-red-100" : ""}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={
                            errors.category ? "border-red-500 focus:ring-red-100" : ""
                          }
                        >
                          <SelectValue placeholder="Select category..." />
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
                  {errors.category && (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Asset tag / code */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Asset Tag <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("code")}
                    placeholder="e.g. EQ-2001"
                    disabled={isEditMode}
                    className={
                      errors.code
                        ? "border-red-500 focus:ring-red-100"
                        : isEditMode
                          ? "bg-slate-50 text-slate-500"
                          : ""
                    }
                  />
                  {errors.code ? (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">
                      {errors.code.message}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500">
                      {isEditMode
                        ? "Asset tag is fixed once created."
                        : "Unique identifier — cannot be changed later."}
                    </p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="unit"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit..." />
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

                {/* Status */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status..." />
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

                {/* Quantity on hand */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Quantity on Hand <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    {...register("quantityOnHand", { valueAsNumber: true })}
                    className={
                      errors.quantityOnHand ? "border-red-500 focus:ring-red-100" : ""
                    }
                  />
                  {errors.quantityOnHand && (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">
                      {errors.quantityOnHand.message}
                    </p>
                  )}
                </div>

                {/* Reorder threshold */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Reorder Threshold <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    {...register("reorderThreshold", { valueAsNumber: true })}
                    className={
                      errors.reorderThreshold ? "border-red-500 focus:ring-red-100" : ""
                    }
                  />
                  {errors.reorderThreshold ? (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">
                      {errors.reorderThreshold.message}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Triggers a Low Stock flag when stock drops to this level.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Right card (context) ── */}
          <Card className="shadow-sm border-slate-200 h-fit">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">About this record</h2>
              <div className="space-y-4 text-sm text-slate-700 mb-6">
                <p>1. Asset tag uniquely identifies the item in the register.</p>
                <p>2. Quantity + reorder threshold drive the stock status flag.</p>
                <p>3. Status controls whether the item appears as active stock.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-700">
                  DME used inside the facility is bundled into the per-diem rate (CMS SNF
                  Consolidated Billing, §9.1) — never billed per-item to Medicare Part A.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Action bar ── */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 pb-10">
          <Button
            type="button"
            variant="outline"
            className="px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/admin/equipment")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Equipment"
                : "Create Equipment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
