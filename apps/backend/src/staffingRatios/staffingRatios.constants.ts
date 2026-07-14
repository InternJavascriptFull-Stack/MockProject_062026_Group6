export const DEFAULT_FACILITY_CODE = 'FAC-0042';
export const DEFAULT_CENSUS = 42;
export const DEFAULT_SCHEDULED_DIRECT_CARE_HOURS = 184.8;

export const STATE_NAMES: Record<string, string> = {
    CA: 'California',
};

export const STAFFING_SHIFT_BREAKDOWN = [
    {
        shiftName: 'Day',
        startTime: '07:00',
        endTime: '15:00',
        requiredCnaHours: 1.5,
        requiredNurseHours: 0.9,
    },
    {
        shiftName: 'Evening',
        startTime: '15:00',
        endTime: '23:00',
        requiredCnaHours: 0.7,
        requiredNurseHours: 0.5,
    },
    {
        shiftName: 'Night',
        startTime: '23:00',
        endTime: '07:00',
        requiredCnaHours: 0.5,
        requiredNurseHours: 0.3,
    },
];
