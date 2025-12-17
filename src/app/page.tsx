
'use client';

import {
  Merge,
  Scissors,
  Image as ImageIcon,
  FileImage,
  Move,
  Maximize2,
  Shield,
  FileText,
  Stamp,
  FileCog,
  FileCode,
  PenTool,
  Layers,
  FileType,
  Table2,
  MonitorPlay,
  Printer
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import styles from './page.module.css';

const TOOLS = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document seamlessly.',
    icon: Merge,
    href: '/merge',
    color: '#3b82f6'
  },
  {
    title: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: Scissors,
    href: '/split',
    color: '#ef4444'
  },
  {
    title: 'Optimize PDF',
    description: 'Reduce file size while keeping the best quality associated with your data.',
    icon: Maximize2, // Using Maximize2 as a proxy/placeholder icon for now, usually Minimize used but name conflict
    href: '/optimize',
    color: '#10b981'
  },
  {
    title: 'Images to PDF',
    description: 'Convert JPG, PNG, BMP, GIF, and TIFF images to PDF.',
    icon: ImageIcon,
    href: '/img-to-pdf',
    color: '#f59e0b'
  },
  {
    title: 'PDF to Images',
    description: 'Convert each page of your PDF into top quality images.',
    icon: FileImage,
    href: '/pdf-to-img',
    color: '#8b5cf6'
  },
  {
    title: 'Organize PDF',
    description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages.',
    icon: Move,
    href: '/organize',
    color: '#ec4899'
  },
  {
    title: 'Protect PDF',
    description: 'Encrypt your PDF with a password to keep sensitive data confidential.',
    icon: Shield,
    href: '/protect',
    color: '#6366f1'
  },
  {
    title: 'PDF to Text',
    description: 'Extract text from your PDF using advanced OCR technology.',
    icon: FileText,
    href: '/ocr',
    color: '#14b8a6'
  },
  {
    title: 'Add Watermark',
    description: 'Overlay text stamps on your PDF pages.',
    icon: Stamp,
    href: '/watermark',
    color: '#ec4899'
  },
  {
    title: 'Edit Metadata',
    description: 'Update PDF properties like title, author, and keywords.',
    icon: FileCog,
    href: '/metadata',
    color: '#06b6d4'
  },
  {
    title: 'Markdown to PDF',
    description: 'Convert simple markdown text into a PDF document.',
    icon: FileCode,
    href: '/markdown-to-pdf',
    color: '#3b82f6'
  },
  {
    title: 'Sign PDF',
    description: 'Draw your signature and place it on a PDF document.',
    icon: PenTool,
    href: '/sign',
    color: '#a855f7'
  },
  {
    title: 'Flatten PDF',
    description: 'Lock form fields and annotations to prevent further editing.',
    icon: Layers,
    href: '/flatten',
    color: '#f97316'
  },
  {
    title: 'PDF to Word',
    description: 'Convert PDF to editable Word document (Powered by Cloudmersive).',
    icon: FileType,
    href: '/pdf-to-word',
    color: '#2563eb'
  },
  {
    title: 'PDF to Excel',
    description: 'Convert PDF tables to Excel spreadsheets.',
    icon: Table2,
    href: '/pdf-to-excel',
    color: '#16a34a'
  },
  {
    title: 'PDF to PowerPoint',
    description: 'Convert PDF pages to PowerPoint slides.',
    icon: MonitorPlay,
    href: '/pdf-to-pptx',
    color: '#c2410c'
  },
  {
    title: 'Office to PDF',
    description: 'Convert Word, Excel, and PowerPoint files to PDF.',
    icon: Printer,
    href: '/office-to-pdf',
    color: '#dc2626'
  }
];

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Your Personal <span className="text-gradient">PDF Toolbox</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Secure, private, and powerful PDF tools. All processing runs locally in your browser.
            </p>
          </div>
        </div>
      </header>

      <section className={styles.toolsSection}>
        <div className="container">
          <div className={styles.grid}>
            {TOOLS.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
