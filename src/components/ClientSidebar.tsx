import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarProvider'
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'

const modules = [
    { name: 'Portal Home', href: '/portal', icon: '🏠' },
    { name: 'Society Info', href: '/portal/society-info', icon: '🏢' },
    { name: 'Service Report', href: '/portal/service-report', icon: '📋' },
    { name: 'How to Operate', href: '/portal/how-to-operate', icon: '🔧' },
    { name: 'Form B Certificate', href: '/portal/form-b', icon: '📜' },
    { name: 'Demo Video', href: '/portal/demo-video', icon: '🎬' },
    { name: 'SOP', href: '/portal/sop', icon: '📖' },
    { name: 'Evacuation Plan', href: '/portal/evacuation-plan', icon: '🚨' },
    { name: 'Notice of Violation', href: '/portal/violation-notice', icon: '⚠️' },
]

export default function ClientSidebar() {
    const pathname = usePathname()
    const { isCollapsed, toggleSidebar } = useSidebar()

    return (
        <aside className={`sidebar portal-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className={`sidebar-brand ${isCollapsed ? 'justify-center p-2' : ''}`}>
                <img src="/logo.png" alt="Rudra Fire Protection" className="brand-logo portal-brand-logo" />
                {!isCollapsed && <span className="brand-text">Client Portal</span>}
            </div>

            <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden">
                {!isCollapsed && <div className="nav-label">Fire Protection</div>}
                {modules.map((mod) => {
                    const isActive = pathname === mod.href
                    return (
                        <div key={mod.href} className="relative group">
                            <Link href={mod.href} className={`nav-item portal-nav-item ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">{mod.icon}</span>
                                {!isCollapsed && <span className="nav-text">{mod.name}</span>}
                            </Link>
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

            <div className="sidebar-footer p-4 border-t border-slate-100">
                {!isCollapsed && <div className="nav-label">Help</div>}
                <div className="relative group w-full mb-2">
                    <Link href="/portal" className={`nav-item portal-nav-item ${isCollapsed ? 'justify-center' : ''}`}>
                        <span className="nav-icon">{isCollapsed ? <HelpCircle className="w-5 h-5" /> : '📞'}</span>
                        {!isCollapsed && <span className="nav-text">Contact Support</span>}
                    </Link>
                </div>

                <button
                    onClick={toggleSidebar}
                    className={`nav-item w-full !text-slate-500 hover:!text-primary hover:!bg-slate-50 ${isCollapsed ? '!p-2 justify-center' : ''}`}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
                    {!isCollapsed && <span>Collapse Sidebar</span>}
                </button>
            </div>
        </aside>
    )
}
