'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, QrCode } from 'lucide-react'
import { createAndGenerateAssetQR, updateAssetAction } from '@/app/dashboard/assets/actions'

interface AssetFormProps {
    onClose: () => void
    onSuccess: () => void
    clients: any[] // We need client list to assign to
    equipmentTypes: any[]
    initialData?: any
}

export default function AssetForm({ onClose, onSuccess, clients, equipmentTypes, initialData }: AssetFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [qrResult, setQrResult] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            client_id: Number(formData.get('client_id')),
            equipment_id: formData.get('equipment_id') as string,
            exact_location: formData.get('exact_location') as string,
            manual_asset_tag: formData.get('manual_asset_tag') as string || undefined,
            installation_date: formData.get('installation_date') as string,
        }

        if (initialData) {
            // Update flow
            const updateResult = await updateAssetAction(initialData.id, data)
            setIsLoading(false)
            if (updateResult.success) {
                onSuccess()
                onClose()
            } else {
                setError(updateResult.error || 'Failed to update asset')
            }
        } else {
            // Create flow
            const result = await createAndGenerateAssetQR(data)
            setIsLoading(false)

            if (result.success && result.qrCodeImage) {
                setQrResult(result.qrCodeImage)
            } else {
                setError(result.error || 'Failed to create asset')
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{initialData ? 'Edit Asset' : 'Add New Asset'}</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">{initialData ? 'Update equipment details' : 'Register equipment and generate QR tag'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                            {error}
                        </div>
                    )}

                    {qrResult ? (
                        <div className="flex flex-col items-center justify-center space-y-6 py-8">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                                <QrCode className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Asset Registered Successfully!</h3>
                            <p className="text-slate-500 text-center max-w-md">
                                The unique QR code for this asset has been generated. Please print this tag and affix it to the physical equipment.
                            </p>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <img src={qrResult} alt="Generated QR Code" className="w-48 h-48 mx-auto mix-blend-multiply" />
                            </div>

                            <button
                                onClick={() => {
                                    onSuccess()
                                    onClose()
                                }}
                                className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <form id="asset-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Site</label>
                                    <select
                                        name="client_id"
                                        required
                                        defaultValue={initialData?.client_id || ''}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-700"
                                    >
                                        <option value="">Select a client...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Equipment Type</label>
                                    <select
                                        name="equipment_id"
                                        required
                                        defaultValue={initialData?.equipment_id || ''}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-700"
                                    >
                                        <option value="">Select equipment...</option>
                                        {equipmentTypes.map(eq => (
                                            <option key={eq.id} value={eq.id}>
                                                {eq.category} {eq.sub_category ? `- ${eq.sub_category}` : ''} {eq.make_model ? `(${eq.make_model})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exact Location</label>
                                    <input
                                        type="text"
                                        name="exact_location"
                                        required
                                        defaultValue={initialData?.exact_location || ''}
                                        placeholder="e.g. Basement Level 2, Pillar B4"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual Asset Tag (Optional)</label>
                                    <input
                                        type="text"
                                        name="manual_asset_tag"
                                        defaultValue={initialData?.manual_asset_tag || ''}
                                        placeholder="e.g. EXT-GF-01"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Installation Date</label>
                                    <input
                                        type="date"
                                        name="installation_date"
                                        required
                                        defaultValue={initialData?.installation_date ? initialData.installation_date.split('T')[0] : ''}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-700"
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {!qrResult && (
                    <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            form="asset-form"
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-md"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Register & Generate QR
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
