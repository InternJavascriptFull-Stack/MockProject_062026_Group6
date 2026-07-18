import type { UseFormReturn } from "react-hook-form";
import { usTimezoneOptions } from "./facilitySettings.constants";
import type { FacilityGeneralForm } from "./facilitySettings.types";
import { SelectField, TextField } from "./Fields";

export function GeneralSettingsTab({
    form,
    facilityCode,
}: {
    form: UseFormReturn<FacilityGeneralForm>;
    facilityCode: string;
}) {
    const values = form.watch();
    const errors = form.formState.errors;

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">General Info</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                    label="Facility name"
                    value={values.name}
                    onChange={(value) => form.setValue("name", value, { shouldDirty: true, shouldValidate: true })}
                    error={errors.name?.message}
                />
                <TextField label="facility_id" value={`${facilityCode} (read-only)`} readOnly />
                <SelectField
                    label="Timezone"
                    value={values.timezone}
                    options={usTimezoneOptions}
                    onChange={(value) => form.setValue("timezone", value, { shouldDirty: true, shouldValidate: true })}
                    error={errors.timezone?.message}
                />
                <TextField
                    label="Target state"
                    value={values.targetState}
                    onChange={(value) => form.setValue("targetState", value.toUpperCase(), { shouldDirty: true, shouldValidate: true })}
                    maxLength={2}
                    error={errors.targetState?.message}
                />
                <TextField
                    label="License #"
                    value={values.licenseNumber}
                    onChange={(value) => form.setValue("licenseNumber", value, { shouldDirty: true, shouldValidate: true })}
                    error={errors.licenseNumber?.message}
                />
                <TextField
                    label="Phone"
                    value={values.phoneNumber}
                    onChange={(value) => form.setValue("phoneNumber", value, { shouldDirty: true, shouldValidate: true })}
                />
            </div>
        </section>
    );
}
