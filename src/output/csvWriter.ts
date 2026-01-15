import fs from 'fs/promises';
import path from 'path';
import { Transaction } from '../schema/transaction.schema';

const CSV_HEADERS = [
  'SECURITY',
  'TRADE NO',
  'TRADE DATE',
  'SETTLEMENT DATE',
  'TRANSACTION TYPE',
  'RATE',
  'QUANTITY',
  'TOTAL',
  'BROKER',
  'BROKER TOTAL'
] as const;
export async function writeCSVFile(transactions: Transaction[], outputPath: string): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  const rows = [
    CSV_HEADERS.join(','),
    ...transactions.map(txToCSVRow)
  ];

  await fs.writeFile(outputPath, rows.join('\n'), 'utf-8');
  console.log(`✓ CSV file written to ${outputPath}, ${transactions.length} transactions included.\n`);
}

function txToCSVRow(tx: Transaction): string {
  return [
    tx.security,
    tx.tradeNo.toString(),
    tx.tradeDate,
    tx.settlementDate,
    tx.transactionType,
    tx.rate.toString(),
    tx.quantity.toString(),
    tx.total.toString(),
    tx.broker.toString(),
    tx.brokerTotal.toString()
  ].join(',');
}