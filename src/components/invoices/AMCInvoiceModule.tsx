'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AMCInvoiceData, AMCInvoiceItem, AMCPackage } from './AMCInvoicePreview';
import AMCInvoicePreview from './AMCInvoicePreview';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DEFAULT_AMC_ITEMS: AMCInvoiceItem[] = [
    { id: '1', srNo: '1', title: 'Non- Comprehensive Annual Maintenance Contract for Fire Hydrant/Sprinkler System', description: '', qty: '4', unit: 'Visit', rate: 0, amount: 0, rowSpan: 2 },
    { id: '2', srNo: '', title: 'Non- Comprehensive Annual Maintenance Contract for Fire Alarm System', description: '', qty: '', unit: '', rate: 0, amount: 0, isMergedChild: true },
    { id: '3', srNo: '2', title: 'Form B Certificate For Maintainece Of System At Premises for Every 6 Month MFB.', description: '', qty: '2', unit: 'Nos', rate: 0, amount: 0 },
];

const DEFAULT_AMC_PACKAGES: AMCPackage[] = [
    { years: 2, amount: 148000, label: '2 Years Package' },
    { years: 3, amount: 198500, label: '3 Years Package' },
    { years: 5, amount: 292500, label: '5 Years Package' },
];

const DEFAULT_AMC_TERMS = [
    'Payment: 100% advance with confirmed W.O. for Spare parts.',
    'In Non-Comprehensive contract any replacement of spare parts and component is not included. It includes only service rendered for servicing of the system. The repairs required for any hardware will be charged extra as actual.',
    'Our Service team will visit the premises every months for preventive maintenance & servicing of the system & will attend unlimited breakdown Calls.',
    'If ladders etc. required for servicing of the equipment’s then same will be in your scope.',
    'If any Carpentry, Electrical or Civil work are required, then same will be in your scope.',
    'Extra Cost for repairing of leakages/ alteration on Sprinkler System/ Alarm System',
    'Taxes are extra as shown above. Taxes will be applicable / vary as per Govt. Policy.',
];

