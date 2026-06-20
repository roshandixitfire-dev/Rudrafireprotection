'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export const QuotationTabs: React.FC<{ className?: string }> = ({ className = '' }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Determine active tab based on URL
    let activeTab: 'professional' | 'legacy' | 'amc' = 'legacy';
    
    if (pathname.includes('/quotations/new')) {
        activeTab = 'professional';
    } else if (pathname.includes('/quotations/legacy')) {
        if (searchParams.get('tab') === 'amc') {
            activeTab = 'amc';
        } else {
            activeTab = 'legacy';
        }
    }

    const tabStyle = (isActive: boolean) => `
        px-4 py-2 rounded-t-lg font-bold text-sm transition-colors whitespace-nowrap border-b-2
        ${isActive 
            ? 'border-red-600 text-red-700 bg-white shadow-sm cursor-default' 
            : 'border-transparent text-gray-500 bg-gray-100 hover:bg-white hover:text-red-600'}
    `.trim();

    return (
        <div className={`flex gap-2 overflow-x-auto pb-1 sm:pb-0 ${className} no-print`}>
            <Link 
                href="/dashboard/quotations/new" 
                className={tabStyle(activeTab === 'professional')}
            >
                📋 Professional Quote
            </Link>
            <Link 
                href="/dashboard/quotations/legacy" 
                className={tabStyle(activeTab === 'legacy')}
            >
                🔴 Legacy Quote
            </Link>
            <Link 
                href="/dashboard/quotations/legacy?tab=amc" 
                className={tabStyle(activeTab === 'amc')}
            >
                🛡️ AMC Quote
            </Link>
        </div>
    );
};

export default QuotationTabs;
