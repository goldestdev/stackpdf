'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw, Download, FileText, AlertCircle } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from './ReaderFeature.module.css';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { useHistory } from '@/context/HistoryContext';
import { useSearchParams } from 'next/navigation';

export default function ReaderFeature() {
    const [file, setFile] = useState<Blob | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [rotation, setRotation] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [viewMode, setViewMode] = useState<'single' | 'continuous'>('single');

    // PDF State
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);

    const { addToHistory, history } = useHistory();
    const searchParams = useSearchParams();

    // Responsive Check
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode('continuous');
                // Fit Width logic approx: Mobile screen width / standard A4 width (approx 600px rendered)
                // Actually, CSS handles w-100%, so we just need a decent resolution scale
                setScale(window.devicePixelRatio > 1 ? 1.5 : 1.0);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check for history ID on mount
    useEffect(() => {
        const historyId = searchParams.get('historyId');
        if (historyId) {
            const item = history.find(h => h.id === historyId);
            if (item) {
                setFile(item.fileBlob);
                setFileName(item.filename);
            }
        }
    }, [searchParams, history]);


    const handleDrop = async (files: File[]) => {
        if (files.length === 0) return;
        const f = files[0];
        setFileName(f.name);
        setError('');
        setIsProcessing(true);

        try {
            if (f.type === 'application/pdf') {
                setFile(f);
                await addToHistory(f, f.name, 'Reader');
                setIsProcessing(false);
            } else {
                const ext = f.name.split('.').pop()?.toLowerCase();
                if (['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext || '')) {
                    await convertOfficeToPdf(f);
                } else {
                    setError('Unsupported file type. Please upload PDF, Word, Excel, or PowerPoint.');
                    setIsProcessing(false);
                }
            }
        } catch (e) {
            console.error(e);
            setError('Failed to load file.');
            setIsProcessing(false);
        }
    };

    const convertOfficeToPdf = async (f: File) => {
        try {
            const formData = new FormData();
            formData.append('file', f);

            const response = await fetch('/api/office-to-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Conversion failed');
            }

            const blob = await response.blob();
            setFile(blob);
            await addToHistory(blob, f.name.replace(/\.[^/.]+$/, "") + '.pdf', 'Reader (Converted)');
        } catch (err: any) {
            setError(err.message || 'Conversion error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Load PDF Document
    useEffect(() => {
        if (!file) return;

        const loadPdf = async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                setPdfDoc(doc);
                setNumPages(doc.numPages);
                setCurrentPage(1);
            } catch (e) {
                console.error('Error loading PDF:', e);
                setError('Could not load PDF. The file might be corrupted.');
            }
        };

        loadPdf();
    }, [file]);

    // Render SINGLE Page
    const renderSinglePage = useCallback(async () => {
        if (!pdfDoc || !canvasRef.current || viewMode !== 'single') return;

        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        try {
            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale, rotation });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            // @ts-ignore: pdfjs-dist types mismatch
            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            await renderTask.promise;
        } catch (e: any) {
            if (e.name !== 'RenderingCancelledException') {
                console.error('Render error:', e);
            }
        }
    }, [pdfDoc, currentPage, scale, rotation, viewMode]);

    useEffect(() => {
        renderSinglePage();
    }, [renderSinglePage]);


    // Controls
    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const rotate = () => setRotation(prev => (prev + 90) % 360);
    const toggleViewMode = () => setViewMode(prev => prev === 'single' ? 'continuous' : 'single');

    return (
        <div className={styles.container}>
            <header className={`${styles.header} ${file ? 'hidden md:block' : ''}`}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Universal Reader</h1>
                <p className={styles.subtitle}>Read PDF, Word, Excel, and PowerPoint files instantly.</p>
            </header>

            {!file ? (
                <div className={styles.workspace}>
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        accept={{
                            'application/pdf': ['.pdf'],
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                            'application/msword': ['.doc'],
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                            'application/vnd.ms-excel': ['.xls'],
                            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                            'application/vnd.ms-powerpoint': ['.ppt']
                        }}
                        className={styles.dropZone}
                        description="Drag & drop PDF or Office files to read"
                    />
                    {isProcessing && (
                        <div className="mt-8 flex flex-col items-center text-blue-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p>Processing document...</p>
                        </div>
                    )}
                    {error && (
                        <div className="mt-8 text-red-500 flex items-center gap-2 bg-red-500/10 p-4 rounded border border-red-500/20">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.workspace}>
                    {/* Toolbar */}
                    <div className={styles.toolbar}>
                        <div className={styles.toolGroup}>
                            <button onClick={zoomOut} className={styles.iconBtn} title="Zoom Out"><ZoomOut size={20} /></button>
                            <span className="text-sm font-mono text-slate-300 w-12 text-center">{Math.round(scale * 100)}%</span>
                            <button onClick={zoomIn} className={styles.iconBtn} title="Zoom In"><ZoomIn size={20} /></button>
                        </div>

                        {viewMode === 'single' && (
                            <div className={styles.toolGroup}>
                                <button onClick={prevPage} disabled={currentPage <= 1} className={styles.iconBtn} title="Previous Page"><ChevronLeft size={20} /></button>
                                <span className={styles.pageInfo}>{currentPage} / {numPages}</span>
                                <button onClick={nextPage} disabled={currentPage >= numPages} className={styles.iconBtn} title="Next Page"><ChevronRight size={20} /></button>
                            </div>
                        )}

                        <div className={styles.toolGroup}>
                            <button onClick={rotate} className={styles.iconBtn} title="Rotate"><RotateCw size={20} /></button>
                            <button onClick={toggleViewMode} className={`${styles.iconBtn} ${viewMode === 'continuous' ? styles.active : ''}`} title="Toggle Continuous Scroll">
                                {viewMode === 'single' ? <FileText size={20} /> : <div className="flex flex-col gap-0.5"><div className="w-4 h-2 border border-current rounded-sm" /><div className="w-4 h-2 border border-current rounded-sm" /></div>}
                            </button>
                        </div>

                        <button
                            className={styles.iconBtn}
                            onClick={() => { setFile(null); setPdfDoc(null); }}
                            title="Close"
                        >
                            &times; <span className="hidden md:inline">Close</span>
                        </button>
                    </div>

                    {/* Viewer */}
                    <div className={styles.viewerContainer}>
                        {viewMode === 'single' ? (
                            <div className={styles.canvasWrapper}>
                                <canvas ref={canvasRef} />
                            </div>
                        ) : (
                            <div className={styles.continuousContainer}>
                                {pdfDoc && Array.from({ length: numPages }, (_, i) => (
                                    <PageCanvas
                                        key={i}
                                        pageIndex={i + 1}
                                        pdfDoc={pdfDoc}
                                        scale={scale}
                                        rotation={rotation}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for rendering individual pages in continuous mode
function PageCanvas({ pageIndex, pdfDoc, scale, rotation }: { pageIndex: number, pdfDoc: pdfjsLib.PDFDocumentProxy, scale: number, rotation: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        let renderTask: any = null;

        const render = async () => {
            try {
                const page = await pdfDoc.getPage(pageIndex);
                const viewport = page.getViewport({ scale, rotation });
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                // @ts-ignore: pdfjs-dist types mismatch
                renderTask = page.render(renderContext);
                await renderTask.promise;
            } catch (e: any) {
                // ignore cancel
            }
        };

        render();

        return () => {
            if (renderTask) renderTask.cancel();
        };
    }, [pdfDoc, pageIndex, scale, rotation]);

    return (
        <div className={styles.canvasWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
}
