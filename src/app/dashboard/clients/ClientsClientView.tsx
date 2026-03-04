'use client'

import { useState } from 'react'
import ClientMasterTable from '@/components/clients/ClientMasterTable'
import ClientForm from '@/components/ClientForm'
import { AccessLevel } from '@/utils/supabase/demo-users'
import { deleteClientAction } from './actions'
import { Trash } from 'lucide-react'

interface Props {
    title: string
    data: any[]
    accessLevel: AccessLevel
}

export default function ClientsClientView({ title, data, accessLevel }: Props) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingClient, setEditingClient] = useState<any>(null)
    const [localData, setLocalData] = useState<any[]>(data)

    const handleDelete = async (id: string | number) => {
        if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            const result = await deleteClientAction(Number(id))
            if (result.success) {
                // Instantly remove from UI instead of reloading the page
                setLocalData(prev => prev.filter(client => Number(client.id) !== Number(id)))
            } else {
                alert('Failed to delete: ' + (result.error || 'Unknown error'))
            }
        }
    }


    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Client Master List</h1>
            </div>
            <ClientMasterTable
                title={title}
                data={localData}
                accessLevel={accessLevel}
                onAdd={() => setIsAdding(true)}
                onEdit={(row) => setEditingClient(row)}
                onDelete={handleDelete}
            />

            {(isAdding || editingClient) && (
                <ClientForm
                    initialData={editingClient}
                    onClose={() => {
                        setIsAdding(false)
                        setEditingClient(null)
                    }}
                />
            )}
        </div>
    )
}
