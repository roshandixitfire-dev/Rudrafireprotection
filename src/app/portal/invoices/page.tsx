'use client'
import DataDisplay from '@/components/DataDisplay'

const columns = [
    { key: 'invoiceNo', label: 'Invoice No.' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status' },
]

// Simulated client-scoped data
const data = [
    { invoiceNo: 'INV-2026-001', amount: '₹45,000', issueDate: '2026-02-01', dueDate: '2026-02-28', status: 'Paid' },
    { invoiceNo: 'INV-2026-008', amount: '₹22,000', issueDate: '2026-01-10', dueDate: '2026-02-10', status: 'Paid' },
    { invoiceNo: 'INV-2026-015', amount: '₹38,500', issueDate: '2026-02-15', dueDate: '2026-03-15', status: 'Unpaid' },
    { invoiceNo: 'INV-2026-019', amount: '₹12,800', issueDate: '2026-02-18', dueDate: '2026-03-18', status: 'Draft' },
]

export default function PortalInvoicesPage() {
    return <DataDisplay title="My Invoices" columns={columns} data={data} accentColor="#10b981" />
}
