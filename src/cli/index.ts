import { Command } from 'commander';
import { extractTextFromPDF } from '../extract/pdfText';
import { parseBrokerPDFData } from '../parse/broker.parser';
import { normalizeTransactions } from '../normalize/normalizeTransactions';

const program = new Command();

program
  .name('pdf-to-csv')
  .description('CLI to convert PDF files to CSV format')
  .version('1.0.0');

program.command('convert')
  .description('Convert a broker statement PDF to CSV')
  .requiredOption('-i, --input <path>', 'Path to PDF file')
  .requiredOption('-b, --broker <type>', 'Broker type (interactive_brokers, IBKR, etc.)')
  .option('-o, --output <path>', 'Output CSV path (default: ./output.csv)')
  .option('--debug', 'Output raw parsed data for debugging')
  .action(async (options) => {
    const text = await extractTextFromPDF(options.input);
    const transactions = parseBrokerPDFData(text, options.debug);

    if (transactions.length === 0) {
      console.log('No transactions found to process.');
      return;
    }
    
    const normalizedTransactions = normalizeTransactions(transactions);
  });

program.parse();