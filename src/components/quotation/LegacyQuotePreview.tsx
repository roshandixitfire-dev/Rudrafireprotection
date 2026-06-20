'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { fetchNextQuotationNumber } from '@/utils/documentVersioning';
import QuotationStickyHeader from './QuotationStickyHeader';
import './quotation.css';

const supabase = createClient();


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
];

// ─── T&C Presets ────────────────────────────────────────────────────────────────
const TC_PRESETS = [
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
        label: 'Repair & Replacement',
        items: [
            'All repair and replacement work has been carried out as per site inspection and client approval; any additional work, if required, will be charged separately.',
            "Materials replaced are new and standard quality unless otherwise specified; warranty, if any, is limited to the manufacturer's terms.",
            'The system has been tested at site after completion of work; final performance may depend on existing infrastructure and site conditions.',
            'Payment to be made within the agreed credit period from the invoice date; delayed payments may attract applicable charges.',
            'This invoice is valid only for the work mentioned above; no liability is accepted for pre-existing faults or future damage beyond the scope of work.',
        ],
    },
    {
        label: 'Custom',
        items: ['Payment: 100% advance with confirmed Work Order.', 'Taxes are extra as applicable.'],
    },
];

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface LegacyItem {
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

export interface LegacyQuotation {
    quoteNo: string;
    date: string;
    toTitle: string;
    companyName: string;
    street: string;
    location: string;
    city: string;
    state: string;
    pin: string;
    items: LegacyItem[];
    termsItems: string[];
    sgstPct: number;
    cgstPct: number;
}

// ─── Flame SVG ──────────────────────────────────────────────────────────────────
const FlameSVG: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 42, height = 58, color = '#E3242B' }) => (
    <svg width={width} height={height} viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5C50 5 80 32 80 62C80 79 67.5 93 50 93C32.5 93 20 79 20 62C20 49 27 41 33 36C33 36 31 48 41 54C41 54 37 36 50 22C50 22 47 38 56 44C56 44 70 33 50 5Z" fill={color} />
        <path d="M50 78C50 78 63 65 63 52C63 44 58 39 50 37C50 37 54 47 48 50C48 50 52 41 46 35C46 35 40 43 40 52C40 59 44 66 50 68V78Z" fill="white" opacity="0.7" />
    </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n: number): string => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const calcAmount = (qty: string, rate: number, taxPct: number): number => {
    const q = parseFloat(qty) || 0;
    return q * rate; // base amount without tax (tax shown separately in totals)
};
const todayISO = (): string => new Date().toISOString().split('T')[0];

const makeDefaultItem = (overrides: Partial<LegacyItem> = {}): LegacyItem => ({
    id: Date.now().toString() + Math.random(), srNo: '', title: '', description: '',
    qty: '1', unit: 'Nos', rate: 0, taxPct: 18, amount: 0, ...overrides,
});

const defaultItems: LegacyItem[] = [
    makeDefaultItem({ id: '1a', srNo: '1', title: 'ABC TYPE Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of ABC & Co2 type stored pressure extinguishers.', qty: '09', rate: 570, taxPct: 18, amount: calcAmount('09', 570, 18) }),
    makeDefaultItem({ id: '1b', srNo: '', title: 'Co2 TYPE Extinguisher Refilling', description: 'Servicing, Testing, Cleaning, Refilling and Reconditioning of Co2 type stored pressure extinguishers.', qty: '01', rate: 750, taxPct: 18, amount: calcAmount('01', 750, 18) }),
    makeDefaultItem({ id: '2', srNo: '2', title: 'Transportation', description: '', qty: '1', unit: 'Nos', rate: 1000, taxPct: 0, amount: 1000 }),
];

