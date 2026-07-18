// Shared constant objects for the Equipment & Supply Inventory feature (AD-16).
// Status values mirror the CHECK constraints in database/Database_SQL_Official.sql,
// which differ per item type (durable equipment vs consumable supplies).

export const ITEM_TYPE = {
    EQUIPMENT: "EQUIPMENT",
    SUPPLY: "SUPPLY",
} as const;

export type ItemType = (typeof ITEM_TYPE)[keyof typeof ITEM_TYPE];

// durable_medical_equipment.status
export const EQUIPMENT_STATUS = {
    AVAILABLE: "AVAILABLE",
    IN_SERVICE: "IN_SERVICE",
    UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
    RETIRED: "RETIRED",
} as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUS)[keyof typeof EQUIPMENT_STATUS];

// consumable_supplies.status
export const SUPPLY_STATUS = {
    OK: "OK",
    LOW_STOCK: "LOW_STOCK",
    OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

export type SupplyStatus = (typeof SUPPLY_STATUS)[keyof typeof SUPPLY_STATUS];

export type InventoryStatus = EquipmentStatus | SupplyStatus;

// Human-readable labels for every status value across both item types.
export const INVENTORY_STATUS_LABEL: Record<InventoryStatus, string> = {
    AVAILABLE: "Available",
    IN_SERVICE: "In Service",
    UNDER_MAINTENANCE: "Under Maintenance",
    RETIRED: "Retired",
    OK: "OK",
    LOW_STOCK: "Low Stock",
    OUT_OF_STOCK: "Out of Stock",
};

// Equipment categories seen across the DME and Consumable mockups (AD-16).
export const EQUIPMENT_CATEGORY = {
    MOBILITY: "Mobility",
    POSITIONING: "Positioning",
    RESPIRATORY: "Respiratory",
    INCONTINENCE: "Incontinence",
    WOUND_CARE: "Wound Care",
    PPE: "PPE",
    NUTRITION: "Nutrition",
} as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORY)[keyof typeof EQUIPMENT_CATEGORY];

// Stock-keeping units used by consumable supplies.
export const EQUIPMENT_UNIT = {
    ITEM: "item",
    BOX: "box",
    PAIR: "pair",
    CASE: "case",
    UNIT: "unit",
} as const;

export type EquipmentUnit = (typeof EQUIPMENT_UNIT)[keyof typeof EQUIPMENT_UNIT];
