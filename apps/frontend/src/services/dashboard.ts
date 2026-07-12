import { session } from "../utils/session";

const BASE_URL = "/api/dashboard";

export const dashboardService = {
  async getNurseDashboard() {
    const token = session.getAccessToken();
    const res = await fetch(`${BASE_URL}/nurse`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) { session.clear(); window.location.href = '/login'; }
    if (!res.ok) return { success: false };
    return res.json();
  },
  async getDonDashboard() {
    const token = session.getAccessToken();
    const res = await fetch(`${BASE_URL}/don`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) { session.clear(); window.location.href = '/login'; }
    if (!res.ok) return { success: false };
    return res.json();
  },
  async getCnaDashboard() {
    const token = session.getAccessToken();
    const res = await fetch(`${BASE_URL}/cna`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) { session.clear(); window.location.href = '/login'; }
    if (!res.ok) return { success: false };
    return res.json();
  },
  async getSummaryDashboard() {
    const token = session.getAccessToken();
    const res = await fetch(`${BASE_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) { session.clear(); window.location.href = '/login'; }
    if (!res.ok) return { success: false };
    return res.json();
  }
};
