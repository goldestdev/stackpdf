
'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Loader2, Layers, Check } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';

export default function FlattenFeature() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDrop = (files: File[]) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleFlatten = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const form = pdfDoc.getForm();
            try {
                form.flatten();
            } catch (e) {
                console.log("No form fields to flatten or error flattening form", e);
            }

            // Also flatten annotations if possible visually by saving? 
            // pdf-lib form.flatten() turns widgets into content. 
            // It effectively makes the PDF read-only for those fields.

            const pdfBytes = await pdfDoc.save();
            // @ts-ignore: Blob mismatch
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'flattened.pdf');
        } catch (err) {
            console.error(err);
            alert('Failed to flatten PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Flatten PDF</h1>
                <p className={styles.subtitle}>Lock form fields and annotations permanently.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF with forms/annotations"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            <Layers size={24} className="text-orange-500" />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        <p className="my-6 text-gray-300 text-center">
                            This will convert all fillable form fields into regular non-editable text. Use this to finalize agreements or forms before sending.
                        </p>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleFlatten}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Flatten PDF'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
