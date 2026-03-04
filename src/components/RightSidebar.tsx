'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'

interface RightSidebarProps {
    title: string
    children: React.ReactNode
    isOpen: boolean
    onToggle: () => void
}

export default function RightSidebar({ title, children, isOpen, onToggle }: RightSidebarProps) {
    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className={`right-sidebar-toggle flex items-center justify-center bg-white border border-slate-200 text-slate-500 rounded-full w-6 h-6 hover:text-primary hover:border-primary/30 hover:bg-slate-50 shadow-sm transition-all z-[101] hidden md:flex ${isOpen ? 'right-[248px]' : 'right-[66px]'} top-1/2 -translate-y-1/2`}
                title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                style={{ position: 'fixed' }}
            >
                {isOpen ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                    <ChevronLeft className="w-3.5 h-3.5" />
                )}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {!isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[89] md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar Panel */}
            <aside className={`right-sidebar ${!isOpen ? 'collapsed' : ''}`}>
                <div className="right-sidebar-header">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-1.5 h-6 bg-primary rounded-full flex-shrink-0" />
                        {isOpen && <h2 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">{title}</h2>}
                    </div>
                    {isOpen && (
                        <button
                            onClick={onToggle}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all md:hidden"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="right-sidebar-content hide-scrollbar font-sans" style={{ overflow: 'visible' }}>
                    {children}
                </div>
            </aside>
        </>
    )
}
