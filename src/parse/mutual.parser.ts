import { MutualTransaction } from '../schema/mutual-transaction.schema';

const TYPE_MAPPING: Record<string, string> = {
  'Additional Purchase': 'BUY',
  'Initial Purchase': 'BUY',
  'Redemption Withdrawal': 'SELL',
  'Redemption (Withdrawal)': 'SELL',
  'Redemption': 'SELL',
  'Reinvested Dividend': 'DIVR',
  'Cash Dividend': 'DIV',
  'Capital Repayment on Dividend': 'CAP_REPAY',
  'Special Dividend - net of tax': 'SPEC_DIV',
};

function convertDate(dateStr: string): string {
  const months: Record<string, string> = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12',
  };

  // Handle both "DD MMM YYYY" and "DD-MMM-YYYY"
  const normalized = dateStr.trim().replace(/\s+/g, '-');
  const parts = normalized.split('-');
  if (parts.length !== 3) return dateStr;

  const day = parts[0].padStart(2, '0');
  const month = months[parts[1].toUpperCase()] ?? '01';
  const year = parts[2];

  return `${year}-${month}-${day}`;
}

function cleanNumber(value: string): number {
  const cleaned = (value ?? '').replace(/,/g, '').trim();
  return cleaned === '' ? 0 : parseFloat(cleaned);
}

function mapType(rawType: string): string {
  // Remove parenthetical fund codes like (AISF), (AIIF), etc.
  const cleanType = rawType.replace(/\s*\([A-Z]+\)\s*$/i, '').trim();
  return TYPE_MAPPING[cleanType] ?? cleanType;
}

const KNOWN_FUND_NAMES = [
  'Al Ameen Islamic Aggressive Income Fund',
  'Al Ameen Islamic Aggressive Income Plan I',
  'Al Ameen Islamic Asset Allocation Fund',
  'Al Ameen Islamic Cash Fund',
  'Al Ameen Islamic Cash Plan I',
  'Al Ameen Islamic Energy Fund',
  'Al Ameen Islamic Income Fund',
  'Al Ameen Islamic Sovereign Fund',
  'Al Ameen Shariah Stock Fund',
  // Defunct fund - kept for parsing historical statements
  'Al Ameen Islamic Mahana Munafa Plan',
];

function extractFundName(cellText: string): string | null {
  // Normalize: uppercase, remove hyphens, collapse whitespace
  const normalize = (text: string) => 
    text.toUpperCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  
  const normalizedCell = normalize(cellText);
  
  for (const name of KNOWN_FUND_NAMES) {
    const normalizedName = normalize(name);
    if (normalizedCell.includes(normalizedName)) return name;
  }
  return null;
}

const DATE_PATTERN = /^\d{2}[-\s][A-Z]{3}[-\s]\d{4}$/i;

/**
 * Parse tables extracted by pdf-parse's getTable() method.
 * Two formats:
 *   Format A (pages 1/2 + page3 table0): 11 cells, no fund name in row
 *     [ledgerDate, navDate, type, gross, load, charges, cgt, net, nav, units, closingBalance]
 *   Format B (page3 table1 - MAHANA MUNAFA): 11 cells, fund name IS in row
 *     [ledgerDate, navDate, fundName, type, gross, load, charges, cgt, net, nav, units]
 */
export function parseMutualTableData(tables: string[][][], debug = false): MutualTransaction[] {
  const transactions: MutualTransaction[] = [];

  for (const table of tables) {
    let currentFund = '';

    for (const row of table) {
      // Fund section headers can be extracted as a single cell or as a padded 11-cell row.
      const firstCell = (row[0] ?? '').trim();
      const sectionFund = extractFundName(firstCell);
      if (sectionFund && !DATE_PATTERN.test(firstCell)) {
        currentFund = sectionFund;
        if (debug) console.log(`\n📁 Fund section: ${currentFund}`);
        continue;
      }

      // --- Must have exactly 11 cells ---
      if (row.length !== 11) continue;

      const [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10] = row;

      // Detect Format B: cell[0] is DD-MMM-YYYY AND cell[2] is a known fund name
      const isFormatB = DATE_PATTERN.test(c0.trim()) && extractFundName(c2) !== null;

      let ledgerDate: string;
      let fundName: string;
      let transactionType: string;
      let gross: number;
      let load: number;
      let charges: number;
      let cgt: number;
      let net: number;
      let nav: number;
      let units: number;
      let closingUnits: number;
      let openingUnits: number;

      if (isFormatB) {
        // Format B: [date, navDate, fundName, type, gross, load, charges, cgt, net, nav, units]
        ledgerDate = c0; // Use NAV date (DD-MMM-YYYY) — more precise
        fundName = extractFundName(c2) ?? c2;
        transactionType = c3;
        gross = cleanNumber(c4);
        load = cleanNumber(c5);
        charges = cleanNumber(c6);
        cgt = cleanNumber(c7);
        net = cleanNumber(c8);
        nav = cleanNumber(c9);
        units = cleanNumber(c10);
        closingUnits = units;
        openingUnits = 0;
      } else {
        // Format A: [ledgerDate, navDate, type, gross, load, charges, cgt, net, nav, units, closingBalance]
        if (!DATE_PATTERN.test(c0.trim())) continue; // Skip non-transaction rows (footers, summaries)
        if (!currentFund) {
          if (debug) console.warn(`⚠️  Skipping row — no active fund section: ${JSON.stringify(row)}`);
          continue;
        }

        ledgerDate = c0; // Use NAV date (DD-MMM-YYYY) — more precise
        fundName = currentFund;
        transactionType = c2;
        gross = cleanNumber(c3);
        load = cleanNumber(c4);
        charges = cleanNumber(c5);
        cgt = cleanNumber(c6);
        net = cleanNumber(c7);
        nav = cleanNumber(c8);
        units = cleanNumber(c9); // Empty for Cash Dividend → 0
        closingUnits = cleanNumber(c10);
        openingUnits = closingUnits - units;
      }

      if (!fundName) {
        if (debug) console.warn(`⚠️  Skipping row — no fund name resolved: ${JSON.stringify(row)}`);
        continue;
      }

      const tx: MutualTransaction = {
        date: convertDate(ledgerDate),
        fundName,
        type: mapType(transactionType),
        units,
        nav,
        grossAmount: gross,
        load,
        charges,
        cgt,
        netAmount: net,
        openingUnits,
        closingUnits,
      };

      if (debug) {
        console.log(`✅ ${tx.date} | ${tx.fundName} | ${tx.type} | units=${tx.units} | nav=${tx.nav}`);
      }

      transactions.push(tx);
    }
  }

  return transactions;
}

