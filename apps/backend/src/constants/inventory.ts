// Shared constants for the Equipment & Supply Inventory feature (AD-16).
// Status values mirror the CHECK constraints in database/Database_SQL_Official.sql.

export const ITEM_TYPE = {
    EQUIPMENT: "EQUIPMENT",
    SUPPLY: "SUPPLY",
} as const;

export type ItemType = (typeof ITEM_TYPE)[keyof typeof ITEM_TYPE];

// durable_medical_equipment.status CHECK constraint values.
export const EQUIPMENT_STATUS = {
    AVAILABLE: "AVAILABLE",
    IN_SERVICE: "IN_SERVICE",
    UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
    RETIRED: "RETIRED",
} as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUS)[keyof typeof EQUIPMENT_STATUS];

// consumable_supplies.status CHECK constraint values.
export const SUPPLY_STATUS = {
    OK: "OK",
    LOW_STOCK: "LOW_STOCK",
    OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

export type SupplyStatus = (typeof SUPPLY_STATUS)[keyof typeof SUPPLY_STATUS];

// Prefix used to build the composite public id ("equipment-12" / "supply-7").
export const ITEM_ID_PREFIX = {
    EQUIPMENT: "equipment",
    SUPPLY: "supply",
} as const;
