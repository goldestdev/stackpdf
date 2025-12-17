
'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileText, Loader2, X } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '../merge/page.module.css'; // Reusing merge styles for consistency
import Link from 'next/link';

export default function SplitPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]); // Only take the first one
        }
    };

    const removeFile = () => setFile(null);

    const handleSplit = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const fileBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(fileBuffer);
            const pageCount = pdfDoc.getPageCount();
            const zip = new JSZip();

            // Loop through all pages and create new PDFs
            for (let i = 0; i < pageCount; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);
                const pdfBytes = await newPdf.save();

                // Add to zip
                const fileName = `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`;
                zip.file(fileName, pdfBytes);
            }

            // Generate and download zip
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${file.name.replace('.pdf', '')}_split.zip`);

        } catch (err) {
            console.error('Error splitting PDF:', err);
            alert('Failed to split PDF. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Split PDF</h1>
                <p className={styles.subtitle}>Extract pages from your PDF into separate files.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a single PDF here to split"
                    />
                ) : (
                    <div className={styles.fileList}>
                        <div className={styles.listGrid}>
                            <div className={styles.fileItem}>
                                <FileText size={24} className={styles.fileIcon} />
                                <span className={styles.fileName}>{file.name}</span>
                                <button
                                    onClick={removeFile}
                                    className={styles.removeBtn}
                                    title="Remove"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleSplit}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Processing...
                                </>
                            ) : (
                                'Split All Pages (Download Zip)'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
