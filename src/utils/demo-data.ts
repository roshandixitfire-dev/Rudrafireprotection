
export const DEMO_CLIENTS = [
    {
        id: 7,
        name: "Donam Maria Co op Housing Society",
        area: "Borivali West",
        address: "Borivali West",
        contact_name: "Arun Corola",
        contact_person: "Secretary",
        contract_value: "18000",
        category: "Residential",
        status: "Active",
        priority: "Low",
        service_plan: "Quarterly",
        amc_start_date: "2019-01-01",
        amc_end_date: "2019-12-31"
    },
    {
        id: 8,
        name: "Mala Palace Co Op Housing Society",
        area: "Vile Parle West",
        address: "Dadabhai Cross Road, vile Parle West, Mumbai ",
        contact_name: "Vipul Bhai",
        contact_person: "Member",
        contract_value: "37000",
        category: "Residential",
        status: "Active",
        priority: "Medium",
        service_plan: "Quarterly",
        amc_start_date: "2026-01-01",
        amc_end_date: "2026-12-31",
        phone: "9999999999"
    },
    {
        id: 9,
        name: "Sunrise Heights",
        area: "Thane West",
        address: "Thane West",
        contact_name: "Rajesh Shinde",
        contact_person: "Chairman",
        contract_value: "25000",
        category: "Residential",
        status: "Active",
        priority: "High",
        service_plan: "Monthly",
        amc_start_date: "2026-02-01",
        amc_end_date: "2027-01-31"
    }
];

export const DEMO_ACTIVITIES = [
    {
        id: 1,
        activity_date: "2026-02-20",
        activity_time: "10:30:00",
        client_name: "Donam Maria Co op Housing Society",
        activity_type: "Fire Alarm Service",
        remarks: "Monthly routine checkup done. All sensors working.",
        next_reminder_date: "2026-03-20",
        reminder_status: "Pending",
        reminder_type: "Service"
    },
    {
        id: 2,
        activity_date: "2026-02-22",
        activity_time: "14:15:00",
        client_name: "Mala Palace Co Op Housing Society",
        activity_type: "Hydrant Inspection",
        remarks: "Pump tested, pressure maintained at 7 bar.",
        next_reminder_date: "2026-05-22",
        reminder_status: "Pending",
        reminder_type: "Service"
    }
];

export const DEMO_SERVICES = [
    { id: 1, serviceId: 'SRV-001', client: 'Sunrise Heights', type: 'Fire Alarm Check', date: '2026-02-10', technician: 'Rajesh Kumar', status: 'Completed' },
    { id: 2, serviceId: 'SRV-002', client: 'Mala Palace', type: 'Hydrant Inspection', date: '2026-02-12', technician: 'Suresh Patil', status: 'In Progress' },
    { id: 3, serviceId: 'SRV-003', client: 'Donam Maria', type: 'Extinguisher Refill', date: '2026-02-14', technician: 'Amit Singh', status: 'Scheduled' }
];

export const DEMO_PAYMENTS = [
    { id: 1, paymentId: 'PAY-1001', client: 'Sunrise Heights', amount: '25,000', date: '2026-02-01', method: 'Bank Transfer', status: 'Completed' },
    { id: 2, paymentId: 'PAY-1002', client: 'Mala Palace', amount: '12,500', date: '2026-02-05', method: 'UPI', status: 'Completed' }
];

export const DEMO_INVOICES = [
    { id: 1, invoiceNo: 'INV-2026-001', client: 'Sunrise Heights', amount: '25,000', issueDate: '2026-01-15', dueDate: '2026-01-30', status: 'Paid' },
    { id: 2, invoiceNo: 'INV-2026-002', client: 'Mala Palace', amount: '12,500', issueDate: '2026-01-20', dueDate: '2026-02-05', status: 'Paid' }
];

export const DEMO_LEADS = [
    {
        id: 1,
        sr_no: "1",
        project_name: "Runwal Symphony",
        developer: "Runwal Developers",
        location: "Santacruz",
        stage: "Qualified",
        category: "Hot",
        finalizing_authority: "Manisha Thakur",
        source: "WOM",
        sales_form_date: "10/12/2012"
    },
    {
        id: 2,
        sr_no: "2",
        project_name: "Samarpan Exotica",
        developer: "Kanakia Spaces",
        location: "Borivali",
        stage: "Qualified",
        category: "Hot",
        finalizing_authority: "Sabir",
        source: "Referral",
        sales_form_date: "16/03/2013"
    },
    {
        id: 3,
        sr_no: "3",
        project_name: "Satra Park",
        developer: "Satra Group",
        location: "Borivali",
        stage: "Quoted",
        category: "Hot",
        finalizing_authority: "Vinod Pokharkar",
        source: "Referral",
        sales_form_date: "16/03/2013"
    }
];
