
'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Loader2, FileCog, Check, Save } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';

export default function MetadataFeature() {
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState({
        title: '',
        author: '',
        subject: '',
        keywords: '',
        creator: '',
        producer: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const handleDrop = async (files: File[]) => {
        if (files.length > 0) {
            const f = files[0];
            setFile(f);
            setIsProcessing(true);
            setStatus('Reading metadata...');

            try {
                const arrayBuffer = await f.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);

                setMetadata({
                    title: pdfDoc.getTitle() || '',
                    author: pdfDoc.getAuthor() || '',
                    subject: pdfDoc.getSubject() || '',
                    keywords: pdfDoc.getKeywords() || '',
                    creator: pdfDoc.getCreator() || '',
                    producer: pdfDoc.getProducer() || ''
                });
                setStatus('');
            } catch (err) {
                console.error(err);
                setStatus('Error reading PDF metadata.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleSave = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            pdfDoc.setTitle(metadata.title);
            pdfDoc.setAuthor(metadata.author);
            pdfDoc.setSubject(metadata.subject);
            pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim())); // pdf-lib expects array? no, setKeywords takes string[] but doc says string. actually setKeywords takes string[]. wait, actually it handles it. 
            // Checking pdf-lib types: setKeywords(keywords: string[])

            pdfDoc.setCreator(metadata.creator);
            pdfDoc.setProducer(metadata.producer);

            const pdfBytes = await pdfDoc.save();
            // @ts-ignore: Blob mismatch
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'metadata-updated.pdf');
            setStatus('Metadata saved!');
        } catch (err) {
            console.error(err);
            setStatus('Error saving metadata.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Edit Metadata</h1>
                <p className={styles.subtitle}>Modify PDF title, author, and properties.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF to edit metadata"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            <FileCog size={24} className="text-cyan-500" />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        {isProcessing && !metadata.title && status === 'Reading metadata...' ? (
                            <div className="text-center p-8"><Loader2 className="animate-spin inline-block" /></div>
                        ) : (
                            <div className="grid gap-4 my-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Title</label>
                                    <input type="text" value={metadata.title} onChange={e => setMetadata({ ...metadata, title: e.target.value })} className="w-full p-2 rounded bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Author</label>
                                    <input type="text" value={metadata.author} onChange={e => setMetadata({ ...metadata, author: e.target.value })} className="w-full p-2 rounded bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Subject</label>
                                    <input type="text" value={metadata.subject} onChange={e => setMetadata({ ...metadata, subject: e.target.value })} className="w-full p-2 rounded bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Keywords (comma separated)</label>
                                    <input type="text" value={metadata.keywords} onChange={e => setMetadata({ ...metadata, keywords: e.target.value })} className="w-full p-2 rounded bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-400">Creator</label>
                                        <input type="text" value={metadata.creator} onChange={e => setMetadata({ ...metadata, creator: e.target.value })} className="w-full p-2 rounded bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-400">Producer</label>
                                        <input type="text" value={metadata.producer} onChange={e => setMetadata({ ...metadata, producer: e.target.value })} className="w-full p-2 rounded bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleSave}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Metadata</>}
                        </button>
                        {status && <p className="text-center mt-2 text-sm text-gray-400">{status}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
