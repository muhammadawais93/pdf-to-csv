import * as z from 'zod';

export const TransactionSchema = z.object({
  security: z.string().min(1).max(10).toUpperCase(),
  tradeNo: z.coerce.number(),
  tradeDate: z.iso.date(),
  settlementDate: z.iso.date(),
  transactionType: z.string().toUpperCase(),
  rate: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
  broker: z.coerce.number().nonnegative(),
  brokerTotal : z.coerce.number().nonnegative(),
});

export type Transaction = z.infer<typeof TransactionSchema>;