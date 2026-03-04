'use client'
import DataDisplay, { Column } from './DataDisplay'
import { AccessLevel } from '@/utils/supabase/demo-users'

interface ModuleClientWrapperProps {
    title: string
    columns: Column[]
    data: Record<string, string | number>[]
    accessLevel: AccessLevel
    onAdd?: () => void
    onEdit?: (row: any) => void
    onDelete?: (id: string | number) => void
}

export default function ModuleClientWrapper({ title, columns, data, accessLevel, onAdd, onEdit, onDelete }: ModuleClientWrapperProps) {
    const handleAdd = () => {
        if (onAdd) {
            onAdd()
            return
        }
        alert(`Add New ${title.slice(0, -1)} clicked! (Demo Mode)`)
    }

    const handleDelete = (id: string | number) => {
        if (onDelete) {
            onDelete(id)
            return
        }
        if (confirm('Are you sure you want to delete this record? (Demo Mode)')) {
            alert(`Record ${id} deleted! (Demo Mode)`)
        }
    }

    return (
        <DataDisplay
            title={title}
            columns={columns}
            data={data}
            accessLevel={accessLevel}
            onAdd={handleAdd}
            onEdit={onEdit}
            onDelete={handleDelete}
        />
    )
}
