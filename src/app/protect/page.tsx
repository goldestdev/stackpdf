
'use client';

import { useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Lock, Unlock, FileText, Check, Loader2 } from 'lucide-react';
import DropZone from '@/components/DropZone';
import styles from '../merge/page.module.css';
import Link from 'next/link';

export default function ProtectPage() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const handleDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const f = acceptedFiles[0];
        setFile(f);
        setPassword('');
        setStatus('Checking file...');
        setIsProcessing(true);

        try {
            // Try to load without password to check encryption status
            await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: false });
            setIsEncrypted(false);
            setStatus('File is open. You can add a password.');
        } catch (err) {
            // Assuming error means encrypted (or valid pdf with password)
            // pdf-lib throws if encrypted and no password
            console.log('File likely encrypted', err);
            setIsEncrypted(true);
            setStatus('File is encrypted. Enter password to unlock/remove.');
        } finally {
            setIsProcessing(false);
        }
    };

    const processFile = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            if (isEncrypted) {
                // Unlock / Remove Password
                setStatus('Unlocking...');
                // Load with provided password
                // @ts-ignore: pdf-lib options type mismatch
                const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), { password });
                // Save without options removes encryption
                const pdfBytes = await pdfDoc.save();
                // @ts-ignore: Blob type mismatch
                saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'unlocked.pdf');
                setStatus('Unlocked successfully!');

            } else {
                // Encrypt / Add Password
                setStatus('Encrypting...');
                const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
                // Encrypt with password
                // @ts-ignore: pdf-lib encrypt method check
                pdfDoc.encrypt({
                    userPassword: password,
                    ownerPassword: password, // setting same for simplicity
                    permissions: {
                        printing: 'highResolution',
                        modifying: false,
                        copying: false,
                        annotating: false,
                        fillingForms: false,
                        contentAccessibility: false,
                        documentAssembly: false,
                    },
                });
                const pdfBytes = await pdfDoc.save();
                // @ts-ignore: Blob type mismatch
                saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'protected.pdf');
                setStatus('Protected successfully!');
            }

        } catch (err) {
            console.error(err);
            setStatus(`Error: ${isEncrypted ? 'Incorrect password or valid PDF not found.' : 'Failed to protect.'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>&larr; Back to Tools</Link>
                <h1 className={styles.title}>{isEncrypted ? 'Unlock PDF' : 'Protect PDF'}</h1>
                <p className={styles.subtitle}>{isEncrypted ? 'Remove password security.' : 'Encrypt your PDF with a password.'}</p>
            </header>

            <div className={styles.workspace}>
                {!file ? (
                    <DropZone
                        onDrop={handleDrop}
                        maxFiles={1}
                        className={styles.dropZone}
                        description="Drag & drop a PDF here"
                    />
                ) : (
                    <div className={styles.fileList} style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className={styles.fileItem}>
                            {isEncrypted ? <Lock size={24} className="text-red-500" /> : <Unlock size={24} className="text-green-500" />}
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => setFile(null)} className={styles.removeBtn}><Check size={16} /></button>
                        </div>

                        <div style={{ margin: 'var(--space-6) 0' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                {isEncrypted ? 'Enter Current Password' : 'Set New Password'}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <button
                            className={`btn btn-primary ${styles.mergeBtn}`}
                            onClick={processFile}
                            disabled={isProcessing || !password}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : (isEncrypted ? 'Unlock PDF' : 'Protect PDF')}
                        </button>
                        {status && <p className="text-center mt-4 text-sm text-gray-400">{status}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
