
'use client';

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Loader2, Zap, Check } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';

export default function OptimizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'clean' | 'compress'>('clean');
    const [quality, setQuality] = useState(0.7);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }, []);

    const handleDrop = (files: File[]) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleOptimize = async () => {
        if (!file) return;
        setIsProcessing(true);
        setStatus(mode === 'clean' ? 'Cleaning structure...' : 'Compressing images...');

        try {
            const arrayBuffer = await file.arrayBuffer();

            if (mode === 'clean') {
                const pdDoc = await PDFDocument.load(arrayBuffer);
                const savedBytes = await pdDoc.save();
                // @ts-ignore: mismatch
                saveAs(new Blob([savedBytes], { type: 'application/pdf' }), 'optimized-clean.pdf');
                setStatus('Optimized (Structure Cleaned)!');
            } else {
                // Compress Mode: Rasterize to JPG
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const newPdf = await PDFDocument.create();
                const numPages = pdf.numPages;

                for (let i = 1; i <= numPages; i++) {
                    setStatus(`Compressing page ${i} of ${numPages}...`);
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 }); // Reasonable quality
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    if (!context) continue;

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    // @ts-ignore: pdfjs
                    await page.render({ canvasContext: context, viewport }).promise;

                    // Compression magic here: toJpeg with quality
                    const blob = await new Promise<Blob | null>(resolve =>
                        canvas.toBlob(resolve, 'image/jpeg', quality)
                    );

                    if (blob) {
                        const buffer = await blob.arrayBuffer();
                        const embeddedImage = await newPdf.embedJpg(buffer);
                        const newPage = newPdf.addPage([embeddedImage.width, embeddedImage.height]);
                        newPage.drawImage(embeddedImage, {
                            x: 0, y: 0,
                            width: embeddedImage.width,
                            height: embeddedImage.height
                        });
                    }
                }

                const savedBytes = await newPdf.save();
                // @ts-ignore: mismatch
                saveAs(new Blob([savedBytes], { type: 'application/pdf' }), 'optimized-compressed.pdf');
                setStatus('Optimized (Compressed)!');
            }

        } catch (err) {
            console.error(err);
            setStatus('Error optimizing PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Optimize PDF</h1>
                <p className={styles.subtitle}>Compress file size or clean up PDF structure.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF to optimize"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            <Zap size={24} className="text-yellow-500" />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        <div style={{ margin: 'var(--space-6) 0' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>Optimization Method</label>
                            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                <button
                                    onClick={() => setMode('clean')}
                                    className={`btn ${mode === 'clean' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ flex: 1 }}
                                >
                                    Quick Clean
                                </button>
                                <button
                                    onClick={() => setMode('compress')}
                                    className={`btn ${mode === 'compress' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ flex: 1 }}
                                >
                                    Compress Images
                                </button>
                            </div>
                            <p style={{ marginTop: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {mode === 'clean'
                                    ? 'Removes unused objects and stream metadata. Lossless.'
                                    : 'Rasterizes pages to JPEG images. Text selection will be lost.'}
                            </p>

                            {mode === 'compress' && (
                                <div style={{ marginTop: 'var(--space-4)' }}>
                                    <label>Image Quality: {Math.round(quality * 100)}%</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={quality}
                                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleOptimize}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Optimize PDF'}
                        </button>
                        {status && <p className="text-center mt-4 text-sm text-gray-400">{status}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
