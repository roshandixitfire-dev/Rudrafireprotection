'use client'

import React from 'react'
import { AlertCircle, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react'

interface DraftNoticeBannerProps {
    hasDraft: boolean
    draftTime: string | null
    lastSavedNotice?: string | null
    onRestore: () => void
    onDiscard: () => void
}

export default function DraftNoticeBanner({
    hasDraft,
    draftTime,
    lastSavedNotice,
    onRestore,
    onDiscard
}: DraftNoticeBannerProps) {
    if (!hasDraft && !lastSavedNotice) return null

    if (hasDraft) {
        return (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-amber-900">Unsaved Local Draft Found</h4>
                        <p className="text-xs text-amber-700 font-medium">
                            You have an unsaved draft from <span className="font-bold">{draftTime || 'earlier session'}</span>. Would you like to restore it?
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <button
                        type="button"
                        onClick={onRestore}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm shadow-amber-600/20 flex items-center gap-1.5 active:scale-95"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore Draft
                    </button>
                    <button
                        type="button"
                        onClick={onDiscard}
                        className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-amber-900 hover:text-red-600 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Discard
                    </button>
                </div>
            </div>
        )
    }

    if (lastSavedNotice) {
        return (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lastSavedNotice}</span>
            </div>
        )
    }

    return null
}
