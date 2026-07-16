import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../utils/api';
import type { CarePlan, CarePlanListQuery, PaginatedResult } from '../types';

export const useCarePlans = (query: CarePlanListQuery) => {
  return useQuery({
    queryKey: ['carePlans', query],
    queryFn: async (): Promise<PaginatedResult<CarePlan>> => {
      const res: any = await apiClient.get('/care-plans');
      if (!res.success) throw new Error('Failed to fetch care plans');

      let mapped: CarePlan[] = res.data.map((cp: any) => ({
        id: cp.id,
        residentName: cp.resident
          ? `${cp.resident.firstName} ${cp.resident.lastName}`
          : 'Unknown Resident',
        room: '101A',
        locTier: 'Tier 2',
        status: cp.status.toLowerCase().replace(' ', '_') as CarePlan['status'],
        lastReview: cp.updatedAt ? new Date(cp.updatedAt).toISOString().split('T')[0] : null,
        nextReview: null,
        assigned: cp.creator ? `${cp.creator.firstName} ${cp.creator.lastName}` : 'Unassigned',
        createdAt: cp.createdAt,
      }));

      mapped.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      if (query.search) {
        const lowerSearch = query.search.toLowerCase();
        mapped = mapped.filter((cp) =>
          cp.residentName.toLowerCase().includes(lowerSearch),
        );
      }

      if (query.status && query.status !== 'all') {
        mapped = mapped.filter((cp) => cp.status === query.status);
      }

      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 5;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return { items: mapped.slice(start, end), total: mapped.length };
    },
  });
};

export const useCarePlanSummary = () => {
  return useQuery({
    queryKey: ['carePlanSummary'],
    queryFn: async () => {
      const res: any = await apiClient.get('/care-plans');
      if (!res.success) throw new Error('Failed to fetch summary');

      let draftCount = 0;
      let pendingCount = 0;
      let rejectedCount = 0;

      res.data.forEach((cp: any) => {
        const status = cp.status.toUpperCase().replace(' ', '_');
        if (status === 'DRAFT') draftCount++;
        if (status === 'PENDING_REVIEW') pendingCount++;
        if (status === 'REJECTED') rejectedCount++;
      });

      return {
        total: res.data.length,
        draftCount,
        pendingCount,
        rejectedCount,
        reviewDueCount: 0,
      };
    },
  });
};

export const useCarePlan = (id?: string) => {
  return useQuery({
    queryKey: ['carePlan', id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/care-plans/${id}`);
      if (!res.success) throw new Error('Failed to fetch care plan details');
      return res.data;
    },
    enabled: !!id,
  });
};

export const useResidents = () => {
  return useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const res: any = await apiClient.get('/care-plans/residents/list');
      if (!res.success) throw new Error('Failed to fetch residents');
      return res.data;
    },
  });
};

export const useCreateCarePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res: any = await apiClient.post('/care-plans', payload);
      if (!res.success) throw new Error(res.message || 'Failed to create');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      queryClient.invalidateQueries({ queryKey: ['carePlanSummary'] });
    },
  });
};

export const useUpdateCarePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res: any = await apiClient.put(`/care-plans/${id}`, payload);
      if (!res.success) throw new Error(res.message || 'Failed to update');
      return res.data;
    },
    onSuccess: (_data: any, { id }: { id: string; payload: any }) => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      queryClient.invalidateQueries({ queryKey: ['carePlan', id] });
      queryClient.invalidateQueries({ queryKey: ['carePlanSummary'] });
    },
  });
};

export const useCheckLocGate = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res: any = await apiClient.post('/care-plans/check-loc-gate', payload);
      return res;
    },
  });
};

export const useDonReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res: any = await apiClient.post(`/care-plans/${id}/don-review`, payload);
      if (!res.success) throw new Error(res.message || 'Failed to review');
      return res.data;
    },
    onSuccess: (_data: any, { id }: { id: string; payload: any }) => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      queryClient.invalidateQueries({ queryKey: ['carePlan', id] });
      queryClient.invalidateQueries({ queryKey: ['carePlanSummary'] });
    },
  });
};

export const useESign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res: any = await apiClient.post(`/care-plans/${id}/esign`, payload);
      if (!res.success) throw new Error(res.message || 'Failed to sign');
      return res.data;
    },
    onSuccess: (_data: any, { id }: { id: string; payload: any }) => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      queryClient.invalidateQueries({ queryKey: ['carePlan', id] });
      queryClient.invalidateQueries({ queryKey: ['carePlanSummary'] });
    },
  });
};

export const useIdtAck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res: any = await apiClient.post(`/care-plans/${id}/idt-ack`, payload);
      if (!res.success) throw new Error(res.message || 'Failed to acknowledge');
      return res.data;
    },
    onSuccess: (_data: any, { id }: { id: string; payload: any }) => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      queryClient.invalidateQueries({ queryKey: ['carePlan', id] });
    },
  });
};
