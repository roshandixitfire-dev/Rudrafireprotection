'use client'

import InvoiceForm from '@/components/invoices/InvoiceForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewInvoicePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Minimal Header for the Form */}
            <div className="bg-slate-50 px-8 py-4 flex items-center gap-4 border-b border-slate-200">
                <Link
                    href="/dashboard/invoices"
                    className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm group"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                </Link>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dashboard</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">New Invoice</span>
                    </div>
                </div>
            </div>

            <InvoiceForm />
        </div>
    )
}
