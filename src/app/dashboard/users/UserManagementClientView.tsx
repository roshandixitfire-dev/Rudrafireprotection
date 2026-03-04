'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, List, LayoutGrid, Building2, Mail, KeyRound, Shield } from 'lucide-react'
import type { DemoUser } from '@/utils/supabase/demo-users'

interface Props {
    users: DemoUser[]
    passwords: Record<string, string>
}

export default function UserManagementClientView({ users, passwords }: Props) {
    const [activeTab, setActiveTab] = useState<'employees' | 'clients'>('employees')
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

    // Filter users by tab
    const tabUsers = users.filter(u =>
        activeTab === 'employees'
            ? (u.role === 'admin' || u.role === 'employee')
            : u.role === 'client'
    )

    // Filter users by search term
    const filteredUsers = tabUsers.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="dashboard-page">
            {/* Header & Main Actions */}
            <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4 mb-6">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block flex items-center gap-2">
                            Dashboard / Management
                        </span>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none">User Management</h1>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 border-t border-slate-100 pt-4">
                    {/* Tabs */}
                    <div className="flex bg-slate-50/50 rounded-xl p-1 border border-slate-100 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold tracking-wide transition-colors rounded-lg ${activeTab === 'employees' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Employees & Admins
                            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'employees' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                                {users.filter(u => u.role === 'admin' || u.role === 'employee').length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold tracking-wide transition-colors rounded-lg ${activeTab === 'clients' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Clients
                            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'clients' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                                {users.filter(u => u.role === 'client').length}
                            </span>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="search"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-9 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* View Toggles */}
                        <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 h-10">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-2.5 h-full rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-2.5 h-full rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Button */}
                        <Link
                            href={`/dashboard/users/create?role=${activeTab === 'clients' ? 'client' : 'employee'}`}
                            className="flex items-center justify-center gap-1.5 px-4 h-10 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 shadow-primary/25 hover:shadow-primary/40 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add {activeTab === 'clients' ? 'Client' : 'Employee'}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No users found</h3>
                    <p className="text-slate-500 max-w-sm mb-6">We couldn't find any {activeTab} matching your current search criteria.</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 uppercase text-[10px] font-extrabold text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Name & Role</th>
                                    <th className="px-6 py-4">Credentials</th>
                                    <th className="px-6 py-4">{activeTab === 'employees' ? 'Permissions' : 'Company'}</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : user.role === 'employee' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{user.fullName}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : user.role === 'employee' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-medium text-[13px]">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-mono text-[11px] tracking-wide">{passwords[user.email] || 'No password set'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {activeTab === 'clients' ? (
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    {user.company || 'N/A'}
                                                </div>
                                            ) : user.role === 'admin' ? (
                                                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded inline-flex">
                                                    <Shield className="w-3.5 h-3.5" /> Full Access
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                    {user.permissions?.map((p) => (
                                                        <span key={p.module} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                            {p.module}: {p.access}
                                                        </span>
                                                    ))}
                                                    {(!user.permissions || user.permissions.length === 0) && (
                                                        <span className="text-xs text-slate-400 italic">No modules</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/users/create?email=${user.email}&role=${user.role}`}
                                                className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl outline outline-offset-2 ${user.role === 'admin' ? 'bg-amber-100 text-amber-700 outline-amber-50' : user.role === 'employee' ? 'bg-indigo-100 text-indigo-700 outline-indigo-50' : 'bg-emerald-100 text-emerald-700 outline-emerald-50'}`}>
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{user.fullName}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block mt-1 ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : user.role === 'employee' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={`/dashboard/users/create?email=${user.email}&role=${user.role}`}
                                    className="text-slate-400 hover:text-primary transition-colors p-1"
                                    title="Edit User"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                                </Link>
                            </div>

                            <div className="space-y-3 mb-5 flex-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-2.5">
                                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Username (Email)</div>
                                        <div className="text-sm font-medium text-slate-700 break-all">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <KeyRound className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Password</div>
                                        <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 inline-block">
                                            {passwords[user.email] || 'No password set'}
                                        </div>
                                    </div>
                                </div>
                                {activeTab === 'clients' && user.company && (
                                    <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-200/60">
                                        <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Company</div>
                                            <div className="text-sm font-medium text-slate-700">{user.company}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {activeTab === 'employees' && (
                                <div className="mt-auto">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Assigned Permissions
                                    </div>
                                    {user.role === 'admin' ? (
                                        <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100/50 inline-block">
                                            Full Access to all modules
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.permissions?.slice(0, 4).map((p) => (
                                                <span key={p.module} className="inline-flex items-center px-2 py-1 rounded bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-200">
                                                    {p.module.substring(0, 3)}: {p.access.charAt(0).toUpperCase()}
                                                </span>
                                            ))}
                                            {user.permissions && user.permissions.length > 4 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-200">
                                                    +{user.permissions.length - 4} more
                                                </span>
                                            )}
                                            {(!user.permissions || user.permissions.length === 0) && (
                                                <span className="text-xs text-slate-400 italic">No modules</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
