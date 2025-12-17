
'use client';

import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, File as FileIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './DropZone.module.css';

interface DropZoneProps {
    onDrop: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    description?: string;
    className?: string;
}

export default function DropZone({
    onDrop,
    accept = { 'application/pdf': ['.pdf'] },
    maxFiles,
    description = "Drag & drop your files here, or click to select files",
    className
}: DropZoneProps) {

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles
    });

    return (
        <div
            {...getRootProps()}
            className={clsx(
                styles.dropZone,
                isDragActive && styles.active,
                className
            )}
        >
            <input {...getInputProps()} />
            <div className={styles.content}>
                <div className={styles.iconCircle}>
                    <UploadCloud size={32} />
                </div>
                <p className={styles.text}>
                    {isDragActive ? "Drop the files here..." : description}
                </p>
            </div>
        </div>
    );
}
