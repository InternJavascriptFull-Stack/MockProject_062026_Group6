import { session } from "../utils/session";

const BASE_URL = "/api/demo-data";

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const demoDataService = {
  async getStatus() {
    const res = await fetch(`${BASE_URL}/status`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to get status");
    return res.json();
  },

  async seedAll() {
    const res = await fetch(`${BASE_URL}/seed`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to seed demo data");
    return res.json();
  },

  async resetAll() {
    const res = await fetch(`${BASE_URL}/reset`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to reset demo data");
    return res.json();
  },

  async loadDataset(dataset: string) {
    const res = await fetch(`${BASE_URL}/load/${dataset}`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to load dataset: ${dataset}`);
    return res.json();
  },

  async clearDataset(dataset: string) {
    const res = await fetch(`${BASE_URL}/clear/${dataset}`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to clear dataset: ${dataset}`);
    return res.json();
  }
};
