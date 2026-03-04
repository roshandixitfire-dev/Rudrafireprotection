'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ModuleKey, AccessLevel, DemoUser, UserPermission } from '@/utils/supabase/demo-users'

const MODULES: { key: ModuleKey; label: string }[] = [
    { key: 'clients', label: 'Clients' },
    { key: 'services', label: 'Services' },
    { key: 'payments', label: 'Payments' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'users', label: 'User Management' }, // Usually Admin only, but technically assignable
]

const ACCESS_LEVELS: { value: AccessLevel; label: string }[] = [
    { value: 'view', label: 'View Only' },
    { value: 'edit', label: 'Edit (View + Edit)' },
    { value: 'delete', label: 'Full Access (Delete)' },
]

export default function CreateUserPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editEmail = searchParams.get('email')

    const roleParam = searchParams.get('role')

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        company: 'Rudra Fire Protection Pvt. Ltd.',
        role: roleParam || 'employee',
        permissions: [] as UserPermission[]
    })

    useEffect(() => {
        if (editEmail) {
            // Fetch user details to edit
            fetch('/api/demo-users')
                .then(res => res.json())
                .then((users: DemoUser[]) => {
                    const user = users.find(u => u.email === editEmail)
                    if (user) {
                        setFormData({
                            fullName: user.fullName || '',
                            email: user.email,
                            password: '', // Don't show existing password
                            company: user.company || '',
                            role: user.role,
                            permissions: user.permissions || []
                        })
                    }
                })
        }
    }, [editEmail])

    const handlePermissionChange = (module: ModuleKey, level: AccessLevel | 'none') => {
        setFormData(prev => {
            const newPermissions = prev.permissions.filter(p => p.module !== module)
            if (level !== 'none') {
                newPermissions.push({ module, access: level })
            }
            return { ...prev, permissions: newPermissions }
        })
    }

    const getPermissionLevel = (module: ModuleKey) => {
        return formData.permissions.find(p => p.module === module)?.access || 'none'
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await fetch('/api/demo-users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            router.push('/dashboard/users')
            router.refresh()
        } else {
            alert('Failed to save user')
        }
        setLoading(false)
    }

    return (
        <div className="dashboard-page">
            <h1 className="page-title">{editEmail ? 'Edit User' : 'Create New User'}</h1>

            <form onSubmit={handleSubmit} className="card-form" style={{ maxWidth: '800px' }}>
                <div className="form-section">
                    <h3>Personal Details</h3>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            required
                            className="form-input"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Username (Email Address)</label>
                        <input
                            required
                            type="email"
                            className="form-input"
                            disabled={!!editEmail} // Cannot change email for demo
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter email to be used as username..."
                        />
                        <p className="text-[11px] text-slate-500 mt-1">This email will be used as the login username for the portal/dashboard.</p>
                    </div>
                    <div className="form-group">
                        <label>Portal Password {editEmail && '(Leave blank to keep unchanged)'}</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editEmail ? "••••••••" : "Set an initial password..."}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Set the initial password the user will use to log in to the system.</p>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Role & Permissions</h3>
                    <div className="form-group">
                        <label>Role</label>
                        <select
                            className="form-input"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                            <option value="client">Client</option>
                        </select>
                    </div>

                    {formData.role === 'employee' && (
                        <div className="permissions-table-wrapper">
                            <h4>Module Access</h4>
                            <table className="permissions-table">
                                <thead>
                                    <tr>
                                        <th>Module</th>
                                        <th>No Access</th>
                                        <th>View Only</th>
                                        <th>Edit</th>
                                        <th>Delete (Full)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODULES.map(mod => (
                                        <tr key={mod.key}>
                                            <td>{mod.label}</td>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name={`perm-${mod.key}`}
                                                    checked={getPermissionLevel(mod.key) === 'none'}
                                                    onChange={() => handlePermissionChange(mod.key, 'none')}
                                                />
                                            </td>
                                            {ACCESS_LEVELS.map(level => (
                                                <td key={level.value}>
                                                    <input
                                                        type="radio"
                                                        name={`perm-${mod.key}`}
                                                        checked={getPermissionLevel(mod.key) === level.value}
                                                        onChange={() => handlePermissionChange(mod.key, level.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save User'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .card-form {
                    background: #18181b;
                    padding: 24px;
                    border-radius: 12px;
                    border: 1px solid #27272a;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .form-section h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #27272a;
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-group label {
                    display: block;
                    font-size: 14px;
                    color: #a1a1aa;
                    margin-bottom: 6px;
                }
                .form-input {
                    width: 100%;
                    padding: 10px;
                    background: #09090b;
                    border: 1px solid #3f3f46;
                    border-radius: 6px;
                    color: #fff;
                }
                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .permissions-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .permissions-table th, .permissions-table td {
                    padding: 12px;
                    text-align: center;
                    border-bottom: 1px solid #27272a;
                }
                .permissions-table th {
                    text-align: left;
                    font-size: 12px;
                    color: #a1a1aa;
                }
                .permissions-table td:first-child {
                    text-align: left;
                    font-weight: 500;
                    color: #e4e4e7;
                }
            `}</style>
        </div>
    )
}
