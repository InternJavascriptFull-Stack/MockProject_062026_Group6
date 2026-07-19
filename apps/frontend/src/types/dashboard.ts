export interface AssignedResidentDueSoon {
    resident: string;
    room: string;
    task: string;
    status: string;
    type: "overdue" | "warning" | "success" | "neutral";
}

export interface OpenIncident {
    type: string;
    resident: string;
    room: string;
    detail: string;
    severity: string;
}

export interface NurseDashboardData {
    assessmentsDue: number;
    locAwaitingConfirm: number;
    carePlansToSubmit: number;
    reassessmentsDue: number;
    assignedResidentsDueSoon: AssignedResidentDueSoon[];
    openIncidents: OpenIncident[];
}

export interface CarePlanPendingReview {
    id: string;
    resident: string;
    room: string;
    submittedBy: string;
    submittedDate: string;
    locTier: string;
    waiting: string;
}

export interface LocTierCount {
    label: string;
    count: number;
}

export interface DonDashboardData {
    pendingReview: number;
    openIncidents: number;
    reassessmentsDue: number;
    complianceAlerts: number;
    staffingAlert?: string;
    carePlansPendingReview: CarePlanPendingReview[];
    censusAndLocMix: {
        current: number;
        total: number;
        occupancyRate: number;
        tiers: LocTierCount[];
    };
    billingSnapshot: {
        estDailyRevenue: number;
        estMonthlyRevenue: number;
        pendingAuthorizations: number;
        medicare100DayCapAlerts: number;
    };
}

export interface UpcomingTask {
    id: string;
    resident: string;
    room: string;
    task: string;
    due: string;
    status: string;
}

export interface CnaDashboardData {
    todaysTasks: {
        completed: number;
        total: number;
    };
    abnormalFlagsReported: number;
    assignedResidents: number;
    shiftInfo: string;
    shiftTime: string;
    upcomingTasks: UpcomingTask[];
}
