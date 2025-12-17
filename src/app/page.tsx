
'use client';

import {
  Merge,
  Scissors,
  Image as ImageIcon,
  FileImage,
  Move,
  Maximize2,
  Shield,
  FileText
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
