import { saveAs } from 'file-saver';

/**
 * Saves a Blob as a file using file-saver.
 * @param blob The Blob to save
 * @param filename The name of the file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    saveAs(blob, filename);
}

/**
 * Creates a PDF Blob from a byte array.
 * Safe wrapper to avoid TypeScript errors with Uint8Array vs BlobPart.
 * @param bytes The PDF bytes (Uint8Array)
 * @returns A generic Blob
 */
export function createPdfBlob(bytes: Uint8Array): Blob {
    // @ts-ignore: Uint8Array is technically a BlobPart, but TS definition might be strict/outdated
    return new Blob([bytes], { type: 'application/pdf' });
}
