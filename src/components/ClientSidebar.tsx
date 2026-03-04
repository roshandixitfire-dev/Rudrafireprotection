'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

    return (
        <aside className="sidebar portal-sidebar">
            <div className="sidebar-brand">
                <img src="/logo.png" alt="Rudra Fire Protection" className="brand-logo portal-brand-logo" />
                <span className="brand-text">Client Portal</span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-label">Fire Protection</div>
                {modules.map((mod) => {
                    const isActive = pathname === mod.href
                    return (
                        <Link key={mod.href} href={mod.href} className={`nav-item portal-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">{mod.icon}</span>
                            <span className="nav-text">{mod.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="nav-label">Help</div>
                <Link href="/portal" className="nav-item portal-nav-item">
                    <span className="nav-icon">📞</span>
                    <span className="nav-text">Contact Support</span>
                </Link>
            </div>
        </aside>
    )
}
