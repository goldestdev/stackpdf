
'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import { Loader2, FileCode, Check, Download } from 'lucide-react';
import styles from '@/app/merge/page.module.css';
import Link from 'next/link';

export default function MarkdownFeature() {
    const [markdown, setMarkdown] = useState('# Hello World\n\nStart typing markdown here...');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConvert = async () => {
        setIsProcessing(true);

        try {
            const doc = new jsPDF();
            const htmlContent = marked.parse(markdown);

            // Temporary container for html serialization (invisible)
            const container = document.createElement('div');
            container.style.width = '595px'; // A4 width at 72dpi approx
            container.style.padding = '40px';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.color = 'black';
            container.style.backgroundColor = 'white';

            // Basic styling for the conversion
            container.innerHTML = `
        <style>
          h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
          code { background: #f4f4f4; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
          blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          img { max-width: 100%; }
        </style>
        ${htmlContent}
      `;

            // Use doc.html available in recent jspdf versions to render HTML
            await doc.html(container, {
                callback: (doc) => {
                    doc.save('markdown.pdf');
                    setIsProcessing(false);
                },
                x: 10,
                y: 10,
                width: 190, // A4 width minus margins
                windowWidth: 650 // Virtual window width for rendering
            });

        } catch (err) {
            console.error(err);
            alert('Error converting markdown.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>Markdown to PDF</h1>
                <p className={styles.subtitle}>Convert Markdown text into a formatted PDF.</p>
            </header>

            <div className={styles.workspace} style={{ maxWidth: '1000px', display: 'flex', gap: '2rem', flexDirection: 'column' }}>

                <div className="grid md:grid-cols-2 gap-6 h-[600px]">
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium flex items-center gap-2"><FileCode size={18} /> Markdown Input</label>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            className="flex-1 p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                            placeholder="# Type your markdown..."
                        />
                    </div>

                    <div className="flex flex-col bg-white rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-2 text-black text-sm font-medium border-b border-gray-200">Processing Preview (Approximate)</div>
                        <div
                            className="flex-1 p-8 overflow-y-auto prose max-w-none bg-white text-black"
                            // We render the markdown preview here for better UX
                            dangerouslySetInnerHTML={{ __html: marked.parse(markdown) as string }}
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        className={`btn btn-primary ${styles.mergeBtn}`}
                        onClick={handleConvert}
                        disabled={isProcessing}
                        style={{ maxWidth: '300px' }}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : <><Download size={18} /> Convert & Download PDF</>}
                    </button>
                </div>

            </div>
        </div>
    );
}
