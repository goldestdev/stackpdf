
'use client';

import { useState, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Loader2, PenTool, Check, Eraser } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';
import SignatureCanvas from 'react-signature-canvas';

export default function SignFeature() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const sigPad = useRef<SignatureCanvas>(null);
    const [hasSignature, setHasSignature] = useState(false);

    const handleDrop = (files: File[]) => {
        if (files.length > 0) setFile(files[0]);
    };

    const handleClear = () => {
        sigPad.current?.clear();
        setHasSignature(false);
    };

    const handleSign = async () => {
        if (!file || !sigPad.current || sigPad.current.isEmpty()) return;
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            const signatureDataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
            const signatureImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

            const sigDims = signatureImage.scale(0.5);

            // Add signature to the last page by default, bottom right
            // In a real app we'd let user position it, but for MVP this is fine
            const lastPage = pages[pages.length - 1];
            const { width, height } = lastPage.getSize();

            lastPage.drawImage(signatureImage, {
                x: width - sigDims.width - 50,
                y: 50,
                width: sigDims.width,
                height: sigDims.height,
            });

            const pdfBytes = await pdfDoc.save();
            // @ts-ignore: Blob mismatch
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'signed_document.pdf');
        } catch (err) {
            console.error(err);
            alert('Failed to sign PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Sign PDF</h1>
                <p className={styles.subtitle}>Draw your signature and add it to the document.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF to sign"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            <PenTool size={24} className="text-purple-500" />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        <div className="bg-white rounded-lg p-4 my-6">
                            <p className="text-black mb-2 font-medium">Draw Signature:</p>
                            <div className="border-2 border-dashed border-gray-300 rounded cursor-crosshair relative bg-white">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor="black"
                                    canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                                    onEnd={() => setHasSignature(true)}
                                />
                                {hasSignature && (
                                    <button onClick={handleClear} className="absolute top-2 right-2 text-red-500 hover:bg-gray-100 p-1 rounded" title="Clear">
                                        <Eraser size={20} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">* Signature will be placed on the bottom right of the last page.</p>
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleSign}
                            disabled={isProcessing || !hasSignature}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Apply Signature'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
