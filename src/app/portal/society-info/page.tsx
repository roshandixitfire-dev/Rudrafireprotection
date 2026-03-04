export default function SocietyInfoPage() {
    const societyData = {
        societyName: 'Sunrise Heights Co-op Housing Society',
        registrationNo: 'MH/HSG/2019/04521',
        address: 'Plot No. 45, Sector 17, Vashi, Navi Mumbai - 400703',
        totalFloors: 14,
        totalWings: 3,
        wings: ['A Wing', 'B Wing', 'C Wing'],
    }

    const floors = [
        { floor: 'Basement', systems: 'Sprinkler System, Fire Hydrant', status: 'Active' },
        { floor: 'Ground Floor', systems: 'Fire Extinguisher, Smoke Detector', status: 'Active' },
        { floor: '1st - 5th Floor', systems: 'Smoke Detector, Fire Hose Reel', status: 'Active' },
        { floor: '6th - 10th Floor', systems: 'Smoke Detector, Fire Hose Reel', status: 'Active' },
        { floor: '11th - 14th Floor', systems: 'Smoke Detector, Sprinkler, Fire Hose Reel', status: 'Active' },
        { floor: 'Terrace', systems: 'Fire Hydrant, Water Storage Tank', status: 'Active' },
    ]

    const systems = [
        { type: 'Fire Alarm System', make: 'Honeywell', model: 'Notifier NFS2-3030', installed: '2020-03-15', lastService: '2026-01-20', status: 'Operational' },
        { type: 'Sprinkler System', make: 'Tyco', model: 'TY-FRB', installed: '2020-03-15', lastService: '2026-01-20', status: 'Operational' },
        { type: 'Fire Hydrant System', make: 'Kirloskar', model: 'KDS-Series', installed: '2020-03-15', lastService: '2025-12-10', status: 'Operational' },
        { type: 'Smoke Detectors', make: 'Siemens', model: 'FDO241', installed: '2020-03-15', lastService: '2026-01-20', status: 'Operational' },
        { type: 'Fire Extinguishers', make: 'Ceasefire', model: 'ABC Type 6kg', installed: '2024-06-01', lastService: '2026-02-01', status: 'Operational' },
        { type: 'PA System', make: 'Bosch', model: 'Plena', installed: '2020-05-10', lastService: '2025-11-15', status: 'Under Maintenance' },
    ]

    return (
        <div className="portal-page">
            {/* Society Details Card */}
            <div className="info-card highlight-card">
                <div className="info-card-header">
                    <span className="info-card-icon">🏢</span>
                    <h2>Society Information</h2>
                </div>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Society Name</span>
                        <span className="info-value highlight">{societyData.societyName}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Registration No.</span>
                        <span className="info-value">{societyData.registrationNo}</span>
                    </div>
                    <div className="info-item full-width">
                        <span className="info-label">Address</span>
                        <span className="info-value">{societyData.address}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Total Floors</span>
                        <span className="info-value">{societyData.totalFloors}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Wings</span>
                        <span className="info-value">{societyData.wings.join(', ')}</span>
                    </div>
                </div>
            </div>

            {/* Floor-wise Breakdown */}
            <div className="info-card">
                <div className="info-card-header">
                    <span className="info-card-icon">🏗️</span>
                    <h2>Floor-wise Fire System Coverage</h2>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Floor</th>
                                <th>Fire Fighting Systems</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {floors.map((f, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.floor}</td>
                                    <td>{f.systems}</td>
                                    <td><span className="status-badge status-active">{f.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fire Fighting Systems */}
            <div className="info-card">
                <div className="info-card-header">
                    <span className="info-card-icon">🧯</span>
                    <h2>Fire Fighting System Details</h2>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>System Type</th>
                                <th>Make</th>
                                <th>Model</th>
                                <th>Installed</th>
                                <th>Last Service</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {systems.map((s, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.type}</td>
                                    <td>{s.make}</td>
                                    <td>{s.model}</td>
                                    <td>{s.installed}</td>
                                    <td>{s.lastService}</td>
                                    <td>
                                        <span className={`status-badge ${s.status === 'Operational' ? 'status-active' : 'status-pending'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
