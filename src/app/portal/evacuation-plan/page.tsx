export default function EvacuationPlanPage() {
    const assemblyPoints = [
        { id: 'AP-1', location: 'Main Garden (Front Gate)', capacity: '200 persons', wings: 'A Wing, B Wing' },
        { id: 'AP-2', location: 'Parking Lot (Rear Side)', capacity: '150 persons', wings: 'C Wing' },
    ]

    const exitRoutes = [
        { wing: 'A Wing', floors: '1-7', primaryExit: 'Staircase A1 → Main Lobby → Front Gate', secondaryExit: 'Staircase A2 → Side Exit → Garden' },
        { wing: 'A Wing', floors: '8-14', primaryExit: 'Staircase A1 → Main Lobby → Front Gate', secondaryExit: 'Refuge Area (8th Floor) → Staircase A2' },
        { wing: 'B Wing', floors: '1-7', primaryExit: 'Staircase B1 → Ground Corridor → Front Gate', secondaryExit: 'Staircase B2 → Side Exit → Garden' },
        { wing: 'B Wing', floors: '8-14', primaryExit: 'Staircase B1 → Ground Corridor → Front Gate', secondaryExit: 'Refuge Area (8th Floor) → Staircase B2' },
        { wing: 'C Wing', floors: '1-14', primaryExit: 'Staircase C1 → Rear Lobby → Parking Lot', secondaryExit: 'Staircase C2 → Service Road → Parking' },
    ]

    const wardens = [
        { name: 'Mr. Suresh Patil', role: 'Chief Fire Warden', zone: 'Entire Premises', contact: '+91 98765 11111' },
        { name: 'Mrs. Priya Sharma', role: 'Floor Warden', zone: 'A Wing (1-7)', contact: '+91 98765 22222' },
        { name: 'Mr. Ramesh Gupta', role: 'Floor Warden', zone: 'A Wing (8-14)', contact: '+91 98765 33333' },
        { name: 'Mr. Vikram Joshi', role: 'Floor Warden', zone: 'B Wing (1-7)', contact: '+91 98765 44444' },
        { name: 'Mrs. Anita Desai', role: 'Floor Warden', zone: 'B Wing (8-14)', contact: '+91 98765 55555' },
        { name: 'Mr. Raj Malhotra', role: 'Floor Warden', zone: 'C Wing', contact: '+91 98765 66666' },
    ]

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1 className="page-title">🚨 Evacuation Plan</h1>
                <p className="page-desc">Emergency evacuation routes, assembly points, and floor warden contacts.</p>
            </div>

            {/* Emergency Contacts Banner */}
            <div className="emergency-banner">
                <div className="emergency-item">
                    <span className="emergency-icon">🚒</span>
                    <div>
                        <span className="emergency-label">Fire Brigade</span>
                        <span className="emergency-number">101</span>
                    </div>
                </div>
                <div className="emergency-item">
                    <span className="emergency-icon">🚑</span>
                    <div>
                        <span className="emergency-label">Ambulance</span>
                        <span className="emergency-number">108</span>
                    </div>
                </div>
                <div className="emergency-item">
                    <span className="emergency-icon">👮</span>
                    <div>
                        <span className="emergency-label">Police</span>
                        <span className="emergency-number">100</span>
                    </div>
                </div>
                <div className="emergency-item">
                    <span className="emergency-icon">🏢</span>
                    <div>
                        <span className="emergency-label">Society Security</span>
                        <span className="emergency-number">+91 98765 00000</span>
                    </div>
                </div>
            </div>

            {/* Assembly Points */}
            <div className="info-card">
                <div className="info-card-header">
                    <span className="info-card-icon">📍</span>
                    <h2>Assembly Points</h2>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Location</th>
                                <th>Capacity</th>
                                <th>Designated For</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assemblyPoints.map((ap) => (
                                <tr key={ap.id}>
                                    <td style={{ fontWeight: 600, color: '#f4f4f5' }}>{ap.id}</td>
                                    <td>{ap.location}</td>
                                    <td>{ap.capacity}</td>
                                    <td>{ap.wings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Exit Routes */}
            <div className="info-card">
                <div className="info-card-header">
                    <span className="info-card-icon">🚪</span>
                    <h2>Exit Routes</h2>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Wing</th>
                                <th>Floors</th>
                                <th>Primary Exit Route</th>
                                <th>Secondary Exit Route</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exitRoutes.map((route, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: '#f4f4f5' }}>{route.wing}</td>
                                    <td>{route.floors}</td>
                                    <td>{route.primaryExit}</td>
                                    <td>{route.secondaryExit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floor Wardens */}
            <div className="info-card">
                <div className="info-card-header">
                    <span className="info-card-icon">👷</span>
                    <h2>Fire Wardens</h2>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Zone</th>
                                <th>Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wardens.map((w, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: '#f4f4f5' }}>{w.name}</td>
                                    <td>
                                        <span className={`status-badge ${w.role === 'Chief Fire Warden' ? 'status-active' : 'status-pending'}`}>
                                            {w.role}
                                        </span>
                                    </td>
                                    <td>{w.zone}</td>
                                    <td>{w.contact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
