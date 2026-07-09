import React, { useEffect, useState } from "react";
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

const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Must be a valid email (RFC-5322)"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+[1-9]\d{1,14}$/.test(val), {
      message: "Must be a valid E.164 phone number (e.g. +14155550100)",
    }),
  role: z.string().min(1, "Role is required"),
  facility: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "",
      facility: "None",
    },
  });

  // Mock fetching data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      // Mock user data fetch
      setTimeout(() => {
        reset({
          fullName: "Denise Carter",
          email: "denise.carter@nhms.io",
          phone: "+14155550142",
          role: "DON",
          facility: "None",
        });
      }, 500);
    }
  }, [isEditMode, reset]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
      navigate("/admin/users", { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusValue = isEditMode ? "Active" : "Invited";

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-500 mb-1">
          <Link to="/admin/users" className="hover:text-slate-700">Admin</Link> &gt;{" "}
          <Link to="/admin/users" className="hover:text-slate-700">Users</Link> &gt;{" "}
          <span className="text-slate-900">{isEditMode ? "Edit User" : "Add User"}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          {isEditMode ? "Edit User" : "Add User"}
        </h1>
        {!isEditMode && (
          <p className="text-sm text-slate-500">
            New accounts start as Invited — user completes activation via emailed link (§5G)
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Card (Account Details) ── */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Account Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Full Name */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("fullName")}
                    placeholder="e.g. Priya Shah"
                    className={errors.fullName ? "border-red-500 focus:ring-red-100" : ""}
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("email")}
                    placeholder="name@nhms.io"
                    className={errors.email ? "border-red-500 focus:ring-red-100" : ""}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">Phone (E.164)</Label>
                  <Input
                    {...register("phone")}
                    placeholder="+1 415-555-0100"
                    className={errors.phone ? "border-red-500 focus:ring-red-100" : ""}
                  />
                  {errors.phone ? (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.phone.message}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Optional now — required when user activates account (§5G.2).
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={errors.role ? "border-red-500 focus:ring-red-100" : ""}>
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNA">CNA</SelectItem>
                          <SelectItem value="Nurse">Nurse</SelectItem>
                          <SelectItem value="DON">DON</SelectItem>
                          <SelectItem value="NHA">NHA</SelectItem>
                          <SelectItem value="Admission">Admission</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="System Admin">System Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role ? (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.role.message}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Available roles: CNA · Nurse · DON · NHA · Admission · Billing · System Admin
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">Status</Label>
                  <Input value={statusValue} disabled className="bg-slate-50 text-slate-500 font-medium" />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {isEditMode 
                      ? "Current account status." 
                      : "System-set on creation — becomes Active after user completes activation (AD-00b)."}
                  </p>
                </div>

                {/* Assigned Facility */}
                <div>
                  <Label className="block mb-2 font-semibold text-slate-700">Assigned Facility (optional)</Label>
                  <Controller
                    control={control}
                    name="facility"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Facility A">Facility A</SelectItem>
                          <SelectItem value="Facility B">Facility B</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Identity field contract (§5G.2): Email must be unique and RFC-5322 valid; Phone must be E.164 and unique once set. Same fields, same validation across AD-00/00b/01.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Right Card (What happens next) ── */}
          <Card className="shadow-sm border-slate-200 h-fit">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">What happens next</h2>
              
              <div className="space-y-4 text-sm text-slate-700 mb-6">
                <p>1. User receives an invite link by email</p>
                <p>2. Sets password + confirms phone (AD-00b)</p>
                <p>3. 2FA status becomes Enabled</p>
                <p>4. Status changes Invited &rarr; Active</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-700">
                  Login accepts whichever identifier was registered — Email OR Phone (§5G Q3).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 pb-10">
          <Button
            type="button"
            variant="outline"
            className="px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/admin/users")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
