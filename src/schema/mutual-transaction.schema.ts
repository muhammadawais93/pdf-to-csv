import * as z from 'zod';

export const MutualTransactionSchema = z.object({
  date: z.string(), // ISO date string YYYY-MM-DD
  fundName: z.string().min(1),
  type: z.string().min(1),
  units: z.coerce.number(),
  nav: z.coerce.number().nonnegative(),
  grossAmount: z.coerce.number(),
  load: z.coerce.number(),
  charges: z.coerce.number(),
  cgt: z.coerce.number(),
  netAmount: z.coerce.number(),
  openingUnits: z.coerce.number(),
  closingUnits: z.coerce.number(),
});

export type MutualTransaction = z.infer<typeof MutualTransactionSchema>;
