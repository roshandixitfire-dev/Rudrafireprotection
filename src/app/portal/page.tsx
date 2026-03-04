import { getUserWithRole } from '@/utils/supabase/auth'

export default async function PortalHome() {
    const userWithRole = await getUserWithRole()
    const displayName = userWithRole?.fullName || userWithRole?.user.email || 'Client'
    const company = userWithRole?.company || 'Your Society'

    const modules = [
        { name: 'Society Info', href: '/portal/society-info', icon: '🏢', desc: 'View society, floor & system details', color: '#06b6d4' },
        { name: 'Service Report', href: '/portal/service-report', icon: '📋', desc: 'Check your service history', color: '#8b5cf6' },
        { name: 'How to Operate', href: '/portal/how-to-operate', icon: '🔧', desc: 'Guides for your fire systems', color: '#f59e0b' },
        { name: 'Form B Certificate', href: '/portal/form-b', icon: '📜', desc: 'View & download certificates', color: '#10b981' },
        { name: 'Demo Video', href: '/portal/demo-video', icon: '🎬', desc: 'Watch system demo videos', color: '#ef4444' },
        { name: 'SOP', href: '/portal/sop', icon: '📖', desc: 'Standard operating procedures', color: '#6366f1' },
        { name: 'Evacuation Plan', href: '/portal/evacuation-plan', icon: '🚨', desc: 'Emergency exit routes & plans', color: '#ec4899' },
        { name: 'Notice of Violation', href: '/portal/violation-notice', icon: '⚠️', desc: 'Compliance violation notices', color: '#f97316' },
    ]

    return (
        <div>
            <div className="portal-welcome">
                <div className="portal-welcome-content">
                    <h2>Welcome back, {displayName}!</h2>
                    <p className="portal-company-name">{company}</p>
                    <p className="portal-welcome-desc">
                        Access your fire protection documents, service reports, certificates, and safety plans — all in one place.
                    </p>
                </div>
                <div className="portal-welcome-graphic">🛡️</div>
            </div>

            <div className="module-grid">
                {modules.map((mod) => (
                    <a key={mod.name} href={mod.href} className="module-card" style={{ '--module-color': mod.color } as React.CSSProperties}>
                        <div className="module-card-icon">{mod.icon}</div>
                        <div className="module-card-body">
                            <h3 className="module-card-title">{mod.name}</h3>
                            <p className="module-card-desc">{mod.desc}</p>
                        </div>
                        <span className="module-card-arrow">→</span>
                    </a>
                ))}
            </div>
        </div>
    )
}
