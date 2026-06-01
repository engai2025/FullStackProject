import { z } from 'zod';

export const expenseValidationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    category: z.enum(['food', 'rent', 'transport', 'utilities', 'entertainment', 'shopping', 'health', 'other']).optional(),
    description: z.string().optional(),
    date: z.string().optional()
})
