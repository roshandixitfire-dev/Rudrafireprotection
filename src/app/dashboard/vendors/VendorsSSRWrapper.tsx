'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { AccessLevel } from '@/utils/supabase/demo-users';

interface VendorsSSRWrapperProps {
    initialVendors: any[];
    initialPOs: any[];
    accessLevel: AccessLevel;
    useDb: boolean;
}

const VendorsClientView = dynamic(() => import('./VendorsClientView'), {
    ssr: false,
    loading: () => (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2 w-full sm:max-w-md">
                    <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
                </div>
            </div>
            <div className="flex gap-4 border-b border-slate-200/80 pb-3">
                <div className="h-8 bg-slate-100 rounded w-28"></div>
                <div className="h-8 bg-slate-100 rounded w-32"></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-9 bg-slate-200 rounded-lg w-48"></div>
                    <div className="h-9 bg-slate-200 rounded-lg w-28"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-12 bg-slate-50 rounded-lg"></div>
                    <div className="h-12 bg-slate-50 rounded-lg"></div>
                    <div className="h-12 bg-slate-50 rounded-lg"></div>
                </div>
            </div>
        </div>
    )
});

export default function VendorsSSRWrapper(props: VendorsSSRWrapperProps) {
    return <VendorsClientView {...props} />;
}
