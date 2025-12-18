import ReaderFeature from '@/components/features/ReaderFeature';
import { Suspense } from 'react';

export const metadata = {
    title: 'Universal Reader | StackPDF',
    description: 'Read PDF, Word, Excel, and PowerPoint files directly in your browser.',
};

export default function ReaderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Reader...</div>}>
            <ReaderFeature />
        </Suspense>
    );
}
