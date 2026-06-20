'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LegacyInvoiceModule from '@/components/invoices/LegacyInvoiceModule';
import AMCInvoiceModule from '@/components/invoices/AMCInvoiceModule';

export default function LegacyInvoicePage() {
    const [activeTab, setActiveTab] = useState<'legacy' | 'amc'>('legacy');

    const Tabs = (
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 self-start sm:self-auto">
            <button
                onClick={() => setActiveTab('legacy')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'legacy' ? 'bg-[#E3242B] text-white shadow' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
                🔴 Legacy Invoice
            </button>
            <button
                onClick={() => setActiveTab('amc')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'amc' ? 'bg-[#E3242B] text-white shadow' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
                🛡️ AMC Invoice
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

            <div className="max-w-7xl mx-auto pt-4 sm:pt-6 px-3 sm:px-6">
                
                {/* Back Link */}
                <div className="no-print mb-4">
                    <Link href="/dashboard/sales" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Sales
                    </Link>
                </div>

                <div className="no-print flex justify-between items-center mb-4">
                    {Tabs}
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto">
                    {activeTab === 'legacy' ? <LegacyInvoiceModule /> : <AMCInvoiceModule />}
                </div>
            </div>
        </div>
    );
}
