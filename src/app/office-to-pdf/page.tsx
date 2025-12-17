
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const OfficeToPdfFeature = dynamic(() => import('@/components/features/OfficeToPdfFeature'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin" size={32} /></div>
});

export default function OfficeToPdfPage() {
    return <OfficeToPdfFeature />;
}
