
'use client';

import { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Loader2, Stamp, Check } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';

export default function WatermarkFeature() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('CONFIDENTIAL');
    const [opacity, setOpacity] = useState(0.5);
    const [size, setSize] = useState(50);
    const [color, setColor] = useState('#ff0000');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDrop = (files: File[]) => {
        if (files.length > 0) setFile(files[0]);
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    };

    const handleWatermark = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const rgbColor = hexToRgb(color);

            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: width / 2 - (text.length * size) / 4, // Rough centering
                    y: height / 2,
                    size: size,
                    font: font,
                    color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                    opacity: opacity,
                    rotate: degrees(45),
                });
            }

            const pdfBytes = await pdfDoc.save();
            // @ts-ignore: Blob mismatch
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'watermarked.pdf');
        } catch (err) {
            console.error(err);
            alert('Failed to add watermark.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Add Watermark</h1>
                <p className={styles.subtitle}>Overlay text on your PDF pages.</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF to watermark"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            <Stamp size={24} className="text-blue-500" />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
                            <div>
                                <label className="block mb-2 font-medium">Watermark Text</label>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="w-full p-2 rounded bg-white/10 border border-white/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 font-medium">Font Size: {size}</label>
                                    <input
                                        type="range" min="10" max="150" value={size}
                                        onChange={(e) => setSize(Number(e.target.value))} className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">Opacity: {opacity}</label>
                                    <input
                                        type="range" min="0.1" max="1" step="0.1" value={opacity}
                                        onChange={(e) => setOpacity(Number(e.target.value))} className="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Color</label>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full h-10 cursor-pointer rounded"
                                />
                            </div>
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={handleWatermark}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Apply Watermark'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
