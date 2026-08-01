import React from 'react';
import { Quotation, QuotationSummary } from './types';
import { PAYMENT_OPTIONS } from './utils';

interface Props {
    quotation: Quotation;
    summary: QuotationSummary;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n: number): string => (isNaN(n) ? 0 : n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function toRoman(n: number): string {
    const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let r = '';
    for (let i = 0; i < vals.length; i++) {
        while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
    }
    return r;
}

// ─── Shared Print Container Header (Matches Legacy) ───────────────────────────
const PrintHeader: React.FC<{ quotationNo: string }> = ({ quotationNo }) => (
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
                                QUOTATION {quotationNo}
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </thead>
);


// ─── Shared Project Info Header ───────────────────────────────────────────────
const ProjectInfoHeader: React.FC<{
    date: string;
    toTitle?: string;
    companyName: string;
    address: string;
    sub: string;
}> = ({ date, companyName, address, sub }) => {
    const displayDate = date ? new Date(date).toLocaleDateString('en-IN') : '';
    const addressLines = address.split('\n');
    return (
        <div style={{ marginTop: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: '11px', color: '#333', textAlign: 'right', minWidth: 110 }}>Date : <strong>{displayDate}</strong></div>
            </div>

            <div style={{ fontSize: 9.5, lineHeight: 1.75, marginBottom: 8 }}>
                <div><strong>To,</strong></div>
                <div>{companyName}</div>
                {addressLines.map((line, idx) => (
                    <div key={idx}>{line}{idx < addressLines.length - 1 ? ',' : ''}</div>
                ))}
                <div><strong>Dear Sir,</strong></div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 9.5, fontStyle: 'italic', marginBottom: 10, color: '#444', fontWeight: 'bold' }}>
                Subject: {sub}
            </div>
        </div>
    );
};


