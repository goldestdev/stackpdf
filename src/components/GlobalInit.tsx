'use client';

import { useEffect } from 'react';

export default function GlobalInit() {
    useEffect(() => {
        const initWorker = async () => {
            if (typeof window !== 'undefined') {
                const pdfjsLib = await import('pdfjs-dist');
                if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
                }
            }
        };
        initWorker();
    }, []);
    return null;
}
