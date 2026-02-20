import { z } from 'zod';

export const createTemperatureSchema = z.object({
    body: z.object({
        equipmentId: z
            .string()
            .min(3, 'Equipment ID must be at least 3 characters long'),
        value: z.number(),
        user: z.string().min(2, 'User name must be at least 2 characters long'),
    }),
});

export type CreateTemperatureInput = z.infer<
    typeof createTemperatureSchema
>['body'];
