'use client'

import React, { useState } from 'react'
import AssetMasterTable from '@/components/assets/AssetMasterTable'
import AssetForm from '@/components/assets/AssetForm'
import QRScanner from '@/components/assets/QRScanner'
import { RefreshCw } from 'lucide-react'
import { AuditLogsModal } from '@/components/ui/AuditLogsModal'
import { deleteAssetAction } from '@/app/dashboard/assets/actions'

interface Props {
    initialData: any[]
    clients: any[]
    equipment: any[]
    accessLevel: string
}

export default function AssetsClientView({ initialData, clients, equipment, accessLevel }: Props) {
    const [isAdding, setIsAdding] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [isAuditLogOpen, setIsAuditLogOpen] = useState(false)
    const [data, setData] = useState<any[]>(initialData)
    const [editingAsset, setEditingAsset] = useState<any>(null)

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this asset?')) {
            const result = await deleteAssetAction(id)
            if (result.success) {
                setData(data.filter(a => a.id !== id))
            } else {
                alert(result.error || 'Failed to delete asset')
            }
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Offline Mock Warning */}
            {data.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="font-bold">No assets found or offline</p>
                        <p className="text-sm">You are currently seeing 0 assets, which may happen if the database is unreachable or no records exist.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-xl transition-colors font-bold text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reload
                    </button>
                </div>
            )}

            <AssetMasterTable
                data={data}
                onAdd={() => {
                    setEditingAsset(null)
                    setIsAdding(true)
                }}
                onScan={() => setIsScanning(true)}
                onViewAuditLogs={() => setIsAuditLogOpen(true)}
                onViewHistory={(asset) => alert('Audit History UI coming soon...')}
                onLogService={(asset) => alert('Service Log Form coming soon...')}
                onEdit={(asset) => {
                    setEditingAsset(asset)
                    setIsAdding(true)
                }}
                onDelete={handleDelete}
            />

            {isAdding && (
                <AssetForm
                    clients={clients}
                    equipmentTypes={equipment}
                    initialData={editingAsset}
                    onClose={() => setIsAdding(false)}
                    onSuccess={() => {
                        window.location.reload()
                    }}
                />
            )}

            {isScanning && (
                <QRScanner
                    onClose={() => setIsScanning(false)}
                />
            )}

            <AuditLogsModal
                isOpen={isAuditLogOpen}
                tableName="client_assets"
                title="Asset Master"
                onClose={() => setIsAuditLogOpen(false)}
                onRestored={() => window.location.reload()}
            />
        </div>
    )
}
