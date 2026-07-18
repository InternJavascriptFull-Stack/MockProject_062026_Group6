import * as z from "zod";

export const generalSettingsSchema = z.object({
    name: z.string().trim().min(1, "Facility name is required."),
    licenseNumber: z.string().trim().min(1, "License number is required."),
    targetState: z.string().trim().min(1, "Target state is required.").max(2, "Use the 2-letter state code."),
    timezone: z.string().trim().min(1, "Timezone is required."),
    phoneNumber: z.string(),
});
