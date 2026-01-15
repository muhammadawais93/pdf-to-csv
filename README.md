# PDF to CSV Converter

A powerful CLI tool to convert broker statement PDFs into structured CSV files for easy analysis and record-keeping.

## 🚀 Features

- **PDF Text Extraction**: Automatically extracts transaction data from broker statement PDFs
- **Smart Parsing**: Uses regex patterns to identify and parse transaction records
- **Data Validation**: Validates transactions using Zod schema for data integrity
- **CSV Export**: Outputs clean, normalized CSV files
- **Debug Mode**: Includes debugging capabilities for troubleshooting
- **CLI Interface**: Easy-to-use command-line interface built with Commander.js

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/muhammadawais93/pdf-to-csv.git
cd pdf-to-csv
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Global Installation

To use the CLI tool globally:
```bash
npm install -g .
```

## 📖 Usage

### Basic Command

```bash
pdf-to-csv convert -i <pdf-file-path> -b <broker-type>
```

### Options

| Option | Alias | Required | Description | Default |
|--------|-------|----------|-------------|---------|
| `--input` | `-i` | Yes | Path to the PDF file | - |
| `--broker` | `-b` | Yes | Broker type (interactive_brokers, IBKR, etc.) | - |
| `--output` | `-o` | No | Output CSV file path | `./output.csv` |
| `--debug` | - | No | Enable debug mode to see raw parsed data | `false` |

### Examples

#### Basic Conversion
```bash
pdf-to-csv convert -i ./statements/january_2026.pdf -b interactive_brokers
```

#### Custom Output Path
```bash
pdf-to-csv convert -i ./statements/january_2026.pdf -b IBKR -o ./reports/january_trades.csv
```

#### Debug Mode
```bash
pdf-to-csv convert -i ./statements/january_2026.pdf -b interactive_brokers --debug
```

## 📊 Expected PDF Format

The tool expects PDF files with transaction data in the following format:

```
SYMBOL  TradeNo  TradeDate    SettlementDate  Type    Rate  Quantity  Total  Broker  BrokerTotal
AAPL    12345    2026-01-15   2026-01-17      BUY     150.5  100      15050  10      10
GOOGL   12346    2026-01-15   2026-01-17      SELL    2800   50       140000 15      15
```

### Data Fields

- **Security**: Stock symbol (1-10 uppercase letters)
- **Trade No**: Unique trade number
- **Trade Date**: Date of trade (YYYY-MM-DD format)
- **Settlement Date**: Settlement date (YYYY-MM-DD format)
- **Transaction Type**: BUY, SELL, etc. (uppercase)
- **Rate**: Price per share
- **Quantity**: Number of shares
- **Total**: Total transaction amount
- **Broker**: Broker fee
- **Broker Total**: Total broker charges

## 🏗️ Development

### Project Structure

```
pdf-to-csv/
├── src/
│   ├── cli/              # CLI interface
│   │   └── index.ts      # Command definitions
│   ├── extract/          # PDF extraction
│   │   └── pdfText.ts    # PDF text extraction logic
│   ├── parse/            # Data parsing
│   │   └── broker.parser.ts  # Transaction parsing
│   ├── normalize/        # Data normalization
│   │   └── normalizeTransactions.ts
│   ├── output/           # CSV output
│   │   └── csvWriter.ts  # CSV file writer
│   ├── schema/           # Data validation
│   │   └── transaction.schema.ts  # Zod schema
│   └── index.ts          # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run built version
npm start

# Clean build directory
npm run clean
```

### Building from Source

```bash
# Compile TypeScript
npm run build

# Run the CLI
node dist/index.js convert -i example.pdf -b interactive_brokers
```

## 🔍 How It Works

1. **PDF Extraction**: Uses `pdf-parse` library to extract raw text from PDF files
2. **Pattern Matching**: Applies regex patterns to identify transaction lines
3. **Data Parsing**: Extracts individual fields from matched lines
4. **Validation**: Validates parsed data against Zod schema
5. **Normalization**: Normalizes and cleans transaction data
6. **CSV Generation**: Writes validated transactions to CSV file

## 🛠️ Technologies

- **TypeScript**: Type-safe development
- **Commander.js**: CLI framework
- **pdf-parse**: PDF text extraction
- **Zod**: Schema validation
- **Node.js**: Runtime environment

## ⚠️ Error Handling

The tool handles various errors gracefully:

- **File Not Found**: Checks if PDF file exists
- **Invalid PDF**: Validates PDF file format
- **No Transactions Found**: Warns if no valid transactions are detected
- **Validation Errors**: Reports schema validation failures
- **Debug Mode**: Use `--debug` flag for detailed error information

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC

## 👤 Author

Muhammad Awais

## 🐛 Troubleshooting

### No transactions found
- Verify your PDF format matches the expected structure
- Use `--debug` flag to see which lines are being skipped
- Check if dates are in YYYY-MM-DD format

### Validation errors
- Ensure all numeric fields contain valid numbers
- Check that dates follow ISO format (YYYY-MM-DD)
- Verify security symbols are uppercase and 1-10 characters

### PDF extraction issues
- Ensure the PDF is not password-protected
- Verify the PDF contains extractable text (not just images)
- Try using `--debug` to see the extracted text

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ by Muhammad Awais