'use client'
import DataDisplay from '@/components/DataDisplay'

const columns = [
    { key: 'paymentId', label: 'Payment ID' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'date', label: 'Date' },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status' },
]

// Simulated client-scoped data
const data = [
    { paymentId: 'PAY-001', amount: '₹45,000', date: '2026-02-08', method: 'Bank Transfer', status: 'Received' },
    { paymentId: 'PAY-008', amount: '₹22,000', date: '2026-01-15', method: 'UPI', status: 'Received' },
    { paymentId: 'PAY-015', amount: '₹38,500', date: '2026-02-20', method: 'Bank Transfer', status: 'Pending' },
]

export default function PortalPaymentsPage() {
    return <DataDisplay title="My Payments" columns={columns} data={data} accentColor="#f59e0b" />
}
