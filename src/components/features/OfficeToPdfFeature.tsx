
'use client';

import { useState } from 'react';
import { Loader2, FileText, Check, AlertCircle } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';

export default function OfficeToPdfFeature() {
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

            const response = await fetch('/api/office-to-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Conversion failed on server');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace(/\.[^/.]+$/, "") + '.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to convert. Please check if the API key is configured correctly.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Office to PDF</h1>
                <p className={styles.subtitle}>Convert Word, Excel, and PowerPoint files to PDF.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        accept={{
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                            'application/msword': ['.doc'],
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                            'application/vnd.ms-excel': ['.xls'],
                            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                            'application/vnd.ms-powerpoint': ['.ppt']
                        }}
                        className={styles.dropZone}
                        description="Drag & drop Word, Excel, or PowerPoint files"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            <FileText size={24} className="text-blue-500" />
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
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Convert to PDF'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
