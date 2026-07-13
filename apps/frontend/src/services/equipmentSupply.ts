import { session } from "../utils/session";
import { API_ROUTES } from "../constants/apiRoutes";
import type { EquipmentStatus } from "../constants/inventory";

const BASE_URL = API_ROUTES.EQUIPMENT_SUPPLIES;

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Response shape from GET /api/equipment-supplies (see docs/API_Document.md).
export interface EquipmentSupplyDTO {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  reorderThreshold: number;
  status: EquipmentStatus;
  lastUpdatedAt?: string;
}

export type EquipmentSupplyCreateInput = Omit<
  EquipmentSupplyDTO,
  "id" | "lastUpdatedAt"
>;

// Code is immutable after creation, so it is excluded from updates.
export type EquipmentSupplyUpdateInput = Omit<
  EquipmentSupplyCreateInput,
  "code"
>;

export interface EquipmentSupplyListParams {
  search?: string;
  category?: string;
  status?: string;
}

export const equipmentSupplyService = {
  /** GET /api/equipment-supplies */
  async getAll(params: EquipmentSupplyListParams = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (params.status) query.set("status", params.status);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${BASE_URL}${suffix}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch equipment supplies");
    return res.json();
  },

  /** GET /api/equipment-supplies/:id */
  async getById(id: string) {
    const res = await fetch(`${BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch equipment supply");
    return res.json();
  },

  /** POST /api/equipment-supplies */
  async create(data: EquipmentSupplyCreateInput) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create equipment supply");
    return res.json();
  },

  /** PUT /api/equipment-supplies/:id */
  async update(id: string, data: EquipmentSupplyUpdateInput) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update equipment supply");
    return res.json();
  },

  /** PATCH /api/equipment-supplies/:id/status */
  async updateStatus(id: string, status: EquipmentStatus) {
    const res = await fetch(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update equipment supply status");
    return res.json();
  },
};
