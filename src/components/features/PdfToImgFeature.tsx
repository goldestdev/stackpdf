
'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileText, Check } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

export default function PdfToImgPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Set worker source
        // Set worker source locally
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }, []);

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setStatus('Initializing...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const zip = new JSZip();

            for (let i = 1; i <= numPages; i++) {
                setStatus(`Converting page ${i} of ${numPages}...`);

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // @ts-ignore: pdfjs-dist types mismatch
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert to blob
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(`page_${i}.png`, blob);
                }
            }

            setStatus('Zipping images...');
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${file.name.replace('.pdf', '')}_images.zip`);
            setStatus('Done!');

        } catch (err) {
            console.error(err);
            alert('Error converting PDF to images.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>PDF to Images</h1>
                <p className={styles.subtitle}>Convert PDF pages into high-quality images (PNG).</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF here"
                    />
                ) : (
                    <div className={styles.fileList}>
                        <div className={styles.fileItem}>
                            <FileText size={24} className={styles.fileIcon} />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleConvert}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> {status}
                                </>
                            ) : (
                                'Convert to Images (ZIP)'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
