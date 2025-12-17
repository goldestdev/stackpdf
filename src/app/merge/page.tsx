
'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FileText, X, ArrowDown, Loader2 } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from './page.module.css';
import Link from 'next/link';

export default function MergePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDrop = (acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === files.length - 1)
        ) return;

        const newFiles = [...files];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
        setFiles(newFiles);
    };

    const handleMerge = async () => {
        if (files.length < 2) return;
        setIsProcessing(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const fileBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfFile = await mergedPdf.save();
            // @ts-ignore: mismatch
            const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
            saveAs(blob, 'merged-document.pdf');
        } catch (err) {
            console.error('Error merging PDFs:', err);
            alert('Failed to merge PDFs. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Merge PDFs</h1>
                <p className={styles.subtitle}>Combine multiple PDF files into one.</p>
            </header>

            <div className={styles.workspace}>
                <DropZone onDrop={handleDrop} className={styles.dropZone} />

                {files.length > 0 && (
                    <div className={styles.fileList}>
                        <h3 className={styles.listTitle}>Selected Files ({files.length})</h3>
                        <div className={styles.listGrid}>
                            {files.map((file, index) => (
                                <div key={`${file.name}-${index}`} className={styles.fileItem}>
                                    <FileText size={24} className={styles.fileIcon} />
                                    <span className={styles.fileName}>{file.name}</span>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            className={styles.actionBtn}
                                            title="Move Up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === files.length - 1}
                                            className={styles.actionBtn}
                                            title="Move Down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className={styles.removeBtn}
                                            title="Remove"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleMerge}
                            disabled={isProcessing || files.length < 2}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Processing...
                                </>
                            ) : (
                                'Merge PDFs'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
