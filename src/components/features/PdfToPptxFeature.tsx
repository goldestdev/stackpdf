
'use client';

import { useState } from 'react';
import { Loader2, MonitorPlay, Check, AlertCircle } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';

export default function PdfToPptxFeature() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleDrop = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setError('');
        }
    };

    const handleConvert = async () => {
        if (!file) return;

        // Cloudmersive Free Plan limit: 3.5MB
        const MAX_SIZE = 3.5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setError('File is too large. Cloudmersive Free Plan limits uploads to 3.5MB.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/pdf-to-pptx', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Conversion failed on server');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace('.pdf', '') + '.pptx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error(err);
            setError('Failed to convert. Please check if the API key is configured correctly.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>PDF to PowerPoint</h1>
                <p className={styles.subtitle}>Convert PDF pages to editable PowerPoint slides.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF to convert"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            <MonitorPlay size={24} className="text-orange-600" />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-500 p-3 rounded flex items-center gap-2 text-sm my-4 border border-red-500/20">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleConvert}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Convert to PPTX'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
