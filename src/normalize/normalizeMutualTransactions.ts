import { MutualTransaction, MutualTransactionSchema } from '../schema/mutual-transaction.schema';
import { ZodError } from 'zod';

export function normalizeMutualTransactions(transactions: MutualTransaction[]): MutualTransaction[] {
  const validatedTransactions: MutualTransaction[] = [];
  const errors: Array<{ transaction: MutualTransaction; error: ZodError }> = [];

  for (const transaction of transactions) {
    try {
      const validated = MutualTransactionSchema.parse(transaction);
      validatedTransactions.push(validated);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push({ transaction, error });
        console.error(`❌ Validation error for transaction (Date: ${transaction.date}, Fund: ${transaction.fundName}):`);
        error.issues.forEach(issue => {
          console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
        });
      }
    }
  }

  if (validatedTransactions.length) {
    console.log(`✓ Validated ${validatedTransactions.length} of ${transactions.length} transactions\n`);
  }

  if (errors.length > 0) {
    console.warn(`⚠️  ${errors.length} transaction(s) failed validation\n`);
  }

  return validatedTransactions;
}
