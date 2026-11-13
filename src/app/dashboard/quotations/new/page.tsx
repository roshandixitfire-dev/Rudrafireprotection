import React, { Suspense } from 'react';
import QuotationModule from '@/components/quotation/QuotationModule';
import QuotationTabs from '@/components/quotation/QuotationTabs';

export const metadata = {
    title: 'Create New Quotation | Rudra Fire Protection',
    description: 'Generate professional engineering quotations with auto-calculations and BOQ management.',
};

export default function NewQuotationPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
            {/* Print CSS: hide everything except the print preview */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-3 sm:px-6">
                <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Loading quotation builder...</div>}>
                    <QuotationModule tabs={<QuotationTabs />} />
                </Suspense>
            </div>
        </div>
    );
}
