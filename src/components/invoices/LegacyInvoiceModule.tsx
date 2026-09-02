'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useFormDraft } from '@/hooks/useFormDraft';
import DraftNoticeBanner from '@/components/common/DraftNoticeBanner';

const supabase = createClient();


// ─── Invoice Type ────────────────────────────────────────────────────────────────
export type InvoiceType = 'performa' | 'tax';

// ─── Catalog of common items ────────────────────────────────────────────────────
const CATALOG_ITEMS = [
    { title: 'ABC TYPE Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of ABC & Co2 type stored pressure extinguishers.', unit: 'Nos', rate: 570 },
    { title: 'Co2 TYPE Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of Co2 type stored pressure extinguishers.', unit: 'Nos', rate: 750 },
    { title: 'DCP TYPE Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of DCP type stored pressure extinguishers.', unit: 'Nos', rate: 480 },
    { title: 'Water Type Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of Water type stored pressure extinguishers.', unit: 'Nos', rate: 420 },
    { title: 'Foam Type Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of Foam type stored pressure extinguishers.', unit: 'Nos', rate: 550 },
    { title: 'Fire Hose Reel Installation', description: 'Supply and installation of fire hose reel with fittings, tested and commissioned.', unit: 'Nos', rate: 4500 },
    { title: 'Fire Hydrant Point', description: 'Supply and installation of fire hydrant point with ISI mark valve and accessories.', unit: 'Nos', rate: 8500 },
    { title: 'Sprinkler Head Supply & Installation', description: 'Supply and installation of sprinkler heads as per NBC norms.', unit: 'Nos', rate: 750 },
    { title: 'Fire Alarm Panel (Conventional)', description: 'Supply and installation of conventional fire alarm control panel.', unit: 'Nos', rate: 18000 },
    { title: 'Smoke Detector', description: 'Supply and installation of photoelectric type smoke detector.', unit: 'Nos', rate: 1200 },
    { title: 'Heat Detector', description: 'Supply and installation of rate-of-rise heat detector.', unit: 'Nos', rate: 950 },
    { title: 'Manual Call Point', description: 'Supply and installation of manual call point with glass element.', unit: 'Nos', rate: 650 },
    { title: 'Fire Bell/Hooter', description: 'Supply and installation of fire bell/hooter.', unit: 'Nos', rate: 850 },
    { title: 'Jockey Pump', description: 'Supply and installation of jockey pump with panel.', unit: 'Set', rate: 65000 },
    { title: 'Main Fire Pump', description: 'Supply and installation of main fire pump (electric) with panel.', unit: 'Set', rate: 185000 },
    { title: 'Diesel Fire Pump', description: 'Supply and installation of diesel engine driven fire pump.', unit: 'Set', rate: 285000 },
    { title: 'Fire Safety Inspection', description: 'Comprehensive fire safety inspection and compliance audit as per NBC and local fire norms.', unit: 'Visit', rate: 2500 },
    { title: 'Transportation', description: 'Transportation and logistics charges for equipment/materials.', unit: 'Job', rate: 1000 },
    { title: 'AMC - Extinguisher (Annual)', description: 'Annual maintenance contract for fire extinguishers including quarterly visits.', unit: 'Nos', rate: 300 },
    { title: 'Labour Charges', description: 'Labour charges for on-site work as agreed.', unit: 'Job', rate: 0 },
    { title: 'ABC TYPE Extinguisher 4kg', description: 'Supply, Installation, Testing and commissioning of ABC type 4kg fire extinguisher.', unit: 'Nos', rate: 1750 },
    { title: 'Co2 TYPE Extinguisher 4.5kg', description: 'Supply, Installation, Testing and commissioning of Co2 type 4.5kg fire extinguisher.', unit: 'Nos', rate: 4250 },
    { title: 'ABC TYPE Extinguisher Refilling 4Kg', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of ABC type 4kg fire extinguisher.', unit: 'Nos', rate: 450 },
    { title: 'PUBLIC ADDRESSABLE FIRE ALARM PANEL', description: 'Providing, fixing & commissioning of microprocessor-based, Public addressable fire alarm control panel with battery backup.', unit: 'Nos', rate: 57839 },
    { title: 'MANUAL CALLPOINT & HOOTER', description: 'Providing, fixing & commissioning of manual call point and electronic hooter.', unit: 'Nos', rate: 3090 },
    { title: 'SMOKE DETECTORS', description: 'Installation, testing, and commissioning of smoke detectors.', unit: 'Nos', rate: 2322 },
    { title: 'ISI Fire Hydrant Valve Replacement', description: 'Supply, Installation, Testing, Commissioning Of ISI Make Fire Hydrant Valve.', unit: 'Nos', rate: 4750 },
    { title: 'Single ISI Hosebox Installation', description: 'Supply, Installation, Testing & Commissioning of single ISI Hosebox.', unit: 'Nos', rate: 2150 },
    { title: 'Supply, Installation, Testing & Commissioning of Canvas Hosepipe', description: 'Canvas hose pipe installation.', unit: 'Nos', rate: 3895 },
    { title: 'Fire Fighting System Control Panel Repair', description: 'Servicing and replacement of parts in control panel.', unit: 'Nos', rate: 18500 },
    { title: 'Main Submersible Fire Fighting Pump Service', description: 'Servicing of main fire pump.', unit: 'Nos', rate: 19850 },
    { title: 'Jockey Submersible Fire Fighting Pump Service', description: 'Servicing of jockey fire pump.', unit: 'Nos', rate: 13300 },
];

// ─── T&C Presets ────────────────────────────────────────────────────────────────
const TC_PRESETS = [
    {
        label: 'Repair & Replacement',
        items: [
            'All repair and replacement work has been carried out as per site inspection and client approval; any additional work, if required, will be charged separately.',
            'Materials replaced are new and standard quality unless otherwise specified; warranty, if any, is limited to the manufacturer\'s terms.',
            'The system has been tested at site after completion of work; final performance may depend on existing infrastructure and site conditions.',
            'Payment to be made within the agreed credit period from the invoice date; delayed payments may attract applicable charges.',
            'This invoice is valid only for the work mentioned above; no liability is accepted for pre-existing faults or future damage beyond the scope of work.',
        ],
    },
    {
        label: 'Extinguisher Service',
        items: [
            'Service warranty is valid for 12 months, provided the security seal is unbroken.',
            'We are not liable for malfunctions caused by tampering, misuse, or lack of proper storage by the client.',
            'Parts replaced due to wear/tear are billed extra.',
            'Payment is due upon receipt unless otherwise agreed.',
        ],
    },
    {
        label: 'AMC Contract',
        items: [
            'AMC covers routine inspection and maintenance only.',
            'Spares/repairs beyond scope are chargeable extra.',
            'AMC excludes major repairs or system modifications.',
            'Services as per agreed schedule.',
        ],
    },
    {
        label: 'Custom',
        items: ['Payment: Due immediately upon receipt of invoice.', 'Taxes as shown are applicable.'],
    },
];

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface InvoiceItem {
    id: string;
    srNo: string;
    title: string;
    description: string;
    qty: string;
    unit: string;
    rate: number;
    taxPct: number;
    amount: number;
}

export interface LegacyInvoice {
    invoiceType: InvoiceType;
    invoiceNo: string;
    date: string;
    toTitle: string;
    companyName: string;
    street: string;
    location: string;
    city: string;
    state: string;
    pin: string;
    items: InvoiceItem[];
    termsItems: string[];
    sgstPct: number;
    cgstPct: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n: number): string => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const calcAmount = (qty: string, rate: number): number => {
    const q = parseFloat(qty) || 0;
    return q * rate;
};
const getINVFYLabel = (): string => {
    const d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    const fyStart = month >= 3 ? year : year - 1;
    const fyEnd = String(fyStart + 1).slice(2);
    return `${String(fyStart).slice(2)}-${fyEnd}`;
};
const genInvoiceNo = (type: InvoiceType): string => {
    const fyLabel = getINVFYLabel();
    const prefix = type === 'performa' ? 'PI' : 'TI';
    const key = `rudra-inv-${prefix}-seq-${fyLabel}`;
    const last = typeof window !== 'undefined' ? parseInt(localStorage.getItem(key) || '0') : 0;
    const next = last + 1;
    if (typeof window !== 'undefined') localStorage.setItem(key, String(next));
    return `RFP/${prefix}/${fyLabel}/${String(next).padStart(5, '0')}`;
};
const todayISO = (): string => new Date().toISOString().split('T')[0];

const makeDefaultItem = (overrides: Partial<InvoiceItem> = {}): InvoiceItem => ({
    id: Date.now().toString() + Math.random(), srNo: '', title: '', description: '',
    qty: '1', unit: 'Nos', rate: 0, taxPct: 18, amount: 0, ...overrides,
});

const getInvoiceLabel = (type: InvoiceType): string =>
    type === 'performa' ? 'PERFORMA INVOICE' : 'TAX INVOICE';

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════
const LegacyInvoicePreview: React.FC<{ data: LegacyInvoice }> = ({ data }) => {
    const baseAmount = data.items.reduce((s, it) => s + it.amount, 0);
    const sgstAmt = baseAmount * data.sgstPct / 100;
    const cgstAmt = baseAmount * data.cgstPct / 100;
    const grandTotal = baseAmount + sgstAmt + cgstAmt;

    const displayDate = data.date ? new Date(data.date).toLocaleDateString('en-IN') : '';

    const td: React.CSSProperties = {
        border: '1px solid #000', padding: '4px 6px',
        fontSize: 10.5, fontFamily: 'Arial, sans-serif', verticalAlign: 'top',
    };

    return (
        <div id="legacy-invoice-print-page" style={{
            width: '210mm', minHeight: '297mm', background: '#fff',
            fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
            margin: '0 auto', position: 'relative'
        }}>
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 0 !important; }
                    html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #fff !important; }
                    body * { visibility: hidden; }
                    #legacy-invoice-print-page, #legacy-invoice-print-page * { visibility: visible; }
                    #legacy-invoice-print-page {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 210mm !important; min-height: 297mm !important;
                        margin: 0 !important; padding: 0 !important; border: none !important;
                        box-shadow: none !important; background: #fff !important;
                    }
                    table { border-collapse: collapse; width: 100%; border: none !important; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    .footer-spacer { height: 16mm; }
                    .visual-footer {
                        position: fixed !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        background: #fff !important;
                        z-index: 100;
                    }
                    tr { page-break-inside: avoid; }
                    .no-break { break-inside: avoid; }
                    
                    /* Watermark */
                    .watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.05;
                        z-index: 0;
                        width: 80%;
                        pointer-events: none;
                        display: block !important;
                    }
                }
                @media screen {
                    #legacy-invoice-print-page { 
                        box-shadow: 0 0 10px rgba(0,0,0,0.15); 
                        position: relative;
                    }
                    /* Page Break Indicators */
                    .page-break-line {
                        position: absolute;
                        left: 0;
                        right: 0;
                        border-top: 1px dashed #ff0000;
                        z-index: 10;
                        pointer-events: none;
                    }
                    .page-break-label {
                        position: absolute;
                        right: -60px;
                        color: #ff0000;
                        font-size: 10px;
                        font-weight: bold;
                    }
                    .watermark { display: none; }
                }
            `}</style>

            {/* Watermark for Print */}
            <div className="watermark">
                <img src="/logo.png" alt="" style={{ width: '100%', height: 'auto' }} />
            </div>

            {/* Screen Page Break Indicators */}
            <div className="no-print" style={{ pointerEvents: 'none' }}>
                {[1, 2, 3, 4].map(p => (
                    <div key={p} className="page-break-line" style={{ top: `${p * 297}mm` }}>
                        <span className="page-break-label">PAGE {p} BREAK</span>
                    </div>
                ))}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                <thead>
                    <tr>
                        <td style={{ border: 'none', padding: 0 }}>
                            {/* ─── HEADER (Repeats on every page) ─── */}
                            <div style={{ position: 'relative', width: '100%', height: '150px', marginBottom: '0px' }}>
                                {/* Pink Background with Zigzag Slant */}
                                <div style={{
                                    position: 'absolute', left: 0, right: 0, width: '100%', height: '140px',
                                    background: '#FFF1F1',
                                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 45% 80%, 35% 100%, 0% 100%)',
                                    zIndex: 0
                                }} />

                                {/* Logo and Content Area */}
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 10mm 0 10mm', height: '100%' }}>
                                    <div style={{ textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '140px' }}>
                                        <img src="/logo.png" alt="Logo" style={{ height: '140px', width: 'auto', display: 'block' }} />
                                        <div style={{
                                            position: 'absolute', bottom: '5px', left: '0', color: '#E3242B',
                                            fontSize: '11px', fontWeight: '700', fontStyle: 'italic', whiteSpace: 'nowrap'
                                        }}>
                                            Fire Prevention Is Better Than Fire Fighting.
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', height: '140px', justifyContent: 'space-between' }}>
                                        <div style={{ marginTop: '15px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '0.5px' }}>RUDRA FIRE PROTECTION</div>
                                            <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>GSTIN : 27CECPD2175P1Z9</div>
                                            <div style={{ fontSize: '10px', color: '#444' }}>info@rudrafireprotection.com</div>
                                        </div>
                                        <div style={{ color: '#E3242B', fontSize: data.invoiceType === 'performa' ? '16px' : '22px', fontWeight: '700', fontFamily: 'Arial, sans-serif', marginRight: '-5mm', marginBottom: '-5px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            {getInvoiceLabel(data.invoiceType)} {data.invoiceNo}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td style={{ border: 'none', padding: '0 7mm 0mm 7mm' }}>
                            <div style={{ marginTop: 15 }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div style={{ fontSize: '11px', color: '#333', textAlign: 'right', minWidth: 110 }}>Date : <strong>{displayDate}</strong></div>
                                </div>

                                <div style={{ fontSize: 9.5, lineHeight: 1.75, marginBottom: 8 }}>
                                    <div><strong>To,</strong></div>
                                    <div>{data.toTitle || 'The Hon Chairman/ Hon Secretary,'}</div>
                                    {data.companyName && <div style={{ fontWeight: 700 }}>{data.companyName}</div>}
                                    {data.street && <div>{data.street},</div>}
                                    {data.location && <div>{data.location},</div>}
                                    {(data.city || data.state || data.pin) && <div>{[data.city, data.state, data.pin].filter(Boolean).join(' - ')}</div>}
                                    <div><strong>Dear Sir,</strong></div>
                                </div>

                                <div style={{ textAlign: 'center', fontSize: 9.5, fontStyle: 'italic', marginBottom: 10, color: '#444' }}>
                                    {data.invoiceType === 'performa'
                                        ? 'Please find below our proforma invoice for your reference and approval.'
                                        : 'Please find below our tax invoice for the services/goods rendered.'}
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 0 }}>
                                    <thead>
                                        <tr style={{ background: '#e8e8e8' }}>
                                            <th style={{ ...td, width: 28, textAlign: 'center', fontWeight: 700 }}>Sr.<br />No.</th>
                                            <th style={{ ...td, textAlign: 'center', fontWeight: 700 }}>Item Description</th>
                                            <th style={{ ...td, width: 30, textAlign: 'center', fontWeight: 700 }}>Qty</th>
                                            <th style={{ ...td, width: 32, textAlign: 'center', fontWeight: 700 }}>Unit</th>
                                            <th style={{ ...td, width: 48, textAlign: 'center', fontWeight: 700 }}>Rate</th>
                                            <th style={{ ...td, width: 32, textAlign: 'center', fontWeight: 700 }}>Tax%</th>
                                            <th style={{ ...td, width: 64, textAlign: 'right', fontWeight: 700 }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                                                <td style={td}>
                                                    <div style={{ fontWeight: 700, marginBottom: item.description ? 2 : 0 }}>{item.title}</div>
                                                    {item.description && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: '#444' }}>{item.description}</div>}
                                                </td>
                                                <td style={{ ...td, textAlign: 'center' }}>{item.qty}</td>
                                                <td style={{ ...td, textAlign: 'center' }}>{item.unit}</td>
                                                <td style={{ ...td, textAlign: 'right' }}>{item.rate.toLocaleString('en-IN')}</td>
                                                <td style={{ ...td, textAlign: 'center' }}>{item.taxPct > 0 ? `${item.taxPct}%` : '-'}</td>
                                                <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(item.amount)}</td>
                                            </tr>
                                        ))}
                                        <tr><td style={{ ...td, height: 18 }} colSpan={7}></td></tr>
                                        <tr>
                                            <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontWeight: 700, fontSize: 9 }} colSpan={6}>Gross Total :</td>
                                            <td style={{ ...td, textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{fmt(baseAmount)}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontSize: 9 }} colSpan={6}>Output SGST @{data.sgstPct}% :</td>
                                            <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>{sgstAmt > 0 ? fmt(sgstAmt) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontSize: 9 }} colSpan={6}>Output CGST @{data.cgstPct}% :</td>
                                            <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>{cgstAmt > 0 ? fmt(cgstAmt) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontWeight: 800, fontSize: 9, background: '#eee' }} colSpan={6}>Grand Total :</td>
                                            <td style={{ ...td, textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', background: '#eee' }}>{fmt(grandTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', border: '1px solid #000', borderTop: 'none' }}>
                                    <div style={{ flex: 1, padding: '8px', borderRight: '1px solid #000' }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Terms &amp; Conditions :-</div>
                                        <ol style={{ margin: 0, paddingLeft: 14, fontSize: 10.5, color: '#333' }}>
                                            {data.termsItems.map((t, i) => (
                                                <li key={i} style={{ marginBottom: 2 }}>{t}</li>
                                            ))}
                                        </ol>
                                    </div>
                                    <div style={{ width: '40%', padding: '8px' }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>BANK DETAILS</div>
                                        <div style={{ fontSize: 10.5, lineHeight: 1.6 }}>
                                            <div style={{ fontWeight: 700 }}>Rudra Fire Protection</div>
                                            <div>Bank: State Bank Of India</div>
                                            <div>Account Number : 40698757999</div>
                                            <div>IFSC Code : SBIN0016719</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ border: '1px solid #000', borderTop: 'none', padding: '10px 15px', height: '110px', position: 'relative' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 50 }}>For, Rudra Fire Protection</div>
                                    <div style={{ position: 'absolute', bottom: '25px', left: '25px', height: '38px', pointerEvents: 'none' }}>
                                        <img src="/signature.png" alt="Signature" style={{ height: '100%', width: 'auto', mixBlendMode: 'multiply' }} />
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 800 }}>Authorised Signatory</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>

                <tfoot>
                    <tr>
                        <td style={{ border: 'none', padding: 0 }}>
                            <div className="footer-spacer" />
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* ─── VISUAL FOOTER (Fixed at absolute bottom of every page) ─── */}
            <div className="visual-footer" style={{ padding: '10px 10mm 15px 10mm', borderTop: '1px solid #999' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '10px', color: '#374151' }}>
                    <div>17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104 ☎ 7777088817</div>
                    <div style={{ color: '#6b7280' }}>Page 1 / 1</div>
                </div>
                <div style={{ fontSize: '10px', color: '#374151', marginTop: '3px' }}>www.rudrafireprotection.com</div>
            </div>
        </div>
    );
};

// ─── ITEM SEARCH DROPDOWN ──────────────────────────────────────────────────────
const ItemSearchInput: React.FC<{
    value: string;
    catalog: typeof CATALOG_ITEMS;
    onChange: (val: string) => void;
    onSelect: (item: typeof CATALOG_ITEMS[0]) => void;
    onAdd: (title: string) => void;
}> = ({ value, catalog, onChange, onSelect, onAdd }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const safeValue = value || '';
    const results = safeValue.length >= 2
        ? catalog.filter(c => c.title.toLowerCase().includes(safeValue.toLowerCase())).slice(0, 6)
        : [];

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const inputS: React.CSSProperties = { border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: '100%', boxSizing: 'border-box' };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <input value={safeValue} onChange={e => { onChange(e.target.value); setOpen(true); }}
                placeholder="Type title..." style={inputS} autoComplete="off" />
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
                    border: '1px solid #ccc', borderRadius: 4, zIndex: 999, maxHeight: 180, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                }}>
                    {results.map((c, i) => (
                        <div key={i} onClick={() => { onSelect(c); setOpen(false); }}
                            style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 11, borderBottom: '1px solid #f0f0f0' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                            <div style={{ fontWeight: 700 }}>{c.title}</div>
                            <div style={{ fontSize: 9, color: '#888' }}>₹{c.rate} / {c.unit}</div>
                        </div>
                    ))}
                    {value.length >= 3 && !catalog.find(c => c.title.toLowerCase() === value.toLowerCase()) && (
                        <div onClick={() => { onAdd(value); setOpen(false); }}
                            style={{ padding: '8px 10px', cursor: 'pointer', fontSize: 11, color: '#1a73e8', fontWeight: 700, background: '#f8f9ff' }}>
                            + Add "{value}" to catalog
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── CLIENT SEARCH DROPDOWN ─────────────────────────────────────────────────────
interface ClientRec { id: number; name: string; address?: string; area?: string; district?: string; state?: string; pincode?: string; }

const ClientSearchInput: React.FC<{
    value: string;
    onChange: (name: string) => void;
    onSelect: (c: ClientRec) => void;
}> = ({ value, onChange, onSelect }) => {
    const [results, setResults] = useState<ClientRec[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.length < 2) { setResults([]); setOpen(false); return; }
        const t = setTimeout(async () => {
            const { data } = await supabase
                .from('clients')
                .select('id, name, address, area, district, state, pincode')
                .ilike('name', `%${value}%`)
                .limit(8);
            setResults(data || []);
            setOpen(true);
        }, 200);
        return () => clearTimeout(t);
    }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const inputS: React.CSSProperties = { border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: '100%', boxSizing: 'border-box' };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }}
                placeholder="Type to search clients..." style={inputS} autoComplete="off" />
            {open && results.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
                    border: '1px solid #ccc', borderRadius: 4, zIndex: 999, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                }}>
                    {results.map(c => (
                        <div key={c.id} onClick={() => { onSelect(c); setOpen(false); }}
                            style={{ padding: '7px 10px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid #f0f0f0' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                            <div style={{ fontWeight: 700 }}>{c.name}</div>
                            {(c.area || c.district) && <div style={{ fontSize: 10, color: '#888' }}>{[c.area, c.district, c.state].filter(Boolean).join(', ')}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EDITOR MODULE
// ═══════════════════════════════════════════════════════════════════════════════
const INV_DRAFT_KEY = 'rudra-legacy-invoice-draft';
const inputS: React.CSSProperties = { border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: '100%', boxSizing: 'border-box' };

const LegacyInvoiceModule: React.FC<{ tabs?: React.ReactNode }> = ({ tabs }) => {
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('tax');
    // SSR-safe default — no localStorage in initializer (avoids hydration mismatch)
    const [data, setData] = useState<LegacyInvoice>({
        invoiceType: 'tax',
        invoiceNo: '',
        date: '',
        toTitle: 'The Hon Chairman/ Hon Secretary,',
        companyName: '', street: '', location: '', city: '', state: 'Maharashtra', pin: '',
        items: [
            makeDefaultItem({ id: '1a', srNo: '1', title: 'ABC TYPE Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of ABC & Co2 type stored pressure extinguishers.', qty: '09', rate: 570, taxPct: 18, amount: calcAmount('09', 570) }),
            makeDefaultItem({ id: '2', srNo: '2', title: 'Transportation', description: '', qty: '1', unit: 'Job', rate: 1000, taxPct: 0, amount: 1000 }),
        ],
        termsItems: TC_PRESETS[0].items,
        sgstPct: 9,
        cgstPct: 9,
    });

    const [catalog, setCatalog] = useState(CATALOG_ITEMS);
    const [isCatalogLoaded, setIsCatalogLoaded] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showCatalog, setShowCatalog] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', description: '', unit: 'Nos', rate: '' });
    const [tcPresetIdx, setTcPresetIdx] = useState(0);
    const [customTcText, setCustomTcText] = useState(TC_PRESETS[3].items.join('\n'));
    const [draftSaved, setDraftSaved] = useState(false);
    const [dbStatus, setDbStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [savedId, setSavedId] = useState<string | null>(null);

    const {
        hasDraft,
        draftTime,
        lastSavedNotice,
        saveDraft,
        clearDraft,
        restoreDraft,
        discardDraft
    } = useFormDraft<{ data: LegacyInvoice; savedId: string | null }>({
        storageKey: INV_DRAFT_KEY,
        isEditingExisting: false,
        onRestore: (draftObj) => {
            if (draftObj?.data) {
                setData(draftObj.data);
                setInvoiceType(draftObj.data.invoiceType || 'tax');
                if (draftObj.savedId) setSavedId(draftObj.savedId);
            }
        }
    });

    // Single mount effect: fetch new sequence number
    useEffect(() => {
        const today = todayISO();
        const type: InvoiceType = 'tax';
        const fyLabel = getINVFYLabel();
        const prefix = 'TI';
        const key = `inv-${prefix}-${fyLabel}`;
        supabase.rpc('next_doc_sequence', { p_key: key }).then(({ data: seq, error }) => {
            const no = (!error && seq)
                ? `RFP/${prefix}/${fyLabel}/${String(seq).padStart(5, '0')}`
                : genInvoiceNo(type);
            setData(prev => ({ ...prev, date: today, invoiceNo: no }));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load custom catalog from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('rudra-legacy-catalog');
            if (saved) {
                const parsed = JSON.parse(saved);
                const merged = [...parsed];
                CATALOG_ITEMS.forEach(defaultItem => {
                    if (!merged.some(item => item.title.toLowerCase() === defaultItem.title.toLowerCase())) {
                        merged.push(defaultItem);
                    }
                });
                setCatalog(merged);
            }
        } catch { }
        setIsCatalogLoaded(true);
    }, []);

    // Save catalog to localStorage when it changes
    useEffect(() => {
        if (!isCatalogLoaded) return;
        try {
            localStorage.setItem('rudra-legacy-catalog', JSON.stringify(catalog));
        } catch { }
    }, [catalog, isCatalogLoaded]);

    // Auto-save draft to localStorage via useFormDraft
    useEffect(() => {
        if (data.companyName || data.street || (data.items && data.items.length > 0)) {
            const t = setTimeout(() => {
                saveDraft({ data, savedId });
            }, 800);
            return () => clearTimeout(t);
        }
    }, [data, savedId, saveDraft]);

    // Sync invoiceType is now handled inside the mount useEffect above

    // When invoice type changes, regenerate invoice number from DB
    const handleTypeChange = (newType: InvoiceType) => {
        setInvoiceType(newType);
        const fyLabel = getINVFYLabel();
        const prefix = newType === 'performa' ? 'PI' : 'TI';
        const key = `inv-${prefix}-${fyLabel}`;
        supabase.rpc('next_doc_sequence', { p_key: key }).then(({ data: seq, error }) => {
            const no = (!error && seq)
                ? `RFP/${prefix}/${fyLabel}/${String(seq).padStart(5, '0')}`
                : genInvoiceNo(newType);
            setData(prev => ({ ...prev, invoiceType: newType, invoiceNo: no }));
        });
    };

    // Save to Supabase DB
    const saveToDb = async () => {
        if (!data.companyName.trim()) {
            alert('Please enter a Company Name before saving.');
            return;
        }

        setDbStatus('saving');
        const baseAmt = data.items.reduce((s, it) => s + it.amount, 0);
        const sgstAmt = baseAmt * data.sgstPct / 100;
        const cgstAmt = baseAmt * data.cgstPct / 100;
        const docPayload = {
            invoice_no: data.invoiceNo,
            invoice_type: data.invoiceType,
            invoice_date: data.date,
            to_title: data.toTitle,
            company_name: data.companyName,
            street: data.street,
            location: data.location,
            city: data.city,
            state: data.state,
            pin: data.pin,
            subtotal: baseAmt,
            sgst_pct: data.sgstPct,
            cgst_pct: data.cgstPct,
            sgst_amount: sgstAmt,
            cgst_amount: cgstAmt,
            grand_total: baseAmt + sgstAmt + cgstAmt,
            status: 'Sent',
            raw_json: data as unknown as Record<string, unknown>,
        };
        let res, error;
        if (savedId) {
            const updateRes = await supabase.from('legacy_invoices').update(docPayload).eq('id', savedId).select('id').single();
            res = updateRes.data;
            error = updateRes.error;
        } else {
            const insertRes = await supabase.from('legacy_invoices').insert(docPayload).select('id').single();
            res = insertRes.data;
            error = insertRes.error;

            // Self-healing: if insert fails because of duplicate key, find the existing ID and update it instead
            if (error && error.code === '23505') {
                const { data: existing } = await supabase
                    .from('legacy_invoices')
                    .select('id')
                    .eq('invoice_no', docPayload.invoice_no)
                    .single();
                if (existing?.id) {
                    const retryRes = await supabase
                        .from('legacy_invoices')
                        .update(docPayload)
                        .eq('id', existing.id)
                        .select('id')
                        .single();
                    res = retryRes.data;
                    error = retryRes.error;
                }
            }
        }

        if (error) {
            console.error('Invoice save error:', JSON.stringify({ code: error.code, message: error.message, details: error.details, hint: error.hint }));

            if (error.code === '23505') {
                alert(`The invoice number "${data.invoiceNo}" already exists. Please change the invoice number to save as a new invoice.`);
            }

            setDbStatus('error');
            setTimeout(() => setDbStatus('idle'), 3000);
        } else {
            if (res?.id) setSavedId(res.id);
            setDbStatus('saved');
            clearDraft();
            setTimeout(() => setDbStatus('idle'), 2500);
        }
    };

    const recalc = (items: InvoiceItem[]) =>
        items.map(it => ({ ...it, amount: calcAmount(it.qty, it.rate) }));

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setData(prev => {
            const items = prev.items.map(it => it.id === id ? { ...it, [field]: value } : it);
            return { ...prev, items: recalc(items) };
        });
    };

    const addFromCatalog = (cat: typeof CATALOG_ITEMS[0]) => {
        setData(prev => {
            const newItem = makeDefaultItem({ title: cat.title, description: cat.description, unit: cat.unit, rate: cat.rate, taxPct: 18, amount: calcAmount('1', cat.rate) });
            return { ...prev, items: [...prev.items, newItem] };
        });
    };

    const handleSaveCatalog = (shouldClose: boolean) => {
        if (!newItem.title.trim()) return;
        const rateVal = parseFloat(newItem.rate) || 0;
        const newCat = {
            title: newItem.title.trim(),
            description: newItem.description.trim(),
            unit: newItem.unit,
            rate: rateVal
        };
        setCatalog(prev => [newCat, ...prev]);
        setNewItem({ title: '', description: '', unit: 'Nos', rate: '' });
        if (shouldClose) {
            setShowAddForm(false);
        }
    };

    const addToCatalog = (title: string, id: string) => {
        const item = data.items.find(it => it.id === id);
        if (!item) return;
        if (!window.confirm(`Save "${item.title}" to your catalog for this session?\n\nRate: \u20b9${item.rate} | Unit: ${item.unit}`)) return;
        const newCat = { title: item.title, description: item.description, unit: item.unit, rate: item.rate };
        setCatalog(prev => [...prev, newCat]);
    };

    const resetForm = () => {
        setSavedId(null);
        clearDraft();
        const type: InvoiceType = 'tax';
        setInvoiceType(type);
        setData({
            invoiceType: type,
            invoiceNo: genInvoiceNo(type),
            date: todayISO(),
            toTitle: 'The Hon Chairman/ Hon Secretary,',
            companyName: '', street: '', location: '', city: '', state: 'Maharashtra', pin: '',
            items: [makeDefaultItem()],
            termsItems: TC_PRESETS[0].items,
            sgstPct: 9, cgstPct: 9,
        });

        // Fetch fresh sequence
        const fyLabel = getINVFYLabel();
        const prefix = 'TI';
        const key = `inv-${prefix}-${fyLabel}`;
        supabase.rpc('next_doc_sequence', { p_key: key }).then(({ data: seq, error }) => {
            if (!error && seq) {
                const no = `RFP/${prefix}/${fyLabel}/${String(seq).padStart(5, '0')}`;
                setData(prev => ({ ...prev, invoiceNo: no }));
            }
        });
    };

    const addEmptyRow = () => setData(prev => ({ ...prev, items: [...prev.items, makeDefaultItem()] }));
    const removeItem = (id: string) => setData(prev => ({ ...prev, items: prev.items.filter(it => it.id !== id) }));

    const applyTcPreset = (idx: number) => {
        setTcPresetIdx(idx);
        if (idx === 3) setData(prev => ({ ...prev, termsItems: customTcText.split('\n').filter(Boolean) }));
        else setData(prev => ({ ...prev, termsItems: TC_PRESETS[idx].items }));
    };

    const onClientSelect = (c: ClientRec) => {
        setData(prev => ({
            ...prev,
            companyName: c.name,
            street: c.address || '',
            location: c.area || '',
            city: c.district || '',
            state: c.state || 'Maharashtra',
            pin: c.pincode || '',
        }));
    };

    const filteredCatalog = catalog.filter(c =>
        c.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(catalogSearch.toLowerCase())
    );

    const baseAmount = data.items.reduce((s, it) => s + it.amount, 0);
    const sgstAmt = baseAmount * data.sgstPct / 100;
    const cgstAmt = baseAmount * data.cgstPct / 100;
    const grandTotal = baseAmount + sgstAmt + cgstAmt;

    const inputS: React.CSSProperties = { border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: '100%', boxSizing: 'border-box' };
    const labelS: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 2 };
    const field = (label: string, value: string, onChange: (v: string) => void, type = 'text') => (
        <div style={{ marginBottom: 8 }}>
            <div style={labelS}>{label}</div>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputS} />
        </div>
    );

    if (showPreview) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#444' }}>
                {/* Print action bar */}
                <div className="no-print" style={{
                    display: 'flex', gap: 10, padding: '8px 16px', background: '#1a1a1a',
                    borderBottom: '1px solid #333', alignItems: 'center', flexShrink: 0
                }}>
                    <button onClick={() => setShowPreview(false)} style={{ padding: '6px 14px', background: '#555', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>← Edit</button>
                    <button onClick={saveToDb} disabled={dbStatus === 'saving'} style={{ padding: '6px 14px', background: dbStatus === 'saved' ? '#16a34a' : dbStatus === 'error' ? '#dc2626' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                        {dbStatus === 'saving' ? '⏳ Saving...' : dbStatus === 'saved' ? '✓ Saved!' : dbStatus === 'error' ? '✗ Error' : '💾 Save'}
                    </button>
                    <button onClick={() => window.print()} style={{ padding: '6px 14px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>🖨 Print / PDF</button>
                    <span style={{ color: '#aaa', fontSize: 11, marginLeft: 'auto' }}>A4 Preview Mode — {getInvoiceLabel(data.invoiceType)}</span>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '20px 0' }}>
                    <div style={{ width: 'fit-content', margin: '0 auto', padding: '0 20px' }}>
                        <LegacyInvoicePreview data={data} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '12px 12px', fontFamily: 'Arial, sans-serif' }}>
            <DraftNoticeBanner
                hasDraft={hasDraft}
                draftTime={draftTime}
                lastSavedNotice={lastSavedNotice}
                onRestore={restoreDraft}
                onDiscard={discardDraft}
            />
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {tabs ? tabs : null}
                    {draftSaved && <span style={{ fontSize: 10, color: '#22c55e', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '2px 7px' }}>✓ Draft saved</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={resetForm} style={{ padding: '7px 14px', background: '#fff', color: '#888', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🆕 New Invoice</button>
                    <button onClick={saveToDb} disabled={dbStatus === 'saving'} style={{ padding: '7px 16px', background: dbStatus === 'saved' ? '#16a34a' : dbStatus === 'error' ? '#dc2626' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        {dbStatus === 'saving' ? '⏳ Saving...' : dbStatus === 'saved' ? '✓ Saved!' : dbStatus === 'error' ? '✗ Error – Retry' : '💾 Save'}
                    </button>
                    <button onClick={() => setShowPreview(true)} style={{ padding: '8px 18px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Preview / Print →</button>
                </div>
            </div>

            {/* ── Invoice Type Toggle ── */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#333' }}>🗂 Invoice Type</div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {([
                        { value: 'performa', label: '📄 Performa Invoice' },
                        { value: 'tax', label: '🧾 Tax Invoice' },
                    ] as { value: InvoiceType; label: string }[]).map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleTypeChange(opt.value)}
                            style={{
                                padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                background: invoiceType === opt.value ? '#E3242B' : '#eee',
                                color: invoiceType === opt.value ? '#fff' : '#333',
                                border: `2px solid ${invoiceType === opt.value ? '#E3242B' : '#ddd'}`,
                                transition: 'all 0.15s',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
                    {invoiceType === 'performa'
                        ? 'A Performa Invoice is a preliminary bill issued before goods/services are delivered.'
                        : 'A Tax Invoice is the official GST invoice after completion of work/delivery.'}
                </div>
            </div>

            {/* Invoice No & Date */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#333' }}>🔢 Invoice Reference</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <div style={labelS}>Invoice Number (auto-generated, editable)</div>
                        <input value={data.invoiceNo} onChange={e => setData(p => ({ ...p, invoiceNo: e.target.value }))} style={inputS} />
                    </div>
                    <div>
                        <div style={labelS}>Date</div>
                        <input type="date" value={data.date} onChange={e => setData(p => ({ ...p, date: e.target.value }))} style={inputS} />
                    </div>
                </div>
            </div>

            {/* Address & T&C */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                {/* Address */}
                <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#333' }}>🏢 Recipient Details</div>
                    {field('Salutation / Title', data.toTitle, v => setData(p => ({ ...p, toTitle: v })))}
                    <div style={{ marginBottom: 8 }}>
                        <div style={labelS}>Company Name (from CRM)</div>
                        <ClientSearchInput
                            value={data.companyName}
                            onChange={v => setData(p => ({ ...p, companyName: v }))}
                            onSelect={onClientSelect}
                        />
                    </div>
                    {field('Street / Address', data.street, v => setData(p => ({ ...p, street: v })))}
                    {field('Location / Area', data.location, v => setData(p => ({ ...p, location: v })))}
                    <div className="grid grid-cols-3 gap-2">
                        {field('City / District', data.city, v => setData(p => ({ ...p, city: v })))}
                        {field('State', data.state, v => setData(p => ({ ...p, state: v })))}
                        {field('PIN', data.pin, v => setData(p => ({ ...p, pin: v })))}
                    </div>
                </div>

                {/* Terms & Tax */}
                <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#333' }}>📜 Terms &amp; Tax</div>
                    <div style={{ fontWeight: 600, fontSize: 11, color: '#555', marginBottom: 6 }}>Terms &amp; Conditions Preset</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {TC_PRESETS.map((p, i) => (
                            <button key={i} onClick={() => applyTcPreset(i)}
                                style={{
                                    padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                                    background: tcPresetIdx === i ? '#E3242B' : '#eee',
                                    color: tcPresetIdx === i ? '#fff' : '#333',
                                    border: `1px solid ${tcPresetIdx === i ? '#E3242B' : '#ccc'}`
                                }}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {tcPresetIdx === 3 ? (
                        <textarea value={customTcText} rows={5}
                            onChange={e => { setCustomTcText(e.target.value); setData(p => ({ ...p, termsItems: e.target.value.split('\n').filter(Boolean) })); }}
                            style={{ width: '100%', fontSize: 11, border: '1px solid #ccc', borderRadius: 4, padding: 8, boxSizing: 'border-box', resize: 'vertical' }}
                            placeholder="Enter each term on a new line..." />
                    ) : (
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {data.termsItems.map((t, i) => (
                                <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                                    <input
                                        value={t}
                                        onChange={e => {
                                            const newTerms = [...data.termsItems];
                                            newTerms[i] = e.target.value;
                                            setData(p => ({ ...p, termsItems: newTerms }));
                                        }}
                                        style={{ ...inputS, flex: 1, fontSize: 10 }}
                                    />
                                    <button
                                        onClick={() => {
                                            const newTerms = data.termsItems.filter((_, idx) => idx !== i);
                                            setData(p => ({ ...p, termsItems: newTerms }));
                                        }}
                                        style={{ background: '#fdd', border: '1px solid #faa', borderRadius: 3, cursor: 'pointer', padding: '0 6px' }}
                                    >✕</button>
                                </div>
                            ))}
                            <button
                                onClick={() => setData(p => ({ ...p, termsItems: [...p.termsItems, ''] }))}
                                style={{ fontSize: 10, padding: '2px 8px', background: '#eee', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', marginTop: 4 }}
                            >+ Add Term</button>
                        </div>
                    )}
                    {/* Tax rates */}
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                            <div style={labelS}>SGST %</div>
                            <input type="number" value={data.sgstPct} onChange={e => setData(p => ({ ...p, sgstPct: parseFloat(e.target.value) || 0 }))} style={inputS} />
                        </div>
                        <div>
                            <div style={labelS}>CGST %</div>
                            <input type="number" value={data.cgstPct} onChange={e => setData(p => ({ ...p, cgstPct: parseFloat(e.target.value) || 0 }))} style={inputS} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>📋 Line Items</div>
                    <button onClick={() => setShowCatalog(v => !v)}
                        style={{ padding: '5px 14px', background: showCatalog ? '#555' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        {showCatalog ? '✕ Close Catalog' : '📦 Open Catalog'}
                    </button>
                </div>

                {showCatalog && (
                    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, color: '#1a73e8' }}>📦 Click an item to add it</div>
                            <button onClick={() => setShowAddForm(v => !v)}
                                style={{ padding: '5px 12px', background: showAddForm ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                {showAddForm ? '✕ Cancel' : '➕ Add Item to Catalog'}
                            </button>
                        </div>

                        {showAddForm && (
                            <form onSubmit={e => e.preventDefault()} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 8, color: '#475569' }}>➕ Add New Catalog Item</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                                    <div>
                                        <label style={{ fontSize: 9.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 2 }}>Item Title</label>
                                        <input required placeholder="e.g. ABC TYPE Extinguisher Refilling" value={newItem.title}
                                            onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                            className="form-input text-xs w-full" style={{ padding: '4px 8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 9.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 2 }}>Rate (₹)</label>
                                        <input required type="number" placeholder="570" value={newItem.rate}
                                            onChange={e => setNewItem(prev => ({ ...prev, rate: e.target.value }))}
                                            className="form-input text-xs w-full" style={{ padding: '4px 8px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                                    <div>
                                        <label style={{ fontSize: 9.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 2 }}>Unit</label>
                                        <select value={newItem.unit} onChange={e => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                                            className="form-input text-xs w-full" style={{ padding: '4px 8px' }}>
                                            <option value="Nos">Nos</option>
                                            <option value="Mtr">Mtr</option>
                                            <option value="Lot">Lot</option>
                                            <option value="Set">Set</option>
                                            <option value="Sq.Mtr">Sq.Mtr</option>
                                            <option value="Kg">Kg</option>
                                            <option value="LS">LS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 9.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 2 }}>Description (Optional)</label>
                                        <input placeholder="e.g. Servicing, Testing..." value={newItem.description}
                                            onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                            className="form-input text-xs w-full" style={{ padding: '4px 8px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                                    <button type="button" onClick={() => handleSaveCatalog(true)}
                                        style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700, width: '100%' }}>
                                        💾 Save & Close
                                    </button>
                                    <button type="button" onClick={() => handleSaveCatalog(false)}
                                        style={{ padding: '6px 14px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700, width: '100%' }}>
                                        ➕ Save & Add New
                                    </button>
                                </div>
                            </form>
                        )}

                        <input placeholder="Search..." value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                            style={{ ...inputS, marginBottom: 10, maxWidth: 300 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                            {filteredCatalog.map((cat, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <div onClick={() => addFromCatalog(cat)}
                                        style={{ border: '1px solid #ddd', borderRadius: 6, padding: '7px 10px', paddingRight: '28px', cursor: 'pointer', background: '#f8f8f8' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '#f8f8f8')}>
                                        <div style={{ fontWeight: 700, fontSize: 11 }}>{cat.title}</div>
                                        <div style={{ fontSize: 9.5, color: '#666', marginTop: 2 }}>₹{cat.rate.toLocaleString('en-IN')} / {cat.unit}</div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Delete "${cat.title}" from catalog?`)) {
                                                setCatalog(prev => prev.filter(item => item.title !== cat.title));
                                            }
                                        }}
                                        style={{
                                            position: 'absolute', top: 5, right: 5, background: 'transparent', border: 'none',
                                            color: '#94a3b8', fontSize: 12, cursor: 'pointer', padding: '2px 5px', borderRadius: 4
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                            <tr style={{ background: '#eee' }}>
                                {['Sr.', 'Title', 'Description', 'Qty', 'Unit', 'Rate ₹', 'Tax %', 'Amount ₹', ''].map(h => (
                                    <th key={h} style={{ border: '1px solid #ccc', padding: '5px 6px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, idx) => (
                                <tr key={item.id || idx}>
                                    <td style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold' }}>
                                        {idx + 1}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: 3 }}>
                                        <ItemSearchInput
                                            value={item.title}
                                            catalog={catalog}
                                            onChange={(v: string) => updateItem(item.id, 'title', v)}
                                            onSelect={(cat: typeof CATALOG_ITEMS[0]) => {
                                                setData(prev => ({
                                                    ...prev,
                                                    items: recalc(prev.items.map(it => it.id === item.id ? { ...it, title: cat.title, description: cat.description, rate: cat.rate, unit: cat.unit } : it))
                                                }));
                                            }}
                                            onAdd={(title: string) => addToCatalog(title, item.id)}
                                        />
                                    </td>
                                    {(['description', 'qty', 'unit'] as (keyof InvoiceItem)[]).map(f => (
                                        <td key={f} style={{ border: '1px solid #ddd', padding: 3 }}>
                                            <input value={String(item[f])} onChange={e => updateItem(item.id, f, e.target.value)}
                                                style={{ ...inputS, minWidth: f === 'description' ? 120 : 36 }} />
                                        </td>
                                    ))}
                                    <td style={{ border: '1px solid #ddd', padding: 3 }}>
                                        <input type="number" value={item.rate === 0 ? '' : item.rate}
                                            onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                            onFocus={e => e.target.select()}
                                            style={{ ...inputS, minWidth: 60 }} />
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: 3 }}>
                                        <input type="number" value={item.taxPct === 0 ? '' : item.taxPct}
                                            onChange={e => updateItem(item.id, 'taxPct', parseFloat(e.target.value) || 0)}
                                            onFocus={e => e.target.select()}
                                            style={{ ...inputS, minWidth: 46 }} />
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '3px 6px', fontFamily: 'monospace', whiteSpace: 'nowrap', color: '#333', minWidth: 80 }}>
                                        ₹ {fmt(item.amount)}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: 3 }}>
                                        <button onClick={() => removeItem(item.id)} style={{ background: '#fdd', border: '1px solid #faa', borderRadius: 3, cursor: 'pointer', padding: '2px 7px', fontSize: 11 }}>✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <button onClick={addEmptyRow} style={{ padding: '5px 14px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>+ Add Row</button>
                    <div style={{ textAlign: 'right', fontSize: 12, lineHeight: 2, color: '#333' }}>
                        <div>Base Total: <strong>₹ {fmt(baseAmount)}</strong></div>
                        <div>SGST @{data.sgstPct}%: <strong>₹ {fmt(sgstAmt)}</strong></div>
                        <div>CGST @{data.cgstPct}%: <strong>₹ {fmt(cgstAmt)}</strong></div>
                        <div style={{ color: '#E3242B', fontSize: 14 }}>Grand Total: <strong>₹ {fmt(grandTotal)}</strong></div>
                    </div>
                </div>
                <div style={{
                    marginTop: 30, textAlign: 'center', padding: '20px 0',
                    borderTop: '1px dashed #ccc', display: 'flex', justifyContent: 'center', gap: 15
                }}>
                    <button onClick={() => window.print()}
                        style={{ padding: '10px 30px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                        🖨️ Print / Download PDF
                    </button>
                    <button onClick={() => setShowPreview(true)}
                        style={{ padding: '10px 30px', background: '#555', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                        👁 Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

export { LegacyInvoicePreview };
export default LegacyInvoiceModule;
