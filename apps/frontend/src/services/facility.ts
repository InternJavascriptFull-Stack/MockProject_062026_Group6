import { session } from '../utils/session';

const BASE_URL = '/api/facilities';

const getHeaders = () => {
  const token = session.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const facilityService = {
  async getFacilities() {
    const res = await fetch(BASE_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
  }
};
