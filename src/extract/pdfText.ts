import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(filePath);
    const dataBuffer = await fs.readFile(absolutePath);

    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();

    return result.text;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return Promise.reject('File not found');
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
}