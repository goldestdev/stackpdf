'use client';

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Loader2, Trash2, RotateCw, Check, GripVertical, X } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from './OrganizeFeature.module.css';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';

// DnD Kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageThumbnail {
    id: string;
    originalIndex: number;
    imageUrl: string;
    rotation: number;
}

// Sortable Item Component
function SortableItem(props: {
    page: PageThumbnail;
    index: number;
    onRotate: (id: string) => void;
    onRemove: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={styles.pageCard}>
            <div className={styles.thumbnailWrapper} style={{ transform: `rotate(${props.page.rotation}deg)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={props.page.imageUrl} alt={`Page ${props.index + 1}`} className={styles.thumbnail} />
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-white/20 rounded text-white" title="Drag to move">
                    <GripVertical size={16} />
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => props.onRotate(props.page.id)}
                        className="p-1 hover:bg-white/20 rounded text-white"
                        title="Rotate"
                    >
                        <RotateCw size={16} />
                    </button>
                    <button
                        onClick={() => props.onRemove(props.page.id)}
                        className="p-1 hover:bg-red-500/80 rounded text-red-200 hover:text-white"
                        title="Remove"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.pageNumber}>{props.index + 1}</div>
        </div>
    );
}

export default function OrganizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageThumbnail[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        // Set worker source locally
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
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
                        id: `page-${i}-${Date.now()}`,
                        originalIndex: i - 1,
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleRemove = (id: string) => {
        setPages(prev => prev.filter(p => p.id !== id));
    };

    const handleRotate = (id: string) => {
        setPages(prev => prev.map(p =>
            p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
        ));
    };

    const handleSave = async () => {
        if (!file || pages.length === 0) return;
        setIsProcessing(true);
        setStatus('Saving PDF...');

        try {
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const newPdf = await PDFDocument.create();

            const indices = pages.map(p => p.originalIndex);
            // We load pages one by one to ensure rotation is correct per instance
            // Copying in bulk is faster but applying individual rotations to re-ordered pages needs care
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
                <p className={styles.subtitle}>Drag pages to reorder. Rotate or delete unwanted pages.</p>
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
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className={styles.grid}>
                                        <SortableContext
                                            items={pages.map(p => p.id)}
                                            strategy={rectSortingStrategy}
                                        >
                                            {pages.map((page, index) => (
                                                <SortableItem
                                                    key={page.id}
                                                    page={page}
                                                    index={index}
                                                    onRotate={handleRotate}
                                                    onRemove={handleRemove}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </DndContext>

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
