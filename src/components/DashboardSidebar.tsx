'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { UserPermission } from '@/utils/supabase/demo-users'
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
    UserCog,
    X,
    Menu
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import * as LucideIcons from 'lucide-react'
import { useSidebar } from '@/components/SidebarProvider'

const ALL_MODULES = [
    { key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { key: 'crm', name: 'CRM', href: '/dashboard/crm', icon: 'Target' },
    { key: 'sales', name: 'Sales', href: '/dashboard/sales', icon: 'CircleDollarSign' },
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
    const { isCollapsed, setIsCollapsed } = useSidebar()
    const [mobileOpen, setMobileOpen] = useState(false)

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    // Prevent body scroll when menu open on mobile
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    const visibleModules = ALL_MODULES.filter(mod => {
        if (role === 'admin') return true
        return permissions?.some(p => p.module === mod.key)
    })

    const handleSignOut = async () => {
        await fetch('/api/demo-logout', { method: 'POST' })
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const NavItems = ({ collapsedMode = false, onItemClick }: { collapsedMode?: boolean; onItemClick?: () => void }) => (
        <>
            {!collapsedMode && (
                <div className="nav-label">
                    {role === 'admin' ? 'Admin Panel' : 'Employee Panel'}
                </div>
            )}
            {visibleModules.map((mod) => {
                const isActive = pathname === mod.href || pathname.startsWith(`${mod.href}/`)
                const isExactActive = mod.href === '/dashboard' ? pathname === '/dashboard' : isActive
                const IconComponent = mod.icon in LucideIcons ? (LucideIcons as any)[mod.icon] : null

                return (
                    <div key={mod.href} className="relative group">
                        <Link
                            href={mod.href}
                            className={`nav-item ${isExactActive ? 'active' : ''}`}
                            onClick={onItemClick}
                        >
                            <span className="nav-icon">
                                {IconComponent ? <IconComponent className="w-5 h-5" /> : mod.icon}
                            </span>
                            {!collapsedMode && <span className="nav-text">{mod.name}</span>}
                        </Link>
                        {collapsedMode && (
                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-slate-700 pointer-events-none translate-x-1 group-hover:translate-x-0">
                                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
                                {mod.name}
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )

    return (
        <>
            {/* ── MOBILE TOP BAR ─────────────────────────────────────────────── */}
            <div className="mobile-topbar !justify-end">
                <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setMobileOpen(true)}
                    className="hamburger-btn"
                    aria-label="Open menu"
                >
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                </button>
            </div>

            {/* ── MOBILE OVERLAY ──────────────────────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── MOBILE DRAWER ───────────────────────────────────────────────── */}
            <aside className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
                <div className="mobile-drawer-header">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Rudra" className="h-10 w-auto object-contain" />
                        <span className="text-sm font-bold text-slate-900">Rudra Fire Protection</span>
                    </div>
                    <button type="button" suppressHydrationWarning onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="sidebar-nav flex-1 overflow-y-auto">
                    <NavItems onItemClick={() => setMobileOpen(false)} />
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                            {email[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{email.split('@')[0]}</p>
                            <p className="text-xs text-slate-400 capitalize">{role}</p>
                        </div>
                    </div>
                    <button type="button" suppressHydrationWarning onClick={handleSignOut} className="nav-item w-full !text-slate-500 hover:!text-red-500 hover:!bg-red-50">
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
            <aside 
                className={`sidebar transition-all duration-300 ${isCollapsed ? 'collapsed' : ''}`}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >
                <div className={`sidebar-brand relative flex items-center ${isCollapsed ? 'justify-center p-4' : 'p-4 gap-4'}`}>
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <img src="/logo.png" alt="Rudra" className="w-7 h-7 object-contain brightness-0 invert" />
                    </div>
                    {!isCollapsed && (
                        <span className="brand-text">Rudra Fire</span>
                    )}
                </div>

                <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden">
                    <NavItems collapsedMode={isCollapsed} />
                </nav>

                <div className={`p-4 mt-auto border-t border-slate-800/50 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white flex items-center justify-center font-bold flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                            {email[0].toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{email.split('@')[0]}</p>
                                <p className="text-xs text-slate-500 capitalize">{role}</p>
                            </div>
                        )}
                    </div>

                    <div className="relative group w-full">
                        <button
                            type="button"
                            suppressHydrationWarning
                            onClick={handleSignOut}
                            className={`nav-item w-full !text-slate-500 dark:!text-slate-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10 ${isCollapsed ? '!p-2 justify-center' : ''}`}
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
