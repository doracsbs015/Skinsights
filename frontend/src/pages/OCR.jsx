import { createWorker } from 'tesseract.js';

// Extract text from image using OCR

export const extractTextFromImage = async (file) => {
  const worker = await createWorker('eng');

  try {
    const { data: { text } } = await worker.recognize(file);

    // Clean OCR text
    const cleaned = text
      .replace(/\n/g, ', ')
      .replace(/,\s*,/g, ',')
      .replace(/[^a-zA-Z0-9,\s-]/g, '') //OCR garbage
      .trim();

    return cleaned;
  } catch (error) {
    throw new Error('OCR failed');
  } finally {
    await worker.terminate();
  }
};