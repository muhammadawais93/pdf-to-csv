import { Command } from 'commander';
import { extractTextFromPDF, extractTablesFromPDF } from '../extract/pdfText';
import { parseBrokerPDFData } from '../parse/broker.parser';
import { normalizeTransactions } from '../normalize/normalizeTransactions';
import { writeCSVFile } from '../output/csvWriter';
import { parseMutualTableData } from '../parse/mutual.parser';
import { normalizeMutualTransactions } from '../normalize/normalizeMutualTransactions';
import { writeMutualCSVFile } from '../output/mutualCsvWriter';

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
    try {
      console.log(`📄 Reading PDF from: ${options.input}\n`);
      const text = await extractTextFromPDF(options.input);
      
      console.log(`🔍 Parsing transactions...\n`);
      const transactions = parseBrokerPDFData(text, options.debug);

      if (transactions.length === 0) {
        console.warn('⚠️  No transactions found to process.');
        process.exit(1);
      }
      
      const normalizedTransactions = normalizeTransactions(transactions);
      
      if (normalizedTransactions.length === 0) {
        console.error('❌ No valid transactions after validation.');
        process.exit(1);
      }
      
      const outputPath = options.output || './output.csv';
      await writeCSVFile(normalizedTransactions, outputPath);
      
      console.log('✅ Conversion completed successfully!');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      if (options.debug) {
        console.error(error);
      }
      process.exit(1);
    }
  });

program.command('mutual')
  .description('Convert a mutual fund statement PDF to CSV')
  .requiredOption('-i, --input <path>', 'Path to PDF file')
  .option('-o, --output <path>', 'Output CSV path (default: ./mutual-output.csv)')
  .option('--debug', 'Output raw parsed data for debugging')
  .action(async (options) => {
    try {
      console.log(`📄 Reading PDF from: ${options.input}\n`);
      const tables = await extractTablesFromPDF(options.input);

      console.log(`🔍 Parsing mutual fund transactions...\n`);
      const transactions = parseMutualTableData(tables, options.debug);

      if (transactions.length === 0) {
        console.warn('⚠️  No transactions found to process.');
        process.exit(1);
      }
      
      const normalizedTransactions = normalizeMutualTransactions(transactions);
      
      if (normalizedTransactions.length === 0) {
        console.error('❌ No valid transactions after validation.');
        process.exit(1);
      }
      
      const outputPath = options.output || './mutual-output.csv';
      await writeMutualCSVFile(normalizedTransactions, outputPath);
      
      console.log('✅ Conversion completed successfully!');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      if (options.debug) {
        console.error(error);
      }
      process.exit(1);
    }
  });

program.parse();