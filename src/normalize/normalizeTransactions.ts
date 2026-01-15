import { Transaction, TransactionSchema } from '../schema/transaction.schema';
import { ZodError } from 'zod';

export function normalizeTransactions(transactions: Transaction[]): Transaction[] {
  const validatedTransactions: Transaction[] = [];
  const errors: Array<{ transaction: Transaction; error: ZodError }> = [];

  for (const transaction of transactions) {
    try {
      const validated = TransactionSchema.parse(transaction);
      validatedTransactions.push(validated);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push({ transaction, error });
        console.error(`❌ Validation error for transaction (Trade No: ${transaction.tradeNo}):`);
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