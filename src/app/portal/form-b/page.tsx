export default function FormBCertificatePage() {
    const certificates = [
        {
            certNo: 'FB/2026/MH/04521-A',
            issuedFor: 'A Wing — Sunrise Heights',
            issuedBy: 'Rudra Fire Protection Pvt. Ltd.',
            issueDate: '2026-01-15',
            validUntil: '2027-01-14',
            status: 'Valid',
            systems: 'Fire Alarm, Sprinkler, Hydrant, Fire Extinguishers',
        },
        {
            certNo: 'FB/2026/MH/04521-B',
            issuedFor: 'B Wing — Sunrise Heights',
            issuedBy: 'Rudra Fire Protection Pvt. Ltd.',
            issueDate: '2026-01-15',
            validUntil: '2027-01-14',
            status: 'Valid',
            systems: 'Fire Alarm, Sprinkler, Hydrant, Fire Extinguishers',
        },
        {
            certNo: 'FB/2025/MH/04521-C',
            issuedFor: 'C Wing — Sunrise Heights',
            issuedBy: 'Rudra Fire Protection Pvt. Ltd.',
            issueDate: '2025-01-20',
            validUntil: '2026-01-19',
            status: 'Expired',
            systems: 'Fire Alarm, Hydrant, Fire Extinguishers',
        },
    ]

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1 className="page-title">📜 Form B Certificates</h1>
                <p className="page-desc">Fire safety certificates issued under Maharashtra Fire Prevention and Life Safety Measures Act, 2006.</p>
            </div>

            <div className="cert-grid">
                {certificates.map((cert) => (
                    <div key={cert.certNo} className={`cert-card ${cert.status === 'Expired' ? 'cert-expired' : 'cert-valid'}`}>
                        <div className="cert-header">
                            <div className="cert-badge-row">
                                <span className={`status-badge ${cert.status === 'Valid' ? 'status-active' : 'status-inactive'}`}>
                                    {cert.status}
                                </span>
                            </div>
                            <h3 className="cert-title">{cert.issuedFor}</h3>
                            <p className="cert-no">Certificate No: {cert.certNo}</p>
                        </div>
                        <div className="cert-body">
                            <div className="cert-field">
                                <span className="cert-label">Issued By</span>
                                <span className="cert-value">{cert.issuedBy}</span>
                            </div>
                            <div className="cert-field">
                                <span className="cert-label">Issue Date</span>
                                <span className="cert-value">{cert.issueDate}</span>
                            </div>
                            <div className="cert-field">
                                <span className="cert-label">Valid Until</span>
                                <span className="cert-value" style={{ color: cert.status === 'Expired' ? '#f87171' : '#34d399' }}>
                                    {cert.validUntil}
                                </span>
                            </div>
                            <div className="cert-field">
                                <span className="cert-label">Systems Covered</span>
                                <span className="cert-value">{cert.systems}</span>
                            </div>
                        </div>
                        <div className="cert-footer">
                            <button className="cert-download-btn">
                                📥 Download PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
