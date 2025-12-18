
'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileText, Copy, Check } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';

// Dynamically import libraries to ensure client-side only
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

export default function OCRFeature() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Set worker source
        // We use a CDN for the worker to avoid complex bundler configuration for this MVP
        // In production, you'd want to copy this file to /public
        // Set worker source locally

    }, []);

    const handleDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setText('');
            setProgress(0);
            setStatus('');
        }
    };

    const processPDF = async () => {
        if (!file) return;
        setIsProcessing(true);
        setText('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            let fullText = '';

            for (let i = 1; i <= numPages; i++) {
                setStatus(`Processing page ${i} of ${numPages}...`);

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 }); // Scale up for better OCR
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // @ts-ignore: pdfjs render mismatch
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert canvas to blob/image for Tesseract
                // Tesseract.recognize accepts canvas directly
                const result = await Tesseract.recognize(
                    canvas,
                    'eng',
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                setProgress(Math.round(m.progress * 100));
                            }
                        }
                    }
                );

                fullText += `--- Page ${i} ---\n${result.data.text}\n\n`;
            }

            setText(fullText);
            setStatus('Completed!');

        } catch (err) {
            console.error(err);
            setStatus('Error processing PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>PDF to Text (OCR)</h1>
                <p className={styles.subtitle}>Extract text from scanned PDFs using OCR.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF to extract text"
                    />
                ) : (
                    <div className="w-full max-w-3xl mx-auto">
                        <div className={styles.fileList} style={{ marginBottom: '2rem' }}>
                            <div className={styles.fileItem}>
                                <FileText size={24} className={styles.fileIcon} />
                                <span className={styles.fileName}>{file.name}</span>
                                <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                            </div>

                            {!isProcessing && !text && (
                                <button
                                    className={`btn btn-primary ${styles.mergeBtn}`}
                                    onClick={processPDF}
                                >
                                    Start OCR Extraction
                                </button>
                            )}
                        </div>

                        {isProcessing && (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
                                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem', display: 'block' }} />
                                <p>{status}</p>
                                {progress > 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Recognizing: {progress}%</p>}
                            </div>
                        )}

                        {text && (
                            <div style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3>Extracted Text</h3>
                                    <button
                                        onClick={copyToClipboard}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        {copied ? ' Copied' : ' Copy Text'}
                                    </button>
                                </div>
                                <textarea
                                    readOnly
                                    value={text}
                                    style={{
                                        width: '100%',
                                        height: '400px',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'monospace',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
