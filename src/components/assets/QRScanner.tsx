'use client'

import React, { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { lookupAssetAction } from '@/app/dashboard/assets/actions'
import { X, Loader2, Search } from 'lucide-react'

interface QRScannerProps {
    onClose: () => void
}

export default function QRScanner({ onClose }: QRScannerProps) {
    const [scanResult, setScanResult] = useState<any | null>(null)
    const [error, setError] = useState<string>('')
    const [isScanning, setIsScanning] = useState(true)
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [manualTag, setManualTag] = useState('')

    useEffect(() => {
        if (!isScanning) return;

        // Initialize the scanner targeting the logical div ID
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        )

        // Success Callback
        const onScanSuccess = async (decodedText: string) => {
            // Stop scanning immediately
            scanner.clear()
            setIsScanning(false)
            handleLookup(decodedText)
        }

        const onScanFailure = (error: any) => {
            // Ignore frame-by-frame failures
        }

        scanner.render(onScanSuccess, onScanFailure)

        // Cleanup on unmount
        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e))
        }
    }, [isScanning])

    const handleLookup = async (identifier: string) => {
        if (!identifier.trim()) return

        setIsLookingUp(true)
        setError('')

        try {
            const response = await lookupAssetAction(identifier)
            if (response.success) {
                setScanResult(response.data)
            } else {
                setError(response.error || 'Asset not found.')
            }
        } catch (err) {
            setError('Network error during lookup.')
        } finally {
            setIsLookingUp(false)
        }
    }

    const resetScanner = () => {
        setScanResult(null)
        setError('')
        setIsScanning(true)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Look Up Asset</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">

                    {/* Manual Fallback Input */}
                    {isScanning && (
                        <div className="w-full mb-6 flex gap-2">
                            <input
                                type="text"
                                placeholder="Or enter manual tag..."
                                value={manualTag}
                                onChange={(e) => setManualTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLookup(manualTag)}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            <button
                                onClick={() => handleLookup(manualTag)}
                                disabled={isLookingUp || !manualTag.trim()}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-50 flex-shrink-0"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {isLookingUp ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Searching Database...</p>
                        </div>
                    ) : (
                        <>
                            {/* The Scanner Viewport */}
                            {isScanning && (
                                <div className="w-full max-w-sm rounded-2xl overflow-hidden border-4 border-slate-100 shadow-inner">
                                    <div id="reader" className="w-full"></div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="mt-4 p-5 bg-red-50 text-red-700 rounded-2xl w-full border border-red-100 flex flex-col items-center text-center">
                                    <p className="font-bold mb-3">{error}</p>
                                    <button
                                        className="px-6 py-2 bg-white text-red-600 rounded-lg text-sm font-bold border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
                                        onClick={resetScanner}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* Success State */}
                            {scanResult && (
                                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                        <h3 className="font-black text-xl text-emerald-900 mb-1">
                                            Asset Found
                                        </h3>
                                        <p className="text-emerald-700 text-sm font-medium">
                                            {scanResult.equipment_master?.category} - {scanResult.equipment_master?.sub_category}
                                        </p>
                                    </div>

                                    <div className="p-6 border border-slate-100 rounded-2xl space-y-4 bg-white shadow-sm">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client Site</p>
                                            <p className="font-medium text-slate-900">{scanResult.clients?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Exact Location</p>
                                            <p className="font-medium text-slate-900">{scanResult.exact_location}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Condition</p>
                                                <p className="font-black text-slate-900">{scanResult.current_condition}</p>
                                            </div>
                                            {scanResult.manual_asset_tag && (
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Manual Tag</p>
                                                    <p className="font-black text-slate-900">{scanResult.manual_asset_tag}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={resetScanner}
                                            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                        >
                                            Scan Another
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
