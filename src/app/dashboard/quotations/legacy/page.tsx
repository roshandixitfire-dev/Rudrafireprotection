'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LegacyQuoteModule from '@/components/quotation/LegacyQuotePreview';
import AMCQuoteModule from '@/components/quotation/AMCQuoteModule';
import QuotationTabs from '@/components/quotation/QuotationTabs';

export default function LegacyQuotationPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') === 'amc' ? 'amc' : 'legacy';
    const [activeTab, setActiveTab] = useState<'legacy' | 'amc'>(defaultTab);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'amc') setActiveTab('amc');
        else setActiveTab('legacy');
    }, [searchParams]);

    const Tabs = (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full">
            <Link href="/dashboard/quotations/new" className="px-4 py-2 rounded-t-lg font-bold text-sm text-gray-500 bg-gray-100 hover:bg-white hover:text-red-600 transition-colors border-b-2 border-transparent whitespace-nowrap">
                📋 Professional Quote
            </Link>
            <button
                onClick={() => setActiveTab('legacy')}
                className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors whitespace-nowrap border-b-2 ${activeTab === 'legacy' ? 'border-red-600 text-red-700 bg-white shadow-sm cursor-default' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-white hover:text-red-600'}`}>
                🔴 Legacy Quote
            </button>
            <button
                onClick={() => setActiveTab('amc')}
                className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors whitespace-nowrap border-b-2 ${activeTab === 'amc' ? 'border-red-600 text-red-700 bg-white shadow-sm cursor-default' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-white hover:text-red-600'}`}>
                🛡️ AMC Quote
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
            {/* Print CSS: hide nav/header during print */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; margin: 0 !important; }
                    .dashboard-main { margin: 0 !important; padding: 0 !important; }
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-3 sm:px-6">
                
                {/* Content */}
                {activeTab === 'legacy' ? <LegacyQuoteModule tabs={<QuotationTabs />} /> : <AMCQuoteModule tabs={<QuotationTabs />} />}
            </div>
        </div>
    );
}
