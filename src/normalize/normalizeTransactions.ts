import { Transaction, TransactionSchema } from '../schema/transaction.schema';

export function normalizeTransactions(transactions: Transaction[]): Transaction[] {
  const validatedTransactions: Transaction[] = [];

  for (const transaction of transactions) {
    try {
      const validated = TransactionSchema.parse(transaction);
      validatedTransactions.push(validated);
    } catch (error) {
      console.error('Validation error for transaction:', transaction, error);
    }
  }

  if(validatedTransactions.length) {
    console.log(`✓ Validated ${validatedTransactions.length} of ${transactions.length} transactions\n`);
  }

  return validatedTransactions;
}