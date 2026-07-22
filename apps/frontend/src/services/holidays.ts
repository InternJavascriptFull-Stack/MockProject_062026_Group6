import { apiClient } from './apiClient';

export interface StateHoliday {
  id: string;
  facilityId: string;
  name: string;
  dateType: 'FIXED' | 'FLOATING' | string;
  month?: number;
  day?: number;
  floatingRule?: string;
  repeatsAnnually: boolean;
  isActive: boolean;
  isFederalReadOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FederalHoliday {
  id: string;
  name: string;
  dateType: 'FIXED' | 'FLOATING' | string;
  month?: number;
  day?: number;
  floatingRule?: string;
  repeatsAnnually: boolean;
  isActive: boolean;
  isFederalReadOnly: true;
}

export interface FacilityHolidaysResponse {
  facilityId: string;
  activeState: string;
  stateHolidays: StateHoliday[];
  federalHolidays: FederalHoliday[];
}

export interface CreateHolidayPayload {
  name: string;
  dateType: 'FIXED' | 'FLOATING';
  month?: number;
  day?: number;
  floatingRule?: string;
  repeatsAnnually?: boolean;
}

export const holidaysService = {
  getHolidays: async (facilityId: string = 'FAC-0042'): Promise<FacilityHolidaysResponse> => {
    const res = await apiClient.get(`/facilities/${facilityId}/holidays`);
    return res.data;
  },

  createStateHoliday: async (facilityId: string, payload: CreateHolidayPayload): Promise<StateHoliday> => {
    const res = await apiClient.post(`/facilities/${facilityId}/holidays`, payload);
    return res.data;
  },

  updateStateHoliday: async (facilityId: string, id: string, payload: Partial<CreateHolidayPayload> & { isActive?: boolean }): Promise<StateHoliday> => {
    const res = await apiClient.put(`/facilities/${facilityId}/holidays/${id}`, payload);
    return res.data;
  },

  toggleHolidayStatus: async (facilityId: string, id: string): Promise<StateHoliday> => {
    const res = await apiClient.patch(`/facilities/${facilityId}/holidays/${id}/toggle`);
    return res.data;
  },
};
