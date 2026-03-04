'use client'
import DataDisplay from '@/components/DataDisplay'

const columns = [
    { key: 'serviceId', label: 'Service ID' },
    { key: 'serviceType', label: 'Service Type' },
    { key: 'date', label: 'Date' },
    { key: 'technician', label: 'Technician' },
    { key: 'status', label: 'Status' },
]

// Simulated client-scoped data (in production, this would be filtered server-side)
const data = [
    { serviceId: 'SRV-001', serviceType: 'Fire Alarm Installation', date: '2026-02-10', technician: 'Ravi Kumar', status: 'Completed' },
    { serviceId: 'SRV-007', serviceType: 'Sprinkler System Check', date: '2026-01-22', technician: 'Suresh Yadav', status: 'Completed' },
    { serviceId: 'SRV-012', serviceType: 'Fire Safety Audit', date: '2026-02-18', technician: 'Manoj Patel', status: 'Scheduled' },
]

export default function PortalServicesPage() {
    return <DataDisplay title="My Services" columns={columns} data={data} accentColor="#06b6d4" />
}