const getINVFYLabel = (): string => {
    const d = new Date();
    const month = d.getMonth() + 1;
    let startYear = d.getFullYear();
    if (month < 4) startYear -= 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(2)}-${String(endYear).slice(2)}`;
};

const genInvoiceNo = (type: 'performa' | 'tax'): string => {
    const fyLabel = getINVFYLabel();
    const prefix = type === 'performa' ? 'PI' : 'TI';
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `RFP/${prefix}/${fyLabel}/00${seq}`;
};

const AMC_INV_DRAFT_KEY = 'rudra-amc-invoice-draft';

const AMCInvoiceModule: React.FC<{ tabs?: React.ReactNode }> = ({ tabs }) => {
    const [data, setData] = useState<AMCInvoiceData>({
        invoiceType: 'tax',
        invoiceNo: '',
        date: '',
        toTitle: 'The Hon Chairman/ Hon Secretary,',
        companyName: '', street: '', location: '', city: '', state: 'Maharashtra', pin: '',
        contactPerson: '', contactNumber: '',
        items: DEFAULT_AMC_ITEMS,
        packages: DEFAULT_AMC_PACKAGES,
        terms: DEFAULT_AMC_TERMS,
        totalAmount: 82500,
    });

    const [showPreview, setShowPreview] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [savedId, setSavedId] = useState<string | null>(null);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const saved = localStorage.getItem(AMC_INV_DRAFT_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.data) {
                    setData(parsed.data);
                    if (parsed.savedId) setSavedId(parsed.savedId);
                    return;
                }
            }
        } catch {}

        // No draft — fetch DB sequence number
        const type = 'tax';
        const fyLabel = getINVFYLabel();
        const prefix = 'TI';
        const key = `amcinv-${prefix}-${fyLabel}`;
        supabase.rpc('next_doc_sequence', { p_key: key }).then(({ data: seq, error }) => {
            const no = (!error && seq)
                ? `RFP/${prefix}/${fyLabel}/${String(seq).padStart(5, '0')}`
                : genInvoiceNo(type);
            setData(prev => ({ ...prev, date: today, invoiceNo: no, invoiceType: type }));
        });
    }, []);

    // Auto-save draft to localStorage
    useEffect(() => {
        const t = setTimeout(() => {
            localStorage.setItem(AMC_INV_DRAFT_KEY, JSON.stringify({ data, savedId }));
        }, 600);
        return () => clearTimeout(t);
    }, [data, savedId]);

    const handleTypeChange = (newType: 'performa' | 'tax') => {
        const fyLabel = getINVFYLabel();
        const prefix = newType === 'performa' ? 'PI' : 'TI';
        const key = `amcinv-${prefix}-${fyLabel}`;
        supabase.rpc('next_doc_sequence', { p_key: key }).then(({ data: seq, error }) => {
            const no = (!error && seq)
                ? `RFP/${prefix}/${fyLabel}/${String(seq).padStart(5, '0')}`
                : genInvoiceNo(newType);
            setData(prev => ({ ...prev, invoiceType: newType, invoiceNo: no }));
        });
    };

    const updateField = (field: keyof AMCInvoiceData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateItem = (id: string, field: keyof AMCInvoiceItem, value: any) => {
        setData(prev => ({
            ...prev,
            items: prev.items.map(it => it.id === id ? { ...it, [field]: value } : it)
        }));
    };

    const updatePackage = (index: number, field: keyof AMCPackage, value: any) => {
        setData(prev => {
            const pkgs = [...prev.packages];
            pkgs[index] = { ...pkgs[index], [field]: value };
            return { ...prev, packages: pkgs };
        });
    };

    const saveAMCInvoice = async () => {
        if (!data.companyName.trim()) {
            alert('Please enter a Company Name before saving.');
            return;
        }

        setSaveStatus('saving');
        try {
            const payload = {
                invoice_number: data.invoiceNo,
                invoice_type: data.invoiceType,
                invoice_date: data.date,
                to_title: data.toTitle,
                company_name: data.companyName,
                street: data.street,
                location: data.location,
                city: data.city,
                state: data.state,
                pin: data.pin,
                contact_person: data.contactPerson,
                contact_number: data.contactNumber,
                items: data.items,
                packages: data.packages,
                terms: data.terms,
                grand_total: data.totalAmount,
                updated_at: new Date().toISOString(),
            };

            const { data: res, error } = savedId
                ? await supabase.from('amc_invoices').update(payload).eq('id', savedId).select('id').single()
                : await supabase.from('amc_invoices').insert(payload).select('id').single();

            if (error) {
                if (error.code === '23505') {
                    alert(`The invoice number "${data.invoiceNo}" already exists.`);
                }
                throw error;
            }

            if (res?.id) setSavedId(res.id);

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    if (showPreview) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#444' }}>
                <div className="no-print" style={{
                    display: 'flex', gap: 10, padding: '8px 16px', background: '#1a1a1a',
                    borderBottom: '1px solid #333', alignItems: 'center', flexShrink: 0
                }}>
                    <button onClick={() => setShowPreview(false)} style={{ padding: '6px 14px', background: '#555', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>← Edit</button>
                    <button onClick={() => window.print()} style={{ padding: '6px 14px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>🖨 Print / PDF</button>
                    <span style={{ color: '#aaa', fontSize: 11, marginLeft: 'auto' }}>AMC Preview Mode</span>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '20px 0' }}>
                    <div style={{ width: 'fit-content', margin: '0 auto', padding: '0 20px' }}>
                        <AMCInvoicePreview data={data} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '12px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }} className="no-print">
                {tabs ? tabs : <h2 style={{ margin: 0, fontSize: 16, color: '#E3242B' }}>🛡️ AMC Invoice</h2>}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={saveAMCInvoice} disabled={saveStatus === 'saving'}
                        style={{ padding: '8px 18px', background: saveStatus === 'saved' ? '#4caf50' : '#333', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}
                    </button>
                    <button onClick={() => setShowPreview(true)} style={{ padding: '8px 18px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Preview / Print →</button>
                </div>
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, cursor: 'pointer' }}>
                        <input type="radio" name="invType" checked={data.invoiceType === 'tax'} onChange={() => handleTypeChange('tax')} />
                        Tax Invoice
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, cursor: 'pointer' }}>
                        <input type="radio" name="invType" checked={data.invoiceType === 'performa'} onChange={() => handleTypeChange('performa')} />
                        Performa Invoice
                    </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Invoice Number</label>
                        <input value={data.invoiceNo} onChange={e => updateField('invoiceNo', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Date</label>
                        <input type="date" value={data.date || ''} onChange={e => updateField('date', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                </div>
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏢 Recipient Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Salutation / Title</label>
                        <input value={data.toTitle} onChange={e => updateField('toTitle', e.target.value)} placeholder="e.g. The Hon Chairman/ Hon Secretary," style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Company Name (from CRM) *</label>
                        <input value={data.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="Type to search clients..." style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Street / Address</label>
                        <input value={data.street} onChange={e => updateField('street', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Location / Area</label>
                        <input value={data.location} onChange={e => updateField('location', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>City / District</label>
                            <input value={data.city} onChange={e => updateField('city', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>State</label>
                            <input value={data.state} onChange={e => updateField('state', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>PIN</label>
                            <input value={data.pin} onChange={e => updateField('pin', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Contact Person</label>
                        <input value={data.contactPerson} onChange={e => updateField('contactPerson', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Contact Number</label>
                        <input value={data.contactNumber} onChange={e => updateField('contactNumber', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '13px' }} />
                    </div>
                </div>
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Line Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>Sr</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>Description</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>Qty</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map(item => (
                            <tr key={item.id}>
                                <td style={{ border: '1px solid #ddd', padding: '3px', textAlign: 'center' }}>{item.srNo}</td>
                                <td style={{ border: '1px solid #ddd', padding: '3px' }}>
                                    <input value={item.title} onChange={e => updateItem(item.id, 'title', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent' }} />
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '3px' }}>
                                    <input value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '3px' }}>
                                    <input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <label style={{ fontWeight: 700 }}>Total Amount: </label>
                    <input
                        type="number"
                        value={isNaN(data.totalAmount) ? '' : data.totalAmount}
                        onChange={e => updateField('totalAmount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        style={{ padding: '4px', width: '100px' }}
                    />
                </div>
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Multi-Year Packages</h3>
                {data.packages.map((pkg, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, width: '60px' }}>{pkg.years} Years:</span>
                        <input
                            type="number"
                            value={isNaN(pkg.amount) ? '' : pkg.amount}
                            onChange={e => updatePackage(idx, 'amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                            style={{ padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}
                        />
                    </div>
                ))}
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Terms & Conditions</h3>
                <textarea
                    value={data.terms.join('\n')}
                    onChange={e => updateField('terms', e.target.value.split('\n'))}
                    rows={8}
                    style={{ width: '100%', fontSize: 11, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                />
            </div>
        </div>
    );
};

export default AMCInvoiceModule;
