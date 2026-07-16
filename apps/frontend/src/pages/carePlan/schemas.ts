import { z } from 'zod';

export const careAreaSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  goal: z.string().min(1, 'Goal is required'),
  measure: z.string().optional(),
  target: z.string().optional(),
});

export const taskSchema = z.object({
  task: z.string().min(1, 'Task description is required'),
  freq: z.string().optional(),
  owner: z.string().min(1, 'Role is required'),
});

export const createCarePlanSchema = z.object({
  residentId: z.string().uuid('Please select a resident'),
  careAreas: z.array(careAreaSchema).min(1, 'At least one Care Area is required'),
  tasks: z.array(taskSchema).optional(),
});

export type CreateCarePlanFormValues = z.infer<typeof createCarePlanSchema>;
export type CareAreaFormValue = z.infer<typeof careAreaSchema>;
export type TaskFormValue = z.infer<typeof taskSchema>;
