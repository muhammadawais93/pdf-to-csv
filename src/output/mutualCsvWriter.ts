import fs from 'fs/promises';
import path from 'path';
import { MutualTransaction } from '../schema/mutual-transaction.schema';

const CSV_HEADERS = [
  'Date',
  'Fund Name',
  'Type',
  'Units',
  'NAV',
  'Gross Amount',
  'Load',
  'Charges',
  'CGT',
  'Net Amount',
  'Opening Units',
  'Closing Units'
] as const;

export async function writeMutualCSVFile(transactions: MutualTransaction[], outputPath: string): Promise<void> {
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

function txToCSVRow(tx: MutualTransaction): string {
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return [
    tx.date,
    tx.fundName,
    tx.type,
    round(tx.units).toString(),
    round(tx.nav).toString(),
    round(tx.grossAmount).toString(),
    round(tx.load).toString(),
    round(tx.charges).toString(),
    round(tx.cgt).toString(),
    round(tx.netAmount).toString(),
    round(tx.openingUnits).toString(),
    round(tx.closingUnits).toString()
  ].join(',');
}
