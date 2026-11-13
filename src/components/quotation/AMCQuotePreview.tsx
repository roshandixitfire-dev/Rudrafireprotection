'use client';
import React from 'react';
import { AMCQuotation, AMCItem, AMCPackage } from './types';

const fmt = (n: number): string => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const td: React.CSSProperties = {
    border: '1px solid #000',
    padding: '4px 6px',
    fontSize: 10.5,
    fontFamily: 'Arial, sans-serif',
    verticalAlign: 'top',
};

const AMCQuotePreview: React.FC<{ data: AMCQuotation }> = ({ data }) => {
    const displayDate = data.date ? new Date(data.date).toLocaleDateString('en-IN') : '';

    return (
        <div id="amc-print-page" style={{
            width: '210mm', minHeight: '297mm', background: '#fff',
            fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
            margin: '0 auto', position: 'relative',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 0 !important; }
                    html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #fff !important; }
                    body * { visibility: hidden; }
                    #amc-print-page, #amc-print-page * { visibility: visible; }
                    #amc-print-page {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 210mm !important; min-height: auto !important;
                        margin: 0 !important; padding: 0 !important; border: none !important;
                        box-shadow: none !important; background: #fff !important;
                    }
                    table { border-collapse: collapse; width: 100%; border: none !important; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    .footer-spacer { height: 25mm; }
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
                    #amc-print-page { 
                        box-shadow: 0 0 10px rgba(0,0,0,0.15); 
                        position: relative;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        min-height: 297mm !important;
                    }
                    #amc-print-page > table {
                        flex: 1 0 auto;
                    }
                    #amc-print-page .visual-footer {
                        margin-top: auto !important;
                        position: relative !important;
                        width: 100% !important;
                        background: #fff !important;
                    }
                    .watermark { display: none; }
                }
            `}</style>

            {/* Watermark for Print */}
            <div className="watermark">
                <img src="/logo.png" alt="" style={{ width: '100%', height: 'auto' }} />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                <thead>
                    <tr>
                        <td style={{ border: 'none', padding: 0 }}>
                            <div style={{ position: 'relative', width: '100%', height: '150px', marginBottom: '0px' }}>
                                <div style={{
                                    position: 'absolute', left: 0, right: 0, width: '100%', height: '140px',
                                    background: '#FFF1F1',
                                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 45% 80%, 35% 100%, 0% 100%)',
                                    zIndex: 0
                                }} />
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
                                    <div style={{ fontSize: '11px', color: '#333', textAlign: 'right', minWidth: 110 }}>
                                        Date : <strong>{displayDate}</strong>
                                    </div>
                                </div>

                                <div style={{ fontSize: 9.5, lineHeight: 1.75, marginBottom: 8 }}>
                                    <div><strong>To,</strong></div>
                                    <div>{data.toTitle || 'The Hon Chairman/ Hon Secretary,'}</div>
                                    {data.companyName && <div style={{ fontWeight: 700 }}>{data.companyName}</div>}
                                    {data.street && <div>{data.street},</div>}
                                    {data.location && <div>{data.location},</div>}
                                    {(data.city || data.state || data.pin) && <div>{[data.city, data.state, data.pin].filter(Boolean).join(' - ')}</div>}
                                    {data.contactPerson && <div>Contact Person: <strong>{data.contactPerson}</strong></div>}
                                    {data.contactNumber && <div>Contact number: <strong>{data.contactNumber}</strong></div>}
                                    <div><strong>Dear Sir,</strong></div>
                                </div>

                                <div style={{ textAlign: 'center', fontSize: 9.5, fontStyle: 'italic', marginBottom: 10, color: '#444' }}>
                                    Please find below our best priced offer, terms &amp; conditions
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 0 }}>
                                    <thead>
                                        <tr style={{ background: '#fff' }}>
                                            <th style={{ ...td, width: '8mm', textAlign: 'center', fontWeight: 700 }}>Sr.<br />No.</th>
                                            <th style={{ ...td, textAlign: 'center', fontWeight: 700 }}>Item Description</th>
                                            <th style={{ ...td, width: '10mm', textAlign: 'center', fontWeight: 700 }}>Qty</th>
                                            <th style={{ ...td, width: '12mm', textAlign: 'center', fontWeight: 700 }}>Unit</th>
                                            <th style={{ ...td, width: '15mm', textAlign: 'center', fontWeight: 700 }}>Rate</th>
                                            <th style={{ ...td, width: '22mm', textAlign: 'center', fontWeight: 700 }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, idx) => {
                                            // Simple rowSpan logic: 
                                            // If an item has rowSpan > 1, it will span that many rows.
                                            // Subsequent items in the span will have isMergedChild: true.
                                            const isMerged = item.rowSpan && item.rowSpan > 1;

                                            return (
                                                <tr key={item.id}>
                                                    {!item.isMergedChild && (
                                                        <td style={{ ...td, textAlign: 'center', padding: '12px 6px' }} rowSpan={item.rowSpan || 1}>
                                                            {item.srNo || ''}
                                                        </td>
                                                    )}
                                                    <td style={{ ...td, padding: '12px 6px' }}>
                                                        <div style={{ fontWeight: 400 }}>{item.title}</div>
                                                        {item.description && <div style={{ fontSize: 9, lineHeight: 1.4, color: '#444', marginTop: 2 }}>{item.description}</div>}
                                                    </td>
                                                    {!item.isMergedChild && (
                                                        <>
                                                            <td style={{ ...td, textAlign: 'center', verticalAlign: 'middle', padding: '12px 6px' }} rowSpan={item.rowSpan || 1}>
                                                                {item.qty}
                                                            </td>
                                                            <td style={{ ...td, textAlign: 'center', verticalAlign: 'middle', padding: '12px 6px' }} rowSpan={item.rowSpan || 1}>
                                                                {item.unit}
                                                            </td>
                                                            <td style={{ ...td, textAlign: 'center', verticalAlign: 'middle', padding: '12px 6px' }} rowSpan={item.rowSpan || 1}>
                                                                {item.rate > 0 ? item.rate.toLocaleString('en-IN') : '-'}
                                                            </td>
                                                            <td style={{ ...td, textAlign: 'right', verticalAlign: 'middle', fontWeight: item.amount > 0 ? 700 : 400, padding: '12px 6px' }} rowSpan={item.rowSpan || 1}>
                                                                {item.amount > 0 ? fmt(item.amount) : '-'}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                        <tr>
                                            <td style={{ ...td, borderTop: '2px solid #000' }} colSpan={5}>
                                                <div style={{ textAlign: 'right', fontWeight: 700, paddingRight: 4 }}>Total :</div>
                                            </td>
                                            <td style={{ ...td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #000' }}>{fmt(data.totalAmount)}/-</td>
                                        </tr>
                                        {data.packages.map((pkg, i) => (
                                            <tr key={i}>
                                                <td style={{ ...td, textAlign: 'center' }}>*</td>
                                                <td style={td} colSpan={4}>
                                                    Non - Comprehensive Annual Maintenance Contract for {pkg.years} years – <strong>{fmt(pkg.amount)}/-</strong>
                                                </td>
                                                <td style={td}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ marginTop: 15 }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, textDecoration: 'underline', marginBottom: 10 }}>Terms &amp; Conditions:-</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10.5, color: '#333' }}>
                                        {data.terms.map((t, i) => {
                                            const cleanText = t.replace(/^\d+[\.\)\-]\s*/, '');
                                            return (
                                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                    <span style={{ fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                                                    <span style={{ flex: 1, whiteSpace: 'pre-line' }}>{cleanText}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20 }}>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>BANK DETAILS</div>
                                        <div style={{ fontSize: 10.5, lineHeight: 1.6 }}>
                                            <div style={{ fontWeight: 700 }}>Rudra Fire Protection</div>
                                            <div>Bank: State Bank Of India</div>
                                            <div>Account Number : 40698757999</div>
                                            <div>IFSC Code : SBIN0016719</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px 15px', minHeight: '105px', width: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: '6px' }}>For, Rudra Fire Protection</div>
                                        <div style={{ height: '42px', display: 'flex', alignItems: 'center', margin: '4px 0' }}>
                                            {data.includeSignature !== false && (
                                                <img src="/signature.png" alt="Signature" style={{ height: '38px', width: 'auto', mixBlendMode: 'multiply', display: 'block' }} />
                                            )}
                                        </div>
                                        <div style={{ fontSize: 10, fontWeight: 800 }}>Authorised Signatory</div>
                                    </div>
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
            <div className="visual-footer" style={{ padding: '10px 10mm 15px 10mm', borderTop: '1px solid #999', marginTop: 'auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '10px', color: '#374151' }}>
                    <div>17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104 ☎ 7777088817</div>
                    <div style={{ color: '#6b7280' }}>Page 1 / 1</div>
                </div>
                <div style={{ fontSize: '10px', color: '#374151', marginTop: '3px' }}>www.rudrafireprotection.com</div>
            </div>


        </div>
    );
};

export default AMCQuotePreview;
