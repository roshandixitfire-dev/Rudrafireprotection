'use client'

import { useState } from 'react'
import ModuleClientWrapper from '@/components/ModuleClientWrapper'
import ActivityForm from '@/components/ActivityForm'
import { AccessLevel } from '@/utils/supabase/demo-users'

interface Props {
    title: string
    columns: any[]
    data: any[]
    upcomingReminders: any[] // New Prop
    clients: any[]
    accessLevel: AccessLevel
}

export default function ActivitiesClientView({ title, columns, data, upcomingReminders, clients, accessLevel }: Props) {
    const [isAdding, setIsAdding] = useState(false)
    const [activeTab, setActiveTab] = useState<'log' | 'reminders'>('log')

    return (
        <div className="activities-module">
            {/* Tab Navigation */}
            <div className="tab-nav" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('log')}
                    style={{
                        padding: '10px 0',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'log' ? '#6366f1' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'log' ? '2px solid #6366f1' : 'none',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setActiveTab('reminders')}
                    style={{
                        padding: '10px 0',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'reminders' ? '#6366f1' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'reminders' ? '2px solid #6366f1' : 'none',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    Upcoming Reminders ({upcomingReminders.length})
                </button>
            </div>

            {activeTab === 'log' ? (
                <ModuleClientWrapper
                    title={title}
                    columns={columns}
                    data={data}
                    accessLevel={accessLevel}
                    onAdd={() => setIsAdding(true)}
                />
            ) : (
                <ModuleClientWrapper
                    title="Upcoming Service Visits"
                    columns={[
                        { key: 'next_reminder_date', label: 'Due Date' },
                        { key: 'client_name', label: 'Client' },
                        { key: 'reminder_type', label: 'Type' },
                        { key: 'reminder_status', label: 'Status' },
                    ]}
                    data={upcomingReminders}
                    accessLevel={accessLevel}
                    onAdd={() => setIsAdding(true)} // Can use same form to add Log+Reminder
                />
            )}

            {isAdding && (
                <ActivityForm
                    clients={clients}
                    onClose={() => setIsAdding(false)}
                />
            )}
        </div>
    )
}
