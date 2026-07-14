import { session } from "../utils/session";
import { API_ROUTES } from "../constants/apiRoutes";

const BASE_URL = API_ROUTES.INCIDENT_SEVERITIES;

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Response shape from GET /api/incident-severities (see docs/API_Document.md).
export interface IncidentSeverityDTO {
  id: number;
  levelName: string;
  chartLockTrigger: boolean;
}

export type IncidentSeverityUpdateInput = Partial<
  Omit<IncidentSeverityDTO, "id">
>;

export const incidentSeverityService = {
  /** GET /api/incident-severities */
  async getAll() {
    const res = await fetch(BASE_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch incident severities");
    return res.json();
  },

  /** PUT /api/incident-severities/:id */
  async update(id: number, data: IncidentSeverityUpdateInput) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update incident severity");
    return res.json();
  },
};
