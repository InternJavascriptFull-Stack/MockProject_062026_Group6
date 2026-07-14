// Shared constant objects for the Equipment & Supply Inventory feature (AD-16).
// Declared with `as const` for strict read-only typing (coding-standards §VI).

export const EQUIPMENT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  DISCONTINUED: "DISCONTINUED",
} as const;

export type EquipmentStatus =
  (typeof EQUIPMENT_STATUS)[keyof typeof EQUIPMENT_STATUS];

// Human-readable labels for each status value.
export const EQUIPMENT_STATUS_LABEL: Record<EquipmentStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  OUT_OF_STOCK: "Out of stock",
  DISCONTINUED: "Discontinued",
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

export type EquipmentCategory =
  (typeof EQUIPMENT_CATEGORY)[keyof typeof EQUIPMENT_CATEGORY];

// Stock-keeping units used by the Add/Change Equipment form.
export const EQUIPMENT_UNIT = {
  ITEM: "item",
  BOX: "box",
  PAIR: "pair",
  CASE: "case",
  UNIT: "unit",
} as const;

export type EquipmentUnit =
  (typeof EQUIPMENT_UNIT)[keyof typeof EQUIPMENT_UNIT];
