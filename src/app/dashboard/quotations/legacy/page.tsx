'use client';
import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import QuotationTabs from '@/components/quotation/QuotationTabs';

const LegacyQuoteModule = dynamic(() => import('@/components/quotation/LegacyQuotePreview'), {
    ssr: false,
    loading: () => (
        <div className="p-12 text-center text-gray-400 font-medium animate-pulse">
            Loading quotation editor...
        </div>
    )
});

const AMCQuoteModule = dynamic(() => import('@/components/quotation/AMCQuoteModule'), {
    ssr: false,
    loading: () => (
        <div className="p-12 text-center text-gray-400 font-medium animate-pulse">
            Loading AMC quotation editor...
        </div>
    )
});

function LegacyQuotationContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') === 'amc' ? 'amc' : 'legacy';
    const [activeTab, setActiveTab] = useState<'legacy' | 'amc'>(defaultTab);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'amc') setActiveTab('amc');
        else setActiveTab('legacy');
    }, [searchParams]);

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
            {activeTab === 'legacy' ? <LegacyQuoteModule tabs={<QuotationTabs />} /> : <AMCQuoteModule tabs={<QuotationTabs />} />}
        </div>
    );
}

export default function LegacyQuotationPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden" suppressHydrationWarning>
            {/* Print CSS: hide nav/header during print */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; margin: 0 !important; }
                    .dashboard-main { margin: 0 !important; padding: 0 !important; }
                }
            `}</style>

            <Suspense fallback={<div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading...</div>}>
                <LegacyQuotationContent />
            </Suspense>
        </div>
    );
}
