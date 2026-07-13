import { session } from "../utils/session";

const BASE_URL = "/api/incidents";

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const incidentsService = {
  async getIncidentById(id: string) {
    const res = await fetch(`${BASE_URL}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch incident details");
    return res.json();
  },

  async lockChart(id: string, reason: string) {
    const res = await fetch(`${BASE_URL}/${id}/lock-chart`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to lock chart");
    }
    return res.json();
  },

  async unlockChart(id: string, reason: string, passwordConfirm: string) {
    const res = await fetch(`${BASE_URL}/${id}/unlock-chart`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ reason, passwordConfirm })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to unlock chart");
    }
    return res.json();
  }
};
