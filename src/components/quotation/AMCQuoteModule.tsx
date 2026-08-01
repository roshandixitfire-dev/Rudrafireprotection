'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { fetchNextQuotationNumber } from '@/utils/documentVersioning';
import { AMCQuotation, AMCItem, AMCPackage } from './types';
import AMCQuotePreview from './AMCQuotePreview';
import QuotationStickyHeader from './QuotationStickyHeader';
import './quotation.css';
import { ClientSearchInput } from './ClientSearchInput';
import { checkClientExists, addClientToCRM, createLeadFromQuotation } from '@/utils/crmHelper';

const supabase = createClient();

const DEFAULT_AMC_ITEMS: AMCItem[] = [
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


const AMCQuoteModule: React.FC<{ tabs?: React.ReactNode }> = ({ tabs }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [data, setData] = useState<AMCQuotation>({
        quoteNo: '', // Set on mount
        date: new Date().toISOString().split('T')[0],
        toTitle: 'The Hon Chairman/ Hon Secretary,',
        companyName: '', street: '', location: '', city: 'Mumbai', state: 'Maharashtra', pin: '',
        contactPerson: '', contactNumber: '',
        items: DEFAULT_AMC_ITEMS,
        packages: DEFAULT_AMC_PACKAGES,
        terms: DEFAULT_AMC_TERMS,
        totalAmount: 82500,
        includeSignature: true,
    });

    const [showPreview, setShowPreview] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [savedId, setSavedId] = useState<string | null>(null);

    const [clientExists, setClientExists] = useState(true);
    const [addToCRM, setAddToCRM] = useState(false);

    useEffect(() => {
        if (!data.companyName || data.companyName.trim().length < 2) {
            setClientExists(true);
            setAddToCRM(false);
            return;
        }
        const delayCheck = setTimeout(async () => {
            const exists = await checkClientExists(data.companyName);
            setClientExists(exists);
            if (exists) {
                setAddToCRM(false);
            }
        }, 500);
        return () => clearTimeout(delayCheck);
    }, [data.companyName]);

    const onClientSelect = (c: any) => {
        setData(prev => ({
            ...prev,
            companyName: c.name,
            street: c.address || '',
            location: c.area || '',
            city: c.district || '',
            state: c.state || 'Maharashtra',
            pin: c.pincode || '',
            contactPerson: c.contact_person || c.contact_name || '',
            contactNumber: c.phone || '',
        }));
    };

    useEffect(() => {
        if (id) {
            supabase
                .from('amc_quotations')
                .select('*')
                .eq('id', id)
                .single()
                .then(({ data: dbQuote, error }) => {
                    if (dbQuote) {
                        setData({
                            quoteNo: dbQuote.quotation_number,
                            date: dbQuote.quotation_date,
                            toTitle: dbQuote.to_title || 'The Hon Chairman/ Hon Secretary,',
                            companyName: dbQuote.company_name || '',
                            street: dbQuote.street || '',
                            location: dbQuote.location || '',
                            city: dbQuote.city || '',
                            state: dbQuote.state || 'Maharashtra',
                            pin: dbQuote.pin || '',
                            contactPerson: dbQuote.contact_person || '',
                            contactNumber: dbQuote.contact_number || '',
                            items: dbQuote.items || DEFAULT_AMC_ITEMS,
                            packages: dbQuote.packages || DEFAULT_AMC_PACKAGES,
                            terms: dbQuote.terms || DEFAULT_AMC_TERMS,
                            totalAmount: dbQuote.grand_total || 0,
                        });
                        setSavedId(dbQuote.id);
                    } else if (error) {
                        console.error('Error loading AMC quote:', error);
                    }
                });
            return;
        }

        if (!data.quoteNo) {
            fetchNextQuotationNumber('amc').then(no => setData(prev => ({ ...prev, quoteNo: no })));
        }
    }, [id]);

    const updateField = (field: keyof AMCQuotation, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateItem = (id: string, field: keyof AMCItem, value: any) => {
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

    const saveAMCQuotation = async () => {
        setSaveStatus('saving');
        try {
            if (addToCRM && !clientExists && data.companyName.trim()) {
                await addClientToCRM({
                    name: data.companyName,
                    address: data.street,
                    area: data.location,
                    district: data.city,
                    state: data.state,
                    pincode: data.pin,
                    contact_person: data.contactPerson,
                    phone: data.contactNumber,
                });
                setClientExists(true);
                setAddToCRM(false);
            }

            const payload: any = {
                quotation_number: data.quoteNo,
                quotation_date: data.date,
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
            let res, error;
            if (savedId) {
                const { data: updateData, error: updateError } = await supabase.from('amc_quotations')
                    .update(payload)
                    .eq('id', savedId)
                    .select('id')
                    .single();
                res = updateData;
                error = updateError;
            } else {
                const { data: insertData, error: insertError } = await supabase.from('amc_quotations')
                    .insert(payload)
                    .select('id')
                    .single();
                res = insertData;
                error = insertError;
            }

            if (error) {
                console.error('Supabase error:', error);
                throw new Error(error.message || JSON.stringify(error));
            }

            await createLeadFromQuotation({
                projectName: data.companyName,
                companyName: data.companyName,
                location: [data.street, data.location].filter(Boolean).join(', '),
                contactPerson: data.contactPerson,
                mobile: data.contactNumber,
                remarks: `Automatically created from AMC Quotation ${data.quoteNo}`,
            });

            if (res?.id) setSavedId(res.id);
            setSaveStatus('saved');
            router.refresh();
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err: any) {
            console.error('Error saving AMC quotation:', err);
            alert(`Error saving AMC quotation: ${err.message || 'Unknown error'}`);
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
                    <button onClick={() => {
                        const originalTitle = document.title;
                        const sanitizedName = data.companyName ? data.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'project';
                        const safeQuoteNo = data.quoteNo ? data.quoteNo.replace(/[^a-z0-9]/gi, '_') : 'quote';
                        document.title = `${safeQuoteNo}_${sanitizedName}`;
                        window.print();
                        setTimeout(() => { document.title = originalTitle; }, 1000);
                    }} style={{ padding: '6px 14px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>🖨 Print / PDF</button>
                    <span style={{ color: '#aaa', fontSize: 11, marginLeft: 'auto' }}>AMC Preview Mode</span>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '20px 0' }}>
                    <div style={{ width: 'fit-content', margin: '0 auto', padding: '0 20px' }}>
                        <AMCQuotePreview data={data} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quotation-container">
            <QuotationStickyHeader 
                actions={
                    <>
                        <button onClick={saveAMCQuotation} disabled={saveStatus === 'saving'} style={{ padding: '7px 16px', background: saveStatus === 'saved' ? '#16a34a' : saveStatus === 'error' ? '#dc2626' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Error – Retry' : '💾 Save'}
                        </button>
                        <button onClick={() => setShowPreview(true)} style={{ padding: '8px 18px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            Preview / Print →
                        </button>
                    </>
                }
            />

            {/* ── TOP CARD: Master Details ── */}
            <div className="quotation-card no-print">
                <div className="mb-3">
                    <label className="form-label mb-1 block">🔍 Search Client / Project (CRM)</label>
                    <ClientSearchInput
                        value={data.companyName}
                        onChange={v => updateField('companyName', v)}
                        onSelect={onClientSelect}
                    />
                    {!clientExists && data.companyName.trim().length >= 2 && (
                        <label style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer', userSelect: 'none', fontSize: 10, fontWeight: 'bold', color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: 4, border: '1px solid #fecaca' }}>
                            <input
                                type="checkbox"
                                checked={addToCRM}
                                onChange={e => setAddToCRM(e.target.checked)}
                                style={{ margin: 0, cursor: 'pointer', width: 'auto', height: 'auto' }}
                            />
                            ➕ Add to CRM?
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                    <div>
                        <label className="form-label text-[10px]">Quotation No.</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.quoteNo} onChange={e => updateField('quoteNo', e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Date</label>
                        <input type="date" className="form-input text-xs w-full py-1.5" value={data.date} onChange={e => updateField('date', e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Salutation / Title</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.toTitle} onChange={e => updateField('toTitle', e.target.value)} placeholder="e.g. The Hon Chairman" />
                    </div>

                    <div className="col-span-2">
                        <label className="form-label text-[10px]">Street / Address</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.street} onChange={e => updateField('street', e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Location / Area</label>
                        <input list="mumbai-locations" className="form-input text-xs w-full py-1.5" value={data.location} onChange={e => updateField('location', e.target.value)} placeholder="e.g. Borivali West" />
                        <datalist id="mumbai-locations">
                            <option value="Borivali East" />
                            <option value="Borivali West" />
                            <option value="Kandivali East" />
                            <option value="Kandivali West" />
                            <option value="Malad East" />
                            <option value="Malad West" />
                            <option value="Goregaon East" />
                            <option value="Goregaon West" />
                            <option value="Andheri East" />
                            <option value="Andheri West" />
                        </datalist>
                    </div>

                    <div>
                        <label className="form-label text-[10px]">City</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.city} onChange={e => updateField('city', e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">State</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.state} onChange={e => updateField('state', e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">PIN</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.pin} onChange={e => updateField('pin', e.target.value)} />
                    </div>

                    <div>
                        <label className="form-label text-[10px]">Contact Person</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.contactPerson} onChange={e => updateField('contactPerson', e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Contact Number</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.contactNumber} onChange={e => updateField('contactNumber', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="quotation-card no-print">
                <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Line Items</h3>
                <div className="overflow-x-auto w-full">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '5px', border: '1px solid #e2e8f0' }}>Sr</th>
                            <th style={{ padding: '5px', border: '1px solid #e2e8f0' }}>Description</th>
                            <th style={{ padding: '5px', border: '1px solid #e2e8f0' }}>Qty</th>
                            <th style={{ padding: '5px', border: '1px solid #e2e8f0' }}>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map(item => (
                            <tr key={item.id}>
                                <td style={{ border: '1px solid #e2e8f0', padding: '3px', textAlign: 'center' }}>{item.srNo}</td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '3px' }}>
                                    <input value={item.title} onChange={e => updateItem(item.id, 'title', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent' }} />
                                </td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '3px' }}>
                                    <input value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                </td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '3px' }}>
                                    <input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center' }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <label style={{ fontWeight: 700 }}>Total Amount: </label>
                    <input
                        type="number"
                        className="form-input text-xs"
                        value={isNaN(data.totalAmount) ? '' : data.totalAmount}
                        onChange={e => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setData(prev => {
                                const updatedPackages = prev.packages.map(pkg => {
                                    let discount = 0;
                                    if (pkg.years === 2) discount = 0.05;
                                    else if (pkg.years === 3) discount = 0.10;
                                    else if (pkg.years === 5) discount = 0.15;
                                    return {
                                        ...pkg,
                                        amount: Math.round(pkg.years * val * (1 - discount))
                                    };
                                });
                                return {
                                    ...prev,
                                    totalAmount: val,
                                    packages: updatedPackages
                                };
                            });
                        }}
                        style={{ padding: '4px', width: '100px' }}
                    />
                </div>
            </div>

            <div className="quotation-card no-print">
                <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Multi-Year Packages</h3>
                {data.packages.map((pkg, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, width: '60px' }}>{pkg.years} Years:</span>
                        <input
                            type="number"
                            className="form-input text-xs"
                            value={isNaN(pkg.amount) ? '' : pkg.amount}
                            onChange={e => updatePackage(idx, 'amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        />
                    </div>
                ))}
            </div>

            <div className="quotation-card no-print">
                <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Terms & Conditions</h3>
                <textarea
                    value={data.terms.join('\n')}
                    onChange={e => updateField('terms', e.target.value.split('\n'))}
                    rows={8}
                    className="form-input text-xs w-full py-2 mb-3"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" id="amcIncludeSignature" 
                        checked={data.includeSignature !== false} 
                        onChange={e => updateField('includeSignature', e.target.checked)} 
                        style={{ cursor: 'pointer', width: 14, height: 14 }}
                    />
                    <label htmlFor="amcIncludeSignature" style={{ fontSize: 11, fontWeight: 600, color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
                        Include Signature
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AMCQuoteModule;