// ─── Page Containers ──────────────────────────────────────────────────────────
const PrintPageContainer: React.FC<{ children: React.ReactNode; pageNo: number; totalPages?: number; quotationNo: string }> = ({ children, pageNo, totalPages, quotationNo }) => {
    return (
        <div id={`pro-print-page-${pageNo}`} className="print-page page-break-before" style={{
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
                    .print-preview, .print-preview * { visibility: visible; }
                    .print-page {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 210mm !important; min-height: auto !important;
                        margin: 0 !important; padding: 0 !important; border: none !important;
                        box-shadow: none !important; background: #fff !important;
                    }
                    /* For multiple pages to layout correctly, only the first should be relative/absolute in weird ways. Actually, relative positioning with page-breaks is best for multipage. */
                    .print-page { position: relative !important; page-break-after: always; }
                    
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
                    .print-page { 
                        box-shadow: 0 0 10px rgba(0,0,0,0.15); 
                        position: relative;
                        margin-bottom: 2rem !important;
                    }
                    .watermark { display: none; }
                }
            `}</style>

            {/* Watermark for Print */}
            <div className="watermark">
                <img src="/logo.png" alt="" style={{ width: '100%', height: 'auto' }} />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                <PrintHeader quotationNo={quotationNo} />

                <tbody>
                    <tr>
                        <td style={{ border: 'none', padding: '0 7mm 0mm 7mm' }}>
                            {children}
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
                    <div style={{ color: '#6b7280' }}>Page {pageNo} {totalPages ? `/ ${totalPages}` : ''}</div>
                </div>
                <div style={{ fontSize: '10px', color: '#374151', marginTop: '3px' }}>www.rudrafireprotection.com</div>
            </div>



        </div>
    );
};

// ─── Shared Styles ────────────────────────────────────────────────────────────
const td: React.CSSProperties = {
    border: '1px solid #000', padding: '4px 6px',
    fontSize: 10.5, fontFamily: 'Arial, sans-serif', verticalAlign: 'top',
};


// ─── Cover Letter Page ────────────────────────────────────────────────────────
const CoverLetterPage: React.FC<{ quotation: Quotation }> = ({ quotation }) => (
    <PrintPageContainer pageNo={1} quotationNo={quotation.quotationNo}>
        <div style={{ marginTop: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: '11px', color: '#333', textAlign: 'right', minWidth: 110 }}>Date : <strong>{new Date(quotation.date).toLocaleDateString('en-IN')}</strong></div>
            </div>

            {/* Client details table (Legacy style simplified or maintaining the compact grid) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999', marginBottom: 10, fontSize: 10.5 }}>
                <tbody>
                    <tr>
                        <td style={{ ...td, width: 70, background: '#fafafa', fontWeight: 600 }}>To</td>
                        <td style={td}></td>
                        <td style={{ ...td, width: 70, background: '#fafafa', fontWeight: 600 }}>Kind Attn.</td>
                        <td style={{ ...td, fontWeight: 700 }}>{quotation.contactPerson || quotation.clientName}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}>Project</td>
                        <td style={{ ...td, fontWeight: 700 }}>{quotation.companyName}</td>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}>Designation</td>
                        <td style={td}>{quotation.designation}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}>Address</td>
                        <td style={td}>{quotation.address.split('\n')[0]}</td>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}>Mobile No.</td>
                        <td style={td}>{quotation.mobile}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}></td>
                        <td style={td}>{quotation.address.split('\n')[1] || ''}</td>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}>Phone No.</td>
                        <td style={td}>{quotation.phoneNo}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}></td>
                        <td style={td}>{quotation.address.split('\n')[2] || ''}</td>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}>Fax No.</td>
                        <td style={td}>{quotation.faxNo}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}></td>
                        <td style={td}>{quotation.address.split('\n')[3] || ''}</td>
                        <td style={{ ...td, background: '#fafafa', fontWeight: 600 }}>E mail I.D.</td>
                        <td style={td}>{quotation.email}</td>
                    </tr>
                </tbody>
            </table>

            {/* Subject */}
            <div style={{ marginBottom: 12, lineHeight: 1.5, fontSize: 10.5 }}>
                <span style={{ fontWeight: 700 }}>Sub. : &nbsp;</span>
                <span>{quotation.subject}</span>
            </div>

            {/* CFO Ref */}
            {quotation.termsConfig?.cfoRefNo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 10.5 }}>
                    <span style={{ fontWeight: 700 }}>C. F. O. Ref. No. : {quotation.termsConfig.cfoRefNo}</span>
                    <span style={{ fontWeight: 700 }}>Dated : {quotation.termsConfig.cfoDate}</span>
                </div>
            )}

            <div style={{ marginBottom: 16 }}>&nbsp;</div>

            {/* Letter body */}
            <div style={{ marginBottom: 12, fontSize: 10.5 }}>Dear Sir,</div>
            <div style={{ lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: 24, fontSize: 10.5 }}>
                {quotation.coverLetterBody || `With reference to above mentioned subject, we are submitting you our lowest & best offer for Fire Fighting work at your ${quotation.projectLocation || quotation.projectName} project.\n\nShould you require any further information relating to our offer, please do not hesitate to contact us, as we are open for negotiation.\n\nAssuring you our best services and sincere co-operation at all the time.`}
            </div>

            {/* Signature Block (match legacy visual style) */}
            <div style={{ border: '1px solid #000', padding: '10px 15px', height: '110px', width: '250px', marginTop: 40, position: 'relative' }}>
                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 50 }}>For, Rudra Fire Protection</div>
                {quotation.printPages.includeSignature !== false && (
                    <div style={{ position: 'absolute', bottom: '45px', left: '25px', height: '38px', pointerEvents: 'none' }}>
                        <img src="/signature.png" alt="Signature" style={{ height: '100%', width: 'auto', mixBlendMode: 'multiply' }} />
                    </div>
                )}
                <div style={{ fontSize: 10, fontWeight: 800 }}>{quotation.preparedBy || 'Roshan Dixit'}</div>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Business Head</div>
            </div>
        </div>
    </PrintPageContainer>
);


// ─── Summary Sheet Page ───────────────────────────────────────────────────────
const SummarySheetPage: React.FC<{ quotation: Quotation; summary: QuotationSummary; pageNo: number }> = ({ quotation, summary, pageNo }) => {
    const halfGst = quotation.gstPercentage / 2;
    return (
        <PrintPageContainer pageNo={pageNo} quotationNo={quotation.quotationNo}>
            <ProjectInfoHeader
                date={quotation.date}
                companyName={quotation.companyName}
                address={quotation.address}
                sub="Summary Sheet"
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 0 }}>
                <thead>
                    <tr style={{ background: '#e8e8e8' }}>
                        <th style={{ ...td, width: 60, textAlign: 'center', fontWeight: 'bold' }}>Sr. No.</th>
                        <th style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>Description</th>
                        <th style={{ ...td, width: 140, textAlign: 'center', fontWeight: 'bold' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {quotation.sections.map((sec, idx) => (
                        <tr key={sec.id}>
                            <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>{toRoman(idx + 1)}</td>
                            <td style={{ ...td, fontWeight: 'bold' }}>{sec.name}</td>
                            <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(sec.total)}</td>
                        </tr>
                    ))}
                    <tr><td style={{ ...td, height: 18 }} colSpan={3}></td></tr>
                    {/* Subtotal */}
                    <tr style={{ background: '#f8f8f8' }}>
                        <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontWeight: 700 }} colSpan={2}>Gross Total :</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{fmt(summary.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, borderRight: 'none', textAlign: 'right' }} colSpan={2}>Output SGST @{halfGst}% :</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>{summary.sgst > 0 ? fmt(summary.sgst) : '-'}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, borderRight: 'none', textAlign: 'right' }} colSpan={2}>Output CGST @{halfGst}% :</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>{summary.cgst > 0 ? fmt(summary.cgst) : '-'}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontWeight: 800, background: '#eee' }} colSpan={2}>Grand Total :</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', background: '#eee' }}>{fmt(summary.grandTotal)}</td>
                    </tr>
                    <tr>
                        <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontWeight: 800, background: '#eee' }} colSpan={2}>Rounded Total :</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', background: '#eee' }}>{fmt(summary.roundedTotal)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Note logic under table */}
            <div style={{ display: 'flex', border: '1px solid #000', borderTop: 'none', padding: '8px' }}>
                <div style={{ fontSize: 10.5 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Amount in Words:</div>
                    <div style={{ color: '#333' }}>{summary.amountInWords}</div>
                    <div style={{ marginTop: 8, fontStyle: 'italic', color: '#555' }}>* Liaisoning charges will be extra</div>
                </div>
            </div>

            {/* Signature Block */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <div style={{ border: '1px solid #000', padding: '10px 15px', height: '110px', width: '250px', position: 'relative' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 50 }}>For, Rudra Fire Protection</div>
                    {quotation.printPages.includeSignature !== false && (
                        <div style={{ position: 'absolute', bottom: '45px', left: '25px', height: '38px', pointerEvents: 'none' }}>
                            <img src="/signature.png" alt="Signature" style={{ height: '100%', width: 'auto', mixBlendMode: 'multiply' }} />
                        </div>
                    )}
                    <div style={{ fontSize: 10, fontWeight: 800 }}>{quotation.preparedBy || 'Roshan Dixit'}</div>
                    <div style={{ fontSize: 10, fontWeight: 800 }}>Business Head</div>
                </div>
            </div>
        </PrintPageContainer>
    );
};

// ─── BOQ Section Page ─────────────────────────────────────────────────────────
const BOQPage: React.FC<{ quotation: Quotation; sectionIdx: number; pageNo: number }> = ({ quotation, sectionIdx, pageNo }) => {
    const section = quotation.sections[sectionIdx];
    return (
        <PrintPageContainer pageNo={pageNo} quotationNo={quotation.quotationNo}>
            <ProjectInfoHeader
                date={quotation.date}
                companyName={quotation.companyName}
                address={quotation.address}
                sub={`${section.name} (BOQ)`}
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 0 }}>
                <thead>
                    <tr style={{ background: '#e8e8e8' }}>
                        <th style={{ ...td, width: 28, textAlign: 'center', fontWeight: 700 }}>Sr.<br />No.</th>
                        <th style={{ ...td, textAlign: 'center', fontWeight: 700 }}>Item Description</th>
                        <th style={{ ...td, width: 30, textAlign: 'center', fontWeight: 700 }}>Qty</th>
                        <th style={{ ...td, width: 32, textAlign: 'center', fontWeight: 700 }}>Unit</th>
                        <th style={{ ...td, width: 48, textAlign: 'center', fontWeight: 700 }}>Rate</th>
                        <th style={{ ...td, width: 64, textAlign: 'center', fontWeight: 700 }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {section.items.map((item, iIdx) => {
                        const colonIdx = item.description.indexOf(':');
                        const title = colonIdx > -1 ? item.description.substring(0, colonIdx).trim() : item.description;
                        const body = colonIdx > -1 ? item.description.substring(colonIdx + 1).trim() : '';
                        return (
                            <tr key={item.id}>
                                <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{iIdx + 1}</td>
                                <td style={td}>
                                    <div style={{ fontWeight: 700, marginBottom: body ? 2 : 0 }}>{title}</div>
                                    {body && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: '#444' }}>{body}</div>}
                                </td>
                                <td style={{ ...td, textAlign: 'center' }}>{isNaN(item.qty) ? 0 : item.qty}</td>
                                <td style={{ ...td, textAlign: 'center' }}>{item.unit}</td>
                                <td style={{ ...td, textAlign: 'right' }}>{(isNaN(item.rate) ? 0 : item.rate).toLocaleString('en-IN')}</td>
                                <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(item.amount)}</td>
                            </tr>
                        );
                    })}
                    <tr><td style={{ ...td, height: 18 }} colSpan={6}></td></tr>
                    <tr style={{ background: '#f8f8f8' }}>
                        <td style={{ ...td, borderRight: 'none', textAlign: 'right', fontWeight: 700 }} colSpan={5}>TOTAL :</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{fmt(section.total)}</td>
                    </tr>
                </tbody>
            </table>
        </PrintPageContainer>
    );
};

// ─── Terms & Conditions ───────────────────────────────────────────────────────
const TermsPage: React.FC<{ quotation: Quotation; pageNo: number }> = ({ quotation, pageNo }) => {
    const tc = quotation.termsConfig;
    const payOpt = PAYMENT_OPTIONS[tc?.paymentOptionIndex ?? 0];
    
    return (
        <PrintPageContainer pageNo={pageNo} quotationNo={quotation.quotationNo}>
            <ProjectInfoHeader
                date={quotation.date}
                companyName={quotation.companyName}
                address={quotation.address}
                sub="Terms & Conditions"
            />

            <div style={{ border: '1px solid #000', padding: '15px' }}>
                {tc?.includeCommercialTC && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Commercial Terms & Conditions :-</div>
                        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>
                            {tc.commercialTerms.map((t, i) => <li key={i}>{t}</li>)}
                        </ol>
                    </div>
                )}

                {tc?.includeScopeOfWork && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Our Scope of Work :-</div>
                        <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{tc.scopeText}</div>
                    </div>
                )}

                {tc?.includePrice && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Price :-</div>
                        <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>{tc.priceText}</div>
                    </div>
                )}

                {tc?.includePriceEscalation && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Price Escalation :-</div>
                        <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>{tc.priceEscalationText}</div>
                    </div>
                )}

                {tc?.includePayment && payOpt && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Payment :-</div>
                        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>
                            {payOpt.tranches.map((t, i) => <li key={i}>{t}</li>)}
                        </ol>
                    </div>
                )}

                {tc?.includeCompletion && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Commencement of Work :-</div>
                        <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>{tc.completionText}</div>
                    </div>
                )}

                {tc?.includeValidity && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Validity :-</div>
                        <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>{tc.validityText}</div>
                    </div>
                )}

                {/* Additional T&C mapped directly below */}
                {tc?.includeGuarantee && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Guarantee :-</div>
                        <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>{tc.guaranteeText}</div>
                    </div>
                )}

                {tc?.includeForceМajeure && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>Force Majeure :-</div>
                        <div style={{ fontSize: 10.5, color: '#333', lineHeight: 1.7 }}>{tc.forceMajeureText}</div>
                    </div>
                )}

            </div>
            
            <div style={{ display: 'flex', border: '1px solid #000', borderTop: 'none' }}>
                <div style={{ width: '50%', padding: '15px' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textDecoration: 'underline', marginBottom: 4 }}>BANK DETAILS</div>
                    <div style={{ fontSize: 10.5, lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 700 }}>Rudra Fire Protection</div>
                        <div>Bank: State Bank Of India</div>
                        <div>Account Number : 40698757999</div>
                        <div>IFSC Code : SBIN0016719</div>
                    </div>
                </div>
                <div style={{ width: '50%', borderLeft: '1px solid #000', padding: '10px 15px', height: '110px', position: 'relative' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 50 }}>For, Rudra Fire Protection</div>
                    {quotation.printPages.includeSignature !== false && (
                        <div style={{ position: 'absolute', bottom: '45px', left: '25px', height: '38px', pointerEvents: 'none' }}>
                            <img src="/signature.png" alt="Signature" style={{ height: '100%', width: 'auto', mixBlendMode: 'multiply' }} />
                        </div>
                    )}
                    <div style={{ fontSize: 10, fontWeight: 800 }}>{quotation.preparedBy || 'Roshan Dixit'}</div>
                    <div style={{ fontSize: 10, fontWeight: 800 }}>Business Head</div>
                </div>
            </div>

        </PrintPageContainer>
    );
};

// ─── Approved Makes Page ──────────────────────────────────────────────────────
const ApprovedMakesPage: React.FC<{ quotation: Quotation; pageNo: number }> = ({ quotation, pageNo }) => (
    <PrintPageContainer pageNo={pageNo} quotationNo={quotation.quotationNo}>
        <ProjectInfoHeader
            date={quotation.date}
            companyName={quotation.companyName}
            address={quotation.address}
            sub="Approved Make Of List Offered By Us"
        />

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 0 }}>
            <thead>
                <tr style={{ background: '#e8e8e8' }}>
                    <th style={{ ...td, width: 36, textAlign: 'center', fontWeight: 'bold' }}>Sr.</th>
                    <th style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>Item</th>
                    <th style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>Make</th>
                </tr>
            </thead>
            <tbody>
                {quotation.approvedMakes.map((m, idx) => (
                    <tr key={m.id}>
                        <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{m.item}</td>
                        <td style={{ ...td, textAlign: 'center', fontWeight: 700, textTransform: 'uppercase' }}>{m.make}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <div style={{ border: '1px solid #000', padding: '10px 15px', height: '110px', width: '250px', position: 'relative' }}>
                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 50 }}>For, Rudra Fire Protection</div>
                {quotation.printPages.includeSignature !== false && (
                    <div style={{ position: 'absolute', bottom: '45px', left: '25px', height: '38px', pointerEvents: 'none' }}>
                        <img src="/signature.png" alt="Signature" style={{ height: '100%', width: 'auto', mixBlendMode: 'multiply' }} />
                    </div>
                )}
                <div style={{ fontSize: 10, fontWeight: 800 }}>{quotation.preparedBy || 'Roshan Dixit'}</div>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Business Head</div>
            </div>
        </div>
    </PrintPageContainer>
);

// ─── Main Print Preview ───────────────────────────────────────────────────────
const QuotationPreview: React.FC<Props> = ({ quotation, summary }) => {
    const pages = quotation.printPages ?? {
        coverLetter: true, summarySheet: true, boqPages: true,
        approvedMakes: true, termsConditions: true
    };
    let pageCounter = 1;

    return (
        <div className="print-preview" style={{ background: '#f5f5f5', padding: '2rem 0' }}>
            {/* PAGE 1: Cover Letter */}
            {pages.coverLetter && <CoverLetterPage quotation={quotation} />}

            {/* PAGE 2+: Summary Sheet */}
            {pages.summarySheet && (
                <SummarySheetPage quotation={quotation} summary={summary} pageNo={pageCounter++} />
            )}

            {/* Terms & Conditions */}
            {pages.termsConditions && (
                <TermsPage quotation={quotation} pageNo={pageCounter++} />
            )}

            {/* Approved Makes */}
            {pages.approvedMakes && quotation.approvedMakes.length > 0 && (
                <ApprovedMakesPage quotation={quotation} pageNo={pageCounter++} />
            )}

            {/* BOQ pages per section */}
            {pages.boqPages && quotation.sections.map((_, idx) => {
                const p = pageCounter++;
                return <BOQPage key={idx} quotation={quotation} sectionIdx={idx} pageNo={p} />;
            })}
        </div>
    );
};

export default QuotationPreview;
