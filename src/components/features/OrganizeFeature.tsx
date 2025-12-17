
'use client';

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Loader2, Trash2, ArrowLeft, ArrowRight, RotateCw, Check } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from './OrganizeFeature.module.css';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';

interface PageThumbnail {
    originalIndex: number;
    imageUrl: string;
    rotation: number; // 0, 90, 180, 270 (Not fully implemented in backend logic yet, just UI or basic)
}

export default function OrganizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageThumbnail[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }, []);

    const handleDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const f = acceptedFiles[0];
        setFile(f);
        setStatus('Loading pages...');
        setIsProcessing(true);

        try {
            const arrayBuffer = await f.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newPages: PageThumbnail[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 }); // Small thumbnail
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    // @ts-ignore: pdfjs-dist types mismatch
                    await page.render({ canvasContext: context, viewport }).promise;
                    newPages.push({
                        originalIndex: i - 1, // 0-based for pdf-lib
                        imageUrl: canvas.toDataURL(),
                        rotation: 0
                    });
                }
            }
            setPages(newPages);
        } catch (err) {
            console.error(err);
            alert('Error loading PDF pages.');
            setFile(null);
        } finally {
            setIsProcessing(false);
            setStatus('');
        }
    };

    const movePage = (index: number, direction: 'left' | 'right') => {
        if (
            (direction === 'left' && index === 0) ||
            (direction === 'right' && index === pages.length - 1)
        ) return;

        const newPages = [...pages];
        const target = direction === 'left' ? index - 1 : index + 1;
        [newPages[index], newPages[target]] = [newPages[target], newPages[index]];
        setPages(newPages);
    };

    const removePage = (index: number) => {
        setPages(prev => prev.filter((_, i) => i !== index));
    };

    const rotatePage = (index: number) => {
        const newPages = [...pages];
        newPages[index].rotation = (newPages[index].rotation + 90) % 360;
        setPages(newPages);
    };

    const handleSave = async () => {
        if (!file || pages.length === 0) return;
        setIsProcessing(true);
        setStatus('Saving PDF...');

        try {
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const newPdf = await PDFDocument.create();

            // We need to copy pages. 
            // Note: random access copy might be inefficient if we load/copy one by one? 
            // pdf-lib copyPages takes an array of indices.

            const indices = pages.map(p => p.originalIndex);
            const copiedPages = await newPdf.copyPages(pdfDoc, indices);

            pages.forEach((p, i) => {
                const page = copiedPages[i];
                if (p.rotation !== 0) {
                    // @ts-ignore: pdf-lib rotation types
                    page.setRotation(page.getRotation().angle + p.rotation);
                }
                newPdf.addPage(page);
            });

            const pdfBytes = await newPdf.save();
            // @ts-ignore: Uint8Array to BlobPart mismatch
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'organized.pdf');

        } catch (err) {
            console.error(err);
            alert('Error saving PDF.');
        } finally {
            setIsProcessing(false);
            setStatus('');
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Organize PDF</h1>
                <p className={styles.subtitle}>Rearrange, rotate, and delete pages.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF to organize pages"
                    />
                ) : (
                    <div>
                        {isProcessing && !pages.length ? (
                            <div className="text-center p-8">
                                <Loader2 className="animate-spin inline-block mb-2" size={32} />
                                <p>{status}</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.grid}>
                                    {pages.map((page, index) => (
                                        <div key={index} className={styles.pageCard}>
                                            <div className={styles.thumbnailWrapper} style={{ transform: `rotate(${page.rotation}deg)` }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={page.imageUrl} alt={`Page ${index + 1}`} className={styles.thumbnail} />
                                            </div>
                                            <div className={styles.pageActions}>
                                                <button onClick={() => movePage(index, 'left')} disabled={index === 0} title="Move Left"><ArrowLeft size={16} /></button>
                                                <button onClick={() => rotatePage(index)} title="Rotate"><RotateCw size={16} /></button>
                                                <button onClick={() => removePage(index)} title="Remove" className="text-red-500"><Trash2 size={16} /></button>
                                                <button onClick={() => movePage(index, 'right')} disabled={index === pages.length - 1} title="Move Right"><ArrowRight size={16} /></button>
                                            </div>
                                            <div className={styles.pageNumber}>{index + 1}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.bottomBar}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <Check />}
                                        Save PDF
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => { setFile(null); setPages([]); }}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
