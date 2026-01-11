import { Transaction, TransactionSchema } from '../schema/transaction.schema.js';

export function parseBrokerPDFData(text: string, debug = false): Transaction[] {
  const lines = text.split('\n');
  const transactions: Transaction[] = [];

  // Pattern: Security symbol (letters) + Trade number (digits) + dates + type (any word) + numbers
  // More flexible - doesn't restrict the Type field
  const transactionRegex = /^([A-Z]+)\s+(\d+)\s+(\d{4}-\d{2}-\d{2})\s+(\d{4}-\d{2}-\d{2})\s+([A-Z]+)\s+([\d.\s]+)$/;

  for (const line of lines) {
    const match = line.match(transactionRegex);

    if (!match) {
      if (debug && line.trim()) { // Only log non-empty lines in debug mode
        console.warn(`Skipped: ${line}`);
      }
      continue;
    }

    const [, security, tradeNo, tradeDate, settlementDate, transactionType, remaining] = match;
    const [rate, quantity, total, broker, brokerTotal] = remaining.trim().split(/\s+/).map(Number);

    transactions.push({
      security,
      tradeNo: Number(tradeNo),
      tradeDate,
      settlementDate,
      transactionType,
      rate ,
      quantity,
      total,
      broker,
      brokerTotal,
    });
  }

  return transactions;
}