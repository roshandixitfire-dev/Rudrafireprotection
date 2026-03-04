'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { UserPermission, ModuleKey } from '@/utils/supabase/demo-users'
import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Target,
    CircleDollarSign,
    FileText,
    Wrench,
    Users,
    CalendarDays,
    CreditCard,
    UserCog
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import * as LucideIcons from 'lucide-react'

const ALL_MODULES = [
    { key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { key: 'crm', name: 'CRM', href: '/dashboard/crm', icon: 'Target' },
    { key: 'sales', name: 'Sales & Quotes', href: '/dashboard/sales', icon: 'CircleDollarSign' },
    { key: 'invoices', name: 'Invoices', href: '/dashboard/invoices', icon: 'FileText' },
    { key: 'services', name: 'Services', href: '/dashboard/services', icon: 'Wrench' },
    { key: 'team', name: 'Team & HR', href: '/dashboard/team', icon: 'Users' },
    { key: 'schedule', name: 'Task Scheduling', href: '/dashboard/team/schedule', icon: 'CalendarDays' },
    { key: 'payments', name: 'Payments', href: '/dashboard/payments', icon: 'CreditCard' },
    { key: 'users', name: 'User Management', href: '/dashboard/users', icon: 'UserCog' },
]

interface DashboardSidebarProps {
    role: 'admin' | 'employee' | 'client'
    permissions?: UserPermission[]
    email: string
}

export default function DashboardSidebar({ role, permissions, email }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Filter modules based on permissions
    const visibleModules = ALL_MODULES.filter(mod => {
        if (role === 'admin') return true // Admin sees everything
        // For employees, check if they have ANY access level for this module
        return permissions?.some(p => p.module === mod.key)
    })

    const handleSignOut = async () => {
        await fetch('/api/demo-logout', { method: 'POST' })
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className={`sidebar-brand relative flex items-center ${isCollapsed ? 'justify-center p-2' : 'p-4 gap-3'}`}>
                <div className={`bg-white rounded-xl shadow-sm border border-slate-100 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'p-1.5 w-12 h-12' : 'p-2 w-[52px] h-[52px]'}`}>
                    <img src="/logo.png" alt="Rudra Fire Protection" className="w-full h-full object-contain" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 leading-tight">Rudra Fire Protection</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 text-slate-500 rounded-full w-6 h-6 flex items-center justify-center hover:text-primary hover:border-primary/30 hover:bg-slate-50 shadow-sm transition-all z-10 hidden md:flex"
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </div>

            <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden">
                {!isCollapsed && (
                    <div className="nav-label">
                        {role === 'admin' ? 'Admin Panel' : 'Employee Panel'}
                    </div>
                )}
                {visibleModules.map((mod) => {
                    const isActive = pathname === mod.href || pathname.startsWith(`${mod.href}/`)
                    // Special check for dashboard home
                    const isExactActive = mod.href === '/dashboard' ? pathname === '/dashboard' : isActive

                    const IconComponent = mod.icon in LucideIcons
                        ? (LucideIcons as any)[mod.icon]
                        : null

                    return (
                        <div key={mod.href} className="relative group">
                            <Link href={mod.href} className={`nav-item ${isExactActive ? 'active' : ''}`}>
                                <span className="nav-icon">
                                    {IconComponent ? <IconComponent className="w-5 h-5" /> : mod.icon}
                                </span>
                                {!isCollapsed && <span className="nav-text">{mod.name}</span>}
                            </Link>

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-slate-700 pointer-events-none translate-x-1 group-hover:translate-x-0">
                                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
                                    {mod.name}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            <div className={`p-4 mt-auto border-t border-slate-100 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                <div className={`flex items-center gap-3 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold flex-shrink-0 border border-primary/20 shadow-sm">
                        {email[0].toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{email.split('@')[0]}</p>
                            <p className="text-xs text-slate-400 capitalize">{role}</p>
                        </div>
                    )}
                </div>

                <div className="relative group w-full">
                    <button
                        onClick={handleSignOut}
                        className={`nav-item w-full !text-slate-500 hover:!text-red-500 hover:!bg-red-50 ${isCollapsed ? '!p-2 justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                    {isCollapsed && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-red-500 pointer-events-none translate-x-1 group-hover:translate-x-0">
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rotate-45 border-l border-b border-red-500"></div>
                            Logout
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}
