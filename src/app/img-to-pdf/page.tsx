
'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FileImage, Loader2, X } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '../merge/page.module.css'; // Reusing merge styles
import Link from 'next/link';

export default function ImgToPdfPage() {
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

    const handleConvert = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);

        try {
            const pdfDoc = await PDFDocument.create();

            for (const file of files) {
                const fileBuffer = await file.arrayBuffer();
                let image;

                // Embed based on type
                if (file.type === 'image/jpeg') {
                    image = await pdfDoc.embedJpg(fileBuffer);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(fileBuffer);
                } else {
                    // Fallback or explicit error for unsupported types (though DropZone should filter)
                    continue;
                }

                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            // @ts-ignore: mismatch
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'images.pdf');
        } catch (err) {
            console.error('Error creating PDF:', err);
            alert('Failed to create PDF. Please ensure files are valid JPG or PNG.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Images to PDF</h1>
                <p className={styles.subtitle}>Convert your images (JPG, PNG) into a single PDF.</p>
            </header>

            <div className={styles.workspace}>
                <DropZone
                    onDrop={handleDrop}
                    accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
                    className={styles.dropZone}
                    description="Drag & drop images here"
                />

                {files.length > 0 && (
                    <div className={styles.fileList}>
                        <h3 className={styles.listTitle}>Selected Images ({files.length})</h3>
                        <div className={styles.listGrid}>
                            {files.map((file, index) => (
                                <div key={`${file.name}-${index}`} className={styles.fileItem}>
                                    <FileImage size={24} className={styles.fileIcon} />
                                    <span className={styles.fileName}>{file.name}</span>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            className={styles.actionBtn}
                                        >↑</button>
                                        <button
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === files.length - 1}
                                            className={styles.actionBtn}
                                        >↓</button>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className={styles.removeBtn}
                                        ><X size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleConvert}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Processing...
                                </>
                            ) : (
                                'Convert to PDF'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
