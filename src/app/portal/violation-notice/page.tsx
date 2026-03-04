export default function ViolationNoticePage() {
    const violations = [
        {
            noticeNo: 'NOV-2026-003',
            date: '2026-02-10',
            severity: 'Critical',
            area: 'C Wing — 12th Floor',
            description: 'Emergency exit door found locked with padlock. Exit route blocked with stored furniture.',
            regulation: 'Maharashtra Fire Prevention Act, Section 6(1)(c)',
            deadline: '2026-02-17',
            status: 'Open',
            action: 'Remove all obstructions and ensure exit door opens freely. Install panic bar hardware.',
        },
        {
            noticeNo: 'NOV-2026-002',
            date: '2026-01-25',
            severity: 'Medium',
            area: 'B Wing — Basement Parking',
            description: 'Fire extinguishers in basement parking area found with expired refill dates (last refilled: June 2024).',
            regulation: 'IS 2190:2010 — Refill within 12 months',
            deadline: '2026-02-10',
            status: 'Resolved',
            action: 'All 8 extinguishers have been refilled and re-certified. Next due: Feb 2027.',
        },
        {
            noticeNo: 'NOV-2026-001',
            date: '2026-01-15',
            severity: 'Low',
            area: 'A Wing — 3rd Floor Corridor',
            description: 'Emergency exit signage not illuminated. Battery backup failure in exit sign lights.',
            regulation: 'NBC Part IV — Fire Protection, Clause 4.6.3',
            deadline: '2026-01-31',
            status: 'Resolved',
            action: 'Exit sign batteries replaced. All 14 signs verified operational.',
        },
    ]

    const getSeverityClass = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'severity-critical'
            case 'Medium': return 'severity-medium'
            case 'Low': return 'severity-low'
            default: return ''
        }
    }

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1 className="page-title">⚠️ Notice of Violation</h1>
                <p className="page-desc">Fire safety compliance violations observed during inspections and audits.</p>
            </div>

            <div className="violation-list">
                {violations.map((v) => (
                    <div key={v.noticeNo} className={`violation-card ${v.status === 'Open' ? 'violation-open' : 'violation-resolved'}`}>
                        <div className="violation-header">
                            <div className="violation-title-row">
                                <h3>{v.noticeNo}</h3>
                                <div className="violation-badges">
                                    <span className={`severity-badge ${getSeverityClass(v.severity)}`}>
                                        {v.severity}
                                    </span>
                                    <span className={`status-badge ${v.status === 'Open' ? 'status-inactive' : 'status-active'}`}>
                                        {v.status}
                                    </span>
                                </div>
                            </div>
                            <p className="violation-area">📍 {v.area}</p>
                            <p className="violation-date">Issued: {v.date} · Deadline: {v.deadline}</p>
                        </div>
                        <div className="violation-body">
                            <div className="violation-section">
                                <span className="violation-label">Violation</span>
                                <p>{v.description}</p>
                            </div>
                            <div className="violation-section">
                                <span className="violation-label">Regulation Reference</span>
                                <p className="violation-reg">{v.regulation}</p>
                            </div>
                            <div className="violation-section">
                                <span className="violation-label">Corrective Action</span>
                                <p>{v.action}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
