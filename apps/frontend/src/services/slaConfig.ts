import { session } from "../utils/session";
import { API_ROUTES } from "../constants/apiRoutes";

const BASE_URL = API_ROUTES.SLA_CONFIGURATIONS;

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Response shape from GET /api/sla-configurations (see docs/API_Document.md).
// slaWindowHrs is null when no external report is required (e.g. Minor).
export interface SlaConfigDTO {
  id: number;
  severity: {
    id: number;
    levelName: string;
  };
  slaWindowHrs: number | null;
}

export interface SlaConfigUpdateInput {
  slaWindowHrs: number | null;
}

export const slaConfigService = {
  /** GET /api/sla-configurations */
  async getAll() {
    const res = await fetch(BASE_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch SLA configurations");
    return res.json();
  },

  /** PUT /api/sla-configurations/:id */
  async update(id: number, data: SlaConfigUpdateInput) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update SLA configuration");
    return res.json();
  },
};