const defaultData: LegacyQuotation = {
    quoteNo: '', // Set on mount
    date: todayISO(),
    toTitle: 'The Hon Chairman/ Hon Secretary,',
    companyName: '', street: '', location: '', city: '', state: 'Maharashtra', pin: '',
    items: defaultItems,
    termsItems: TC_PRESETS[0].items,
    sgstPct: 9,
    cgstPct: 9,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════
const LegacyQuotePreview: React.FC<{ data: LegacyQuotation }> = ({ data }) => {
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
        <div id="legacy-print-page" style={{
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
                    #legacy-print-page, #legacy-print-page * { visibility: visible; }
                    #legacy-print-page {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 210mm !important; min-height: auto !important;
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
                    #legacy-print-page { 
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
                                        <div style={{ color: '#E3242B', fontSize: '24px', fontWeight: '700', fontFamily: 'Arial, sans-serif', marginRight: '-5mm', marginBottom: '-5px' }}>
                                            QUOTATION {data.quoteNo}
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
                                    Please find below our best priced offer, terms &amp; conditions
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

                                <div style={{ border: '1px solid #000', borderTop: 'none', padding: '10px 15px', height: '110px' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 50 }}>For, Rudra Fire Protection</div>
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

// ═══════════════════════════════════════════════════════════════════════════════
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

    const results = value.length >= 2
        ? catalog.filter(c => c.title.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
        : [];

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const inputS: React.CSSProperties = { border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: '100%', boxSizing: 'border-box' };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }}
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
const DRAFT_KEY = 'rudra-legacy-quote-draft';

const LegacyQuoteModule: React.FC<{ tabs?: React.ReactNode }> = ({ tabs }) => {
    // SSR-safe default — no localStorage in initializer (avoids hydration mismatch)
    const [data, setData] = useState<LegacyQuotation>(defaultData);
    const [catalog, setCatalog] = useState(CATALOG_ITEMS);
    const [showPreview, setShowPreview] = useState(false);
    const [showCatalog, setShowCatalog] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [tcPresetIdx, setTcPresetIdx] = useState(0);
    const [customTcText, setCustomTcText] = useState(TC_PRESETS[3].items.join('\n'));
    const [draftSaved, setDraftSaved] = useState(false);
    const [dbStatus, setDbStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [savedId, setSavedId] = useState<string | null>(null);

    // Single mount effect: restore draft OR fetch new sequence number from DB
    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as LegacyQuotation;
                setData(parsed);
                return; // draft restored, done
            }
        } catch { }
        // No draft — fetch sequential number from DB
        fetchNextQuotationNumber('legacy').then(no => setData(prev => ({ ...prev, date: todayISO(), quoteNo: no })));
    }, []);

    // ─── Auto-save draft to localStorage ──────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
            setDraftSaved(true);
            setTimeout(() => setDraftSaved(false), 1500);
        }, 600);
        return () => clearTimeout(t);
    }, [data]);

    // ─── Save to Supabase DB ────────────────────────────────────────────────
    const saveToDb = async () => {
        setDbStatus('saving');
        const baseAmt = data.items.reduce((s, it) => s + it.amount, 0);
        const sgstAmt = baseAmt * data.sgstPct / 100;
        const cgstAmt = baseAmt * data.cgstPct / 100;
        const docPayload = {
            quote_no: data.quoteNo,
            quote_date: data.date,
            status: 'Draft' as const,
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
            raw_json: data as unknown as Record<string, unknown>,
        };
        const { data: res, error } = savedId
            ? await supabase.from('legacy_quotations').update(docPayload).eq('id', savedId).select('id').single()
            : await supabase.from('legacy_quotations').insert(docPayload).select('id').single();
        if (error) {
            console.error('Quote save error:', JSON.stringify({ code: error.code, message: error.message, details: error.details, hint: error.hint }));
            setDbStatus('error');
            setTimeout(() => setDbStatus('idle'), 3000);
        } else {
            if (res?.id) setSavedId(res.id);
            setDbStatus('saved');
            setTimeout(() => setDbStatus('idle'), 2500);
        }
    };

    const recalc = (items: LegacyItem[]) =>
        items.map(it => ({ ...it, amount: calcAmount(it.qty, it.rate, it.taxPct) }));

    const updateItem = (id: string, field: keyof LegacyItem, value: string | number) => {
        setData(prev => {
            const items = prev.items.map(it => it.id === id ? { ...it, [field]: value } : it);
            return { ...prev, items: recalc(items) };
        });
    };

    // ─── Auto Sr No: find highest numeric sr + 1 ───────────────────────────
    const nextSrNo = (items: LegacyItem[]): string => {
        const nums = items.map(it => parseInt(it.srNo)).filter(n => !isNaN(n));
        return nums.length > 0 ? String(Math.max(...nums) + 1) : '1';
    };

    const addFromCatalog = (cat: typeof CATALOG_ITEMS[0]) => {
        setData(prev => {
            const newItem = makeDefaultItem({ title: cat.title, description: cat.description, unit: cat.unit, rate: cat.rate, taxPct: 18, amount: calcAmount('1', cat.rate, 18) });
            return { ...prev, items: [...prev.items, newItem] };
        });
    };

    const addToCatalog = (title: string, id: string) => {
        const item = data.items.find(it => it.id === id);
        if (!item) return;
        if (!window.confirm(`Save "${item.title}" to your catalog for this session?\n\nRate: ₹${item.rate} | Unit: ${item.unit}`)) return;
        const newCat = { title: item.title, description: item.description, unit: item.unit, rate: item.rate };
        setCatalog(prev => [...prev, newCat]);
    };

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        const newQuoteNo = genQuoteNo();
        setData({ ...defaultData, quoteNo: newQuoteNo });
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
                <div className="no-print flex flex-wrap items-center gap-2 p-3 sm:px-4 sm:py-2 bg-[#1a1a1a] border-b border-[#333] shrink-0">
                    <button onClick={() => setShowPreview(false)} style={{ padding: '6px 14px', background: '#555', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>← Edit</button>
                    <button onClick={saveToDb} disabled={dbStatus === 'saving'} style={{ padding: '6px 14px', background: dbStatus === 'saved' ? '#16a34a' : dbStatus === 'error' ? '#dc2626' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                        {dbStatus === 'saving' ? '⏳ Saving...' : dbStatus === 'saved' ? '✓ Saved!' : dbStatus === 'error' ? '✗ Error' : '💾 Save'}
                    </button>
                    <button onClick={() => window.print()} style={{ padding: '6px 14px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>🖨 Print / PDF</button>
                    <span className="ml-auto text-[#aaa] text-[11px] w-full sm:w-auto text-right mt-2 sm:mt-0">A4 Preview Mode</span>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '20px 0' }}>
                    <div style={{ width: 'fit-content', margin: '0 auto', padding: '0 20px' }}>
                        <LegacyQuotePreview data={data} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quotation-container">
            {/* Header */}
            <QuotationStickyHeader
                actions={
                    <>
                        <button onClick={clearDraft} style={{ padding: '7px 14px', background: '#fff', color: '#888', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🆕 New Quote</button>
                        <button onClick={saveToDb} disabled={dbStatus === 'saving'} style={{ padding: '7px 16px', background: dbStatus === 'saved' ? '#16a34a' : dbStatus === 'error' ? '#dc2626' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            {dbStatus === 'saving' ? '⏳ Saving...' : dbStatus === 'saved' ? '✓ Saved!' : dbStatus === 'error' ? '✗ Error – Retry' : '💾 Save'}
                        </button>
                        <button onClick={() => setShowPreview(true)} style={{ padding: '8px 18px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Preview / Print →</button>
                    </>
                }
            />

            {/* ── TOP CARD: Master Details ── */}
            <div className="quotation-card no-print">
                <div className="mb-3">
                    <label className="form-label mb-1 block">🔍 Search Client / Project (CRM)</label>
                    <ClientSearchInput
                        value={data.companyName}
                        onChange={v => setData(p => ({ ...p, companyName: v }))}
                        onSelect={onClientSelect}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                    <div>
                        <label className="form-label text-[10px]">Quotation No.</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.quoteNo} onChange={e => setData(p => ({ ...p, quoteNo: e.target.value }))} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Date</label>
                        <input type="date" className="form-input text-xs w-full py-1.5" value={data.date} onChange={e => setData(p => ({ ...p, date: e.target.value }))} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Salutation / Title</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.toTitle} onChange={e => setData(p => ({ ...p, toTitle: e.target.value }))} />
                    </div>

                    <div>
                        <label className="form-label text-[10px]">Company Name</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.companyName} onChange={e => setData(p => ({ ...p, companyName: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                        <label className="form-label text-[10px]">Street / Address</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.street} onChange={e => setData(p => ({ ...p, street: e.target.value }))} />
                    </div>

                    <div>
                        <label className="form-label text-[10px]">Location / Area</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.location} onChange={e => setData(p => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">City / District</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.city} onChange={e => setData(p => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">State</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.state} onChange={e => setData(p => ({ ...p, state: e.target.value }))} />
                    </div>

                    <div>
                        <label className="form-label text-[10px]">PIN</label>
                        <input className="form-input text-xs w-full py-1.5" value={data.pin} onChange={e => setData(p => ({ ...p, pin: e.target.value }))} />
                    </div>
                </div>
            </div>

            {/* Terms & Tax */}
            <div className="quotation-card no-print">
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#333' }}>📜 Terms &amp; Tax</div>
                <div style={{ fontWeight: 600, fontSize: 11, color: '#555', marginBottom: 6 }}>Terms &amp; Conditions Preset</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {TC_PRESETS.map((p, i) => (
                        <button key={i} onClick={() => applyTcPreset(i)}
                            style={{
                                padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                                background: tcPresetIdx === i ? '#E3242B' : '#f8fafc',
                                color: tcPresetIdx === i ? '#fff' : '#334155',
                                border: `1px solid ${tcPresetIdx === i ? '#E3242B' : '#e2e8f0'}`
                            }}>
                            {p.label}
                        </button>
                    ))}
                </div>
                {tcPresetIdx === 3 ? (
                    <textarea value={customTcText} rows={5}
                        onChange={e => { setCustomTcText(e.target.value); setData(p => ({ ...p, termsItems: e.target.value.split('\n').filter(Boolean) })); }}
                        className="form-input w-full text-xs py-2 box-border resize-y"
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
                                    className="form-input flex-1 text-xs py-1"
                                />
                                <button
                                    onClick={() => {
                                        const newTerms = data.termsItems.filter((_, idx) => idx !== i);
                                        setData(p => ({ ...p, termsItems: newTerms }));
                                    }}
                                    style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer', padding: '0 8px', color: '#dc2626' }}
                                >✕</button>
                            </div>
                        ))}
                        <button
                            onClick={() => setData(p => ({ ...p, termsItems: [...p.termsItems, ''] }))}
                            style={{ fontSize: 11, padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', marginTop: 4, color: '#475569', fontWeight: 600 }}
                        >+ Add Term</button>
                    </div>
                )}
                {/* Tax rates */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="form-label text-[10px]">SGST %</label>
                        <input type="number" value={data.sgstPct} onChange={e => setData(p => ({ ...p, sgstPct: parseFloat(e.target.value) || 0 }))} className="form-input text-xs w-full py-1.5" />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">CGST %</label>
                        <input type="number" value={data.cgstPct} onChange={e => setData(p => ({ ...p, cgstPct: parseFloat(e.target.value) || 0 }))} className="form-input text-xs w-full py-1.5" />
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="quotation-card no-print">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#333' }}>📋 Line Items</div>
                    <button onClick={() => setShowCatalog(v => !v)}
                        style={{ padding: '5px 14px', background: showCatalog ? '#555' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        {showCatalog ? '✕ Close Catalog' : '📦 Open Catalog'}
                    </button>
                </div>

                {showCatalog && (
                    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 12, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: '#1a73e8' }}>📦 Click an item to add it</div>
                        <input placeholder="Search..." value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                            className="form-input text-xs" style={{ marginBottom: 10, maxWidth: 300 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                            {filteredCatalog.map((cat, i) => (
                                <div key={i} onClick={() => addFromCatalog(cat)}
                                    style={{ border: '1px solid #ddd', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', background: '#f8f8f8' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#e8f0fe')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#f8f8f8')}>
                                    <div style={{ fontWeight: 700, fontSize: 11 }}>{cat.title}</div>
                                    <div style={{ fontSize: 9.5, color: '#666', marginTop: 2 }}>₹{cat.rate.toLocaleString('en-IN')} / {cat.unit}</div>
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
                                <tr key={item.id}>
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
                                    {(['description', 'qty', 'unit'] as (keyof LegacyItem)[]).map(f => (
                                        <td key={f} style={{ border: '1px solid #e2e8f0', padding: 3 }}>
                                            <input value={String(item[f])} onChange={e => updateItem(item.id, f, e.target.value)}
                                                className="form-input text-xs" style={{ minWidth: f === 'description' ? 120 : 36 }} />
                                        </td>
                                    ))}
                                    <td style={{ border: '1px solid #e2e8f0', padding: 3 }}>
                                        <input type="number" value={item.rate === 0 ? '' : item.rate}
                                            onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                            onFocus={e => e.target.select()}
                                            className="form-input text-xs" style={{ minWidth: 60 }} />
                                    </td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: 3 }}>
                                        <input type="number" value={item.taxPct === 0 ? '' : item.taxPct}
                                            onChange={e => updateItem(item.id, 'taxPct', parseFloat(e.target.value) || 0)}
                                            onFocus={e => e.target.select()}
                                            className="form-input text-xs" style={{ minWidth: 46 }} />
                                    </td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '3px 6px', fontFamily: 'monospace', whiteSpace: 'nowrap', color: '#333', minWidth: 80 }}>
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                    <button onClick={addEmptyRow} style={{ padding: '5px 14px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>+ Add Row</button>
                    <div className="w-full sm:w-auto mt-2 sm:mt-0" style={{ textAlign: 'right', fontSize: 12, lineHeight: 2, color: '#333' }}>
                        <div>Base Total: <strong>₹ {fmt(baseAmount)}</strong></div>
                        <div>SGST @{data.sgstPct}%: <strong>₹ {fmt(sgstAmt)}</strong></div>
                        <div>CGST @{data.cgstPct}%: <strong>₹ {fmt(cgstAmt)}</strong></div>
                        <div style={{ color: '#E3242B', fontSize: 14 }}>Grand Total: <strong>₹ {fmt(grandTotal)}</strong></div>
                    </div>
                </div>
                <div className="mt-8 text-center py-5 border-t border-dashed border-gray-300 flex flex-wrap justify-center gap-4">
                    <button onClick={() => window.print()}
                        style={{ padding: '10px 30px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                        🖨️ Print / Download PDF
                    </button>
                    <button onClick={() => setShowPreview(false)}
                        style={{ padding: '10px 30px', background: '#555', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                        Edit Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export { LegacyQuotePreview };
export default LegacyQuoteModule;
