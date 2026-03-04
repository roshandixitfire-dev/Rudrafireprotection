export default function SOPPage() {
    const sops = [
        {
            id: 'SOP-001',
            title: 'Fire Emergency Response',
            category: 'Emergency',
            icon: '🔥',
            color: '#ef4444',
            lastUpdated: '2026-01-10',
            sections: [
                'On discovering fire, activate the nearest manual call point.',
                'Call Fire Brigade: Dial 101 / Contact Security Room.',
                'Alert occupants using PA system or shouting "FIRE".',
                'If safe, attempt to extinguish using nearest fire extinguisher.',
                'If fire is uncontrollable, evacuate via nearest staircase (NOT lift).',
                'Proceed to the designated assembly point.',
                'Do NOT re-enter the building until cleared by fire officer.',
            ],
        },
        {
            id: 'SOP-002',
            title: 'Evacuation Procedure',
            category: 'Evacuation',
            icon: '🚪',
            color: '#f59e0b',
            lastUpdated: '2026-01-10',
            sections: [
                'On hearing the evacuation alarm, stop all work immediately.',
                'Do NOT use lifts — use staircase only.',
                'Walk, do not run. Stay calm and help others.',
                'Floor wardens guide occupants to the nearest exit.',
                'Check rooms and close doors behind you (do NOT lock).',
                'Assemble at the designated assembly point in the open area.',
                'Floor wardens take headcount and report to the chief warden.',
            ],
        },
        {
            id: 'SOP-003',
            title: 'Fire Extinguisher Maintenance',
            category: 'Maintenance',
            icon: '🧯',
            color: '#06b6d4',
            lastUpdated: '2025-12-15',
            sections: [
                'Monthly: Visual inspection — check pressure gauge, pin, seal.',
                'Quarterly: Professional inspection by certified technician.',
                'Annually: Hydrostatic testing and refilling.',
                'Ensure extinguishers are mounted at correct height (3.5 ft from floor).',
                'Replace any extinguisher with damaged hose, pin, or gauge.',
                'Maintain a log of all inspection dates and findings.',
            ],
        },
        {
            id: 'SOP-004',
            title: 'Fire Pump Room Operations',
            category: 'Operations',
            icon: '⚙️',
            color: '#8b5cf6',
            lastUpdated: '2025-12-15',
            sections: [
                'Ensure pump room is accessible 24/7 — no storage allowed.',
                'Check pump AUTO mode is enabled at all times.',
                'Weekly: Run jockey pump and main pump for 10 minutes each.',
                'Monthly: Check water tank levels and refill valves.',
                'Quarterly: Full flow test — verify pressure at highest hydrant.',
                'Log all pump run hours and maintenance activities.',
            ],
        },
    ]

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1 className="page-title">📖 Standard Operating Procedures</h1>
                <p className="page-desc">Documented procedures for fire safety operations, maintenance, and emergency response.</p>
            </div>

            <div className="sop-list">
                {sops.map((sop) => (
                    <div key={sop.id} className="sop-card" style={{ '--sop-color': sop.color } as React.CSSProperties}>
                        <div className="sop-header">
                            <div className="sop-title-row">
                                <span className="sop-icon">{sop.icon}</span>
                                <div>
                                    <h3 className="sop-title">{sop.title}</h3>
                                    <span className="sop-meta">{sop.id} · Updated {sop.lastUpdated}</span>
                                </div>
                            </div>
                            <span className="sop-category" style={{ background: `${sop.color}20`, color: sop.color }}>
                                {sop.category}
                            </span>
                        </div>
                        <ol className="sop-steps">
                            {sop.sections.map((step, i) => (
                                <li key={i}>
                                    <span className="sop-step-num" style={{ color: sop.color }}>{String(i + 1).padStart(2, '0')}</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                ))}
            </div>
        </div>
    )
}
