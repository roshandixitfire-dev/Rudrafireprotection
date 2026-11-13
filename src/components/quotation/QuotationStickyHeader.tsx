'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuotationTabs from './QuotationTabs';

const QuotationStickyHeader: React.FC<{ actions: React.ReactNode }> = ({ actions }) => {
    return (
        <div 
            className="sticky top-0 z-50 bg-gray-50/95 backdrop-blur border-b border-gray-200 py-3 px-4 mb-5 no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-b-xl shadow-sm" 
        >
            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
                <Link href="/dashboard/sales" className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors shrink-0">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div className="h-6 flex-shrink-0 w-px bg-gray-300 hidden sm:block"></div>
                
                {/* The tabs are injected here */}
                <div className="flex-1 mt-1">
                    <QuotationTabs />
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 shrink-0 mt-2 md:mt-0" suppressHydrationWarning>
                {actions}
            </div>
        </div>
    );
};

export default QuotationStickyHeader;
