// pdf-parse is a CommonJS module — must use require() to avoid ESM issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

/**
 * Extract plain text from a PDF buffer.
 * Returns an empty string (not an error) if the buffer isn't a valid PDF
 * so the AI pipeline can still run with whatever text is available.
 */
export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
        const data = await pdfParse(buffer);
        // Normalise whitespace for cleaner AI processing
        return data.text.replace(/\s+/g, ' ').trim();
    } catch (err) {
        console.warn('[PDF] Could not extract text from PDF:', err);
        return '';
    }
}
