'use client'
import DataDisplay from '@/components/DataDisplay'

const columns = [
    { key: 'reportId', label: 'Report ID' },
    { key: 'serviceType', label: 'Service Type' },
    { key: 'date', label: 'Service Date' },
    { key: 'technician', label: 'Technician' },
    { key: 'findings', label: 'Findings' },
    { key: 'status', label: 'Status' },
]

const data = [
    { reportId: 'SR-2026-001', serviceType: 'Fire Alarm System Check', date: '2026-02-10', technician: 'Ravi Kumar', findings: 'All zones tested — OK', status: 'Completed' },
    { reportId: 'SR-2026-002', serviceType: 'Sprinkler System Maintenance', date: '2026-01-22', technician: 'Suresh Yadav', findings: '2 heads replaced in B Wing 7th floor', status: 'Completed' },
    { reportId: 'SR-2026-003', serviceType: 'Fire Extinguisher Refill', date: '2026-02-01', technician: 'Manoj Patel', findings: '24 units refilled, 3 condemned', status: 'Completed' },
    { reportId: 'SR-2026-004', serviceType: 'Hydrant Pump Testing', date: '2026-02-14', technician: 'Ravi Kumar', findings: 'Pump pressure at 7 kg/cm² — Normal', status: 'Completed' },
    { reportId: 'SR-2026-005', serviceType: 'PA System Repair', date: '2026-02-18', technician: 'Suresh Yadav', findings: 'Amplifier replaced in control room', status: 'In Progress' },
    { reportId: 'SR-2026-006', serviceType: 'Quarterly Fire Safety Audit', date: '2026-03-01', technician: 'Ravi Kumar', findings: 'Scheduled', status: 'Scheduled' },
]

export default function ServiceReportPage() {
    return <DataDisplay title="Service Reports" columns={columns} data={data} accentColor="#8b5cf6" />
}
