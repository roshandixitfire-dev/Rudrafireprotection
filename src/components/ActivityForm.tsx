'use client'

import { useState, useEffect } from 'react'
import { createActivityAction } from '@/app/dashboard/activities/actions'

interface Client {
    id: number
    name: string
    service_plan?: string | null
}

interface ActivityFormProps {
    clients: Client[]
    onClose: () => void
}

export default function ActivityForm({ clients, onClose }: ActivityFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [selectedClientId, setSelectedClientId] = useState<string>('')
    const [activityType, setActivityType] = useState<string>('Service Visit')
    const [activityDate, setActivityDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [nextReminderDate, setNextReminderDate] = useState<string>('')
    const [reminderType, setReminderType] = useState<string>('')

    // Auto-calculate next date when inputs change
    useEffect(() => {
        if (!selectedClientId) return

        const client = clients.find(c => c.id.toString() === selectedClientId)
        if (!client) return

        const baseDate = new Date(activityDate)
        let nextDate = new Date(baseDate)
        let type = ''

        if (activityType === 'Refilling') {
            // Refilling is usually annual
            nextDate.setFullYear(baseDate.getFullYear() + 1)
            type = 'Refilling'
        } else if (activityType === 'Service Visit') {
            type = 'Service'
            // Check Client Plan
            const plan = client.service_plan || ''

            if (plan.includes('Monthly')) {
                nextDate.setMonth(baseDate.getMonth() + 1)
            } else if (plan.includes('Quarterly')) {
                nextDate.setMonth(baseDate.getMonth() + 3)
            } else if (plan.includes('Half Yearly')) {
                nextDate.setMonth(baseDate.getMonth() + 6)
            } else if (plan.includes('Yearly')) {
                nextDate.setFullYear(baseDate.getFullYear() + 1)
            } else if (plan === 'On Call') {
                // No auto date for On Call
                return
            } else {
                // Default fallback if no plan or unknown plan? 
                // Let's not auto-set if unknown
                return
            }
        } else {
            return // Other activity types don't auto-schedule
        }

        // Set the calculated date
        setNextReminderDate(nextDate.toISOString().split('T')[0])
        setReminderType(type)

    }, [selectedClientId, activityType, activityDate, clients])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await createActivityAction(formData)

        if (result.success) {
            onClose()
        } else {
            setError(result.error || 'Failed to create activity')
        }
        setLoading(false)
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Log Activity</h2>
                {error && <p className="error-message">{error}</p>}

                <form action={handleSubmit} className="record-form">
                    <div className="form-group">
                        <label>Client *</label>
                        <select
                            name="clientId"
                            required
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                        >
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name} {client.service_plan ? `(${client.service_plan})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Activity Type *</label>
                        <select
                            name="activityType"
                            required
                            value={activityType}
                            onChange={(e) => setActivityType(e.target.value)}
                        >
                            <option value="Service Visit">Service Visit</option>
                            <option value="Refilling">Refilling</option>
                            <option value="Breakdown">Breakdown</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Cheque Collection">Cheque Collection</option>
                            <option value="Document Submission">Document Submission</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date *</label>
                            <input
                                type="date"
                                name="activityDate"
                                required
                                value={activityDate}
                                onChange={(e) => setActivityDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Time *</label>
                            <input type="time" name="activityTime" required defaultValue="10:00" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Remarks</label>
                        <textarea name="remarks" rows={3} placeholder="Details about the activity..." />
                    </div>

                    <hr style={{ borderColor: '#f1f5f9', margin: '16px 0' }} />
                    <h3 style={{ fontSize: '0.9rem', color: '#e11d48', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Schedule Future Visit</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Next Visit Date</label>
                            <input
                                type="date"
                                name="nextReminderDate"
                                value={nextReminderDate}
                                onChange={(e) => setNextReminderDate(e.target.value)}
                            />
                            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
                                {nextReminderDate ? 'Auto-calculated based on plan' : 'Select client to auto-calculate'}
                            </small>
                        </div>
                        <div className="form-group">
                            <label>Visit Type</label>
                            <select
                                name="reminderType"
                                value={reminderType}
                                onChange={(e) => setReminderType(e.target.value)}
                            >
                                <option value="">Select Type</option>
                                <option value="Service">Service Visit</option>
                                <option value="Refilling">Refilling</option>
                                <option value="Payment">Payment Collection</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : 'Save Log'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                }
                .modal-content {
                    background: #ffffff; padding: 32px; border-radius: 16px;
                    width: 100%; max-width: 500px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .record-form { display: flex; flex-direction: column; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-row { display: flex; gap: 20px; }
                .form-row > * { flex: 1; }
                label { font-size: 13px; color: #64748b; font-weight: 600; }
                input, select, textarea {
                    padding: 12px 14px; background: #f8fafc;
                    border: 1px solid #e2e8f0; border-radius: 8px;
                    color: #0f172a; font-size: 14px; outline: none;
                    transition: all 0.2s;
                }
                input:focus, select:focus, textarea:focus {
                    border-color: #e11d48;
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.1);
                }
                .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
                .btn-primary {
                    background: #e11d48; color: white; border: none; padding: 12px 24px;
                    border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.2);
                }
                .btn-primary:hover { background: #be123c; transform: translateY(-1px); }
                .btn-secondary {
                    background: transparent; color: #64748b; border: 1px solid #e2e8f0;
                    padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s;
                }
                .btn-secondary:hover { background: #f8fafc; color: #0f172a; }
                h2 { margin: 0 0 20px 0; color: #0f172a; font-weight: 800; letter-spacing: -0.5px; }
                .error-message { color: #ef4444; font-size: 0.875rem; margin-bottom: 12px; }
            `}</style>
        </div>
    )
}
