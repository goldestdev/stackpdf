'use client';

import dynamic from 'next/dynamic';

const ReaderFeature = dynamic(() => import('./ReaderFeature'), {
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading Reader...</div>
});

export default function ReaderWrapper() {
    return <ReaderFeature />;
}
