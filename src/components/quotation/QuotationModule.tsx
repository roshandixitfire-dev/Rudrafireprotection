'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { fetchNextQuotationNumber } from '@/utils/documentVersioning';
import { Quotation, BOQSection as Section, ApprovedMake, TermsConfig, PrintPages } from './types';
import {
    calculateQuotationTotals, APPROVED_MAKE_LIST,
    SAMPLE_PROJECT_DATA, DEFAULT_TERMS_CONFIG, DEFAULT_PRINT_PAGES,
    PAYMENT_OPTIONS, DEFAULT_TERMS
} from './utils';
import BOQSectionComponent from './BOQSection';
import SectionSelector from './SectionSelector';
import QuotationPreview from './QuotationPreview';
import { useRouter, useSearchParams } from 'next/navigation';
import QuotationStickyHeader from './QuotationStickyHeader';
import './quotation.css';
import { checkClientExists, addClientToCRM, createLeadFromQuotation } from '@/utils/crmHelper';

const supabase = createClient();

const DESIGNATIONS = ['Developer', 'Project Manager', 'Site Incharge', 'Sales Manager', 'Architect', 'Consultant', 'Builder', 'Director', 'Managing Director', 'Partner'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildConfiguration = (c: any): string => {
    const parts: string[] = [];
    if (c.wings) parts.push(`${c.wings} Wing${parseInt(c.wings) > 1 ? 's' : ''}`);
    if (c.ground_floor) parts.push(`G+${c.floor_count || c.floors || ''}`);
    if (c.stilt) parts.push(`Stilt`);
    if (c.basement) parts.push(`${c.basement} Basement`);
    return parts.length ? parts.join(' + ') + (c.floor_count || c.floors ? ` Upper Floors` : '') : '';
};

const defaultQuotation = (makes?: ApprovedMake[]): Quotation => ({
    quotationNo: '',
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    companyName: '',
    address: '',
    mobile: '',
    email: '',
    designation: '',
    contactPerson: '',
    faxNo: '',
    phoneNo: '',
    projectName: '',
    projectLocation: '',
    subject: '',
    refNo: '',
    preparedBy: 'Roshan Dixit',
    validityDays: 30,
    gstPercentage: 18,
    configuration: '',
    coverLetterBody: '',
    sections: [],
    approvedMakes: makes || APPROVED_MAKE_LIST,
    termsConfig: { ...DEFAULT_TERMS_CONFIG },
    printPages: { ...DEFAULT_PRINT_PAGES },
    terms: DEFAULT_TERMS,
    paymentTerms: '',
    completionTime: '30-40 days',
});

// ─── CRM Client Search Component ──────────────────────────────────────────────
interface ClientSearchProps {
    value: string;
    onChange: (q: Partial<Quotation>) => void;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ value, onChange }) => {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => { setQuery(value); }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const search = useCallback(async (q: string) => {
        setQuery(q);
        if (q.length < 2) { setResults([]); setOpen(false); return; }
        setLoading(true);

        const [{ data: clients }, { data: leads }] = await Promise.all([
            supabase.from('clients').select('id,name,contact_name,contact_person,address,phone,email,developer_name,wings,floor_count,basement,stilt,district,state').ilike('name', `%${q}%`).limit(6),
            supabase.from('leads').select('id,project_name,developer,location,configuration,owner_name,finalizing_authority_name,finalizing_authority_number,site_incharge_name,site_incharge_number,wings,floors,basement,stilt,ground').ilike('project_name', `%${q}%`).limit(4),
        ]);

        const clientRows = (clients || []).map(c => ({ ...c, _type: 'client' }));
        const leadRows = (leads || []).map(l => ({ ...l, _type: 'lead' }));
        setResults([...clientRows, ...leadRows]);
        setOpen(true);
        setLoading(false);
    }, []);

    const selectResult = (r: any) => {
        if (r._type === 'client') {
            const addrParts = [r.address, r.district, r.state].filter(Boolean);
            onChange({
                companyName: r.name,
                clientName: r.contact_name || r.contact_person || '',
                contactPerson: r.contact_person || r.contact_name || '',
                address: addrParts.join('\n'),
                mobile: r.phone || '',
                email: r.email || '',
                configuration: buildConfiguration(r),
                projectName: r.name,
            });
        } else {
            onChange({
                companyName: r.developer || r.project_name || '',
                projectName: r.project_name || '',
                projectLocation: r.location || '',
                contactPerson: r.finalizing_authority_name || r.owner_name || '',
                clientName: r.finalizing_authority_name || r.owner_name || '',
                mobile: r.finalizing_authority_number || r.site_incharge_number || '',
                configuration: r.configuration || buildConfiguration(r),
            });
        }
        setQuery(r.name || r.project_name || '');
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <div className="relative">
                <input
                    className="form-input w-full pr-8"
                    value={query}
                    onChange={e => search(e.target.value)}
                    onFocus={() => query.length >= 2 && setOpen(true)}
                    placeholder="Type company or project name to search CRM..."
                />
                {loading && <span className="absolute right-2 top-2.5 text-xs text-gray-400 animate-pulse">⟳</span>}
                {!loading && query.length >= 2 && <span className="absolute right-2 top-2.5 text-xs text-gray-400">🔍</span>}
            </div>
            {open && results.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {results.map((r, i) => (
                        <button key={i} onClick={() => selectResult(r)}
                            className="w-full text-left px-3 py-2 hover:bg-red-50 border-b border-slate-100 last:border-0 transition">
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${r._type === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {r._type === 'client' ? 'CLIENT' : 'LEAD'}
                                </span>
                                <div>
                                    <div className="text-xs font-bold text-gray-800">{r.name || r.project_name}</div>
                                    {(r.developer || r.location) && (
                                        <div className="text-[10px] text-gray-500">{r.developer || ''} {r.location ? `• ${r.location}` : ''}</div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {open && results.length === 0 && query.length >= 2 && !loading && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 p-3 text-xs text-gray-400 text-center">
                    No matches in CRM. Fill manually below.
                </div>
            )}
        </div>
    );
};

// ─── Approved Makes Editor ─────────────────────────────────────────────────────
const ApprovedMakesEditor: React.FC<{
    makes: ApprovedMake[];
    onChange: (makes: ApprovedMake[]) => void;
}> = ({ makes, onChange }) => {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const update = (idx: number, field: 'item' | 'make', val: string) => {
        const updated = makes.map((m, i) => i === idx ? { ...m, [field]: val } : m);
        onChange(updated);
    };

    const addRow = () => onChange([...makes, { id: crypto.randomUUID(), item: '', make: '' }]);
    const removeRow = (idx: number) => onChange(makes.filter((_, i) => i !== idx));

    const setAsDefault = async () => {
        setSaving(true);
        await supabase.from('quotation_defaults').upsert({ key: 'approved_makes', value: makes as any, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        setSaving(false); setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="border border-slate-200 px-2 py-1.5 text-left font-bold text-slate-600 w-6">#</th>
                            <th className="border border-slate-200 px-2 py-1.5 text-left font-bold text-slate-600">Item</th>
                            <th className="border border-slate-200 px-2 py-1.5 text-left font-bold text-slate-600">Make / Brand</th>
                            <th className="border border-slate-200 px-2 py-1.5 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {makes.map((m, idx) => (
                            <tr key={m.id} className="hover:bg-slate-50">
                                <td className="border border-slate-200 px-2 py-0.5 text-center text-slate-400">{idx + 1}</td>
                                <td className="border border-slate-200 px-1 py-0.5">
                                    <input className="w-full text-xs border-0 bg-transparent focus:outline-none focus:bg-white focus:rounded px-1"
                                        value={m.item} onChange={e => update(idx, 'item', e.target.value)} />
                                </td>
                                <td className="border border-slate-200 px-1 py-0.5">
                                    <input className="w-full text-xs border-0 bg-transparent focus:outline-none focus:bg-white focus:rounded px-1 font-semibold"
                                        value={m.make} onChange={e => update(idx, 'make', e.target.value)} />
                                </td>
                                <td className="border border-slate-200 px-1 py-0.5 text-center">
                                    <button onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={addRow} className="text-xs px-3 py-1.5 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-700 transition">
                    + Add Row
                </button>
                <button onClick={setAsDefault} disabled={saving}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition border ${saved ? 'bg-green-100 text-green-700 border-green-300' : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'}`}>
                    {saving ? '⟳ Saving...' : saved ? '✓ Saved as Default!' : '⭐ Set as Default'}
                </button>
            </div>
        </div>
    );
};

// ─── Inline T&C Editor ─────────────────────────────────────────────────────────
const TermsEditor: React.FC<{ tc: TermsConfig; onChange: (tc: TermsConfig) => void }> = ({ tc, onChange }) => {
    const upd = (patch: Partial<TermsConfig>) => onChange({ ...tc, ...patch });

    const SectionBlock: React.FC<{
        field: keyof TermsConfig;
        label: string;
        children: React.ReactNode;
    }> = ({ field, label, children }) => {
        const enabled = tc[field] as boolean;
        return (
            <div className={`border rounded-lg overflow-hidden mb-2 transition-all ${enabled ? 'border-blue-200' : 'border-gray-200'}`}>
                <button
                    onClick={() => upd({ [field]: !enabled })}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition ${enabled ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                    <span className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-white border-white' : 'border-slate-400 bg-white'}`}>
                        {enabled && <span className="text-blue-600 text-xs font-black">✓</span>}
                    </span>
                    <span className="text-xs font-bold">{label}</span>
                    <span className="ml-auto text-xs opacity-70">{enabled ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {enabled && <div className="p-3 bg-white">{children}</div>}
            </div>
        );
    };

    const editableList = (items: string[], setItems: (v: string[]) => void) => (
        <div className="space-y-1.5">
            {items.map((t, i) => (
                <div key={i} className="flex gap-1.5 items-start">
                    <span className="text-[10px] text-slate-400 mt-1.5 flex-shrink-0">{i + 1}.</span>
                    <textarea className="flex-1 text-[11px] border border-slate-200 rounded px-2 py-1 resize-none focus:border-blue-400 focus:outline-none min-h-[36px]"
                        value={t} rows={2}
                        onChange={e => setItems(items.map((x, j) => j === i ? e.target.value : x))} />
                    <button onClick={() => setItems(items.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-xs mt-1 flex-shrink-0">✕</button>
                </div>
            ))}
            <button onClick={() => setItems([...items, ''])}
                className="text-xs text-blue-500 hover:text-blue-700 mt-1">+ Add point</button>
        </div>
    );

    return (
        <div className="space-y-1">
            <SectionBlock field="includeCommercialTC" label="Commercial Terms & Conditions">
                {editableList(tc.commercialTerms, v => upd({ commercialTerms: v }))}
            </SectionBlock>

            <SectionBlock field="includeScopeOfWork" label="Our Scope of Work">
                <textarea className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none resize-none"
                    rows={3} value={tc.scopeText}
                    onChange={e => upd({ scopeText: e.target.value })} />
            </SectionBlock>

            <SectionBlock field="includePrice" label="Price">
                <textarea className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none resize-none"
                    rows={2} value={tc.priceText}
                    onChange={e => upd({ priceText: e.target.value })} />
            </SectionBlock>

            <SectionBlock field="includePriceEscalation" label="Price Escalation">
                <textarea className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none resize-none"
                    rows={2} value={tc.priceEscalationText}
                    onChange={e => upd({ priceEscalationText: e.target.value })} />
            </SectionBlock>

            <SectionBlock field="includePayment" label="Payment">
                <div className="mb-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Choose Payment Split:</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {PAYMENT_OPTIONS.map((opt, idx) => (
                            <button key={idx} onClick={() => upd({ paymentOptionIndex: idx })}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition
                                    ${tc.paymentOptionIndex === idx ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-300 text-gray-600 hover:border-green-400'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-[10px] font-bold text-green-700 mb-1">Preview:</p>
                        <ol className="text-[10px] text-green-800 list-decimal ml-4 space-y-0.5">
                            {PAYMENT_OPTIONS[tc.paymentOptionIndex]?.tranches.map((t, i) => <li key={i}>{t}</li>)}
                        </ol>
                    </div>
                </div>
            </SectionBlock>

            <SectionBlock field="includeCompletion" label="Commencement of Work">
                <textarea className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none resize-none"
                    rows={2} value={tc.completionText}
                    onChange={e => upd({ completionText: e.target.value })} />
            </SectionBlock>

            <SectionBlock field="includeGuarantee" label="Guarantee">
                <textarea className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none resize-none"
                    rows={2} value={tc.guaranteeText}
                    onChange={e => upd({ guaranteeText: e.target.value })} />
            </SectionBlock>

            <SectionBlock field="includeForceМajeure" label="Force Majeure">
                <textarea className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none resize-none"
                    rows={2} value={tc.forceMajeureText}
                    onChange={e => upd({ forceMajeureText: e.target.value })} />
            </SectionBlock>

            <SectionBlock field="includeValidity" label="Validity">
                <textarea className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none resize-none"
                    rows={2} value={tc.validityText}
                    onChange={e => upd({ validityText: e.target.value })} />
            </SectionBlock>

            {/* CFO Ref */}
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">C.F.O. Ref No.</label>
                    <input className="form-input text-xs w-full" value={tc.cfoRefNo || ''}
                        onChange={e => upd({ cfoRefNo: e.target.value })} placeholder="P-xxxxx" />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">C.F.O. Date</label>
                    <input type="date" className="form-input text-xs w-full" value={tc.cfoDate || ''}
                        onChange={e => upd({ cfoDate: e.target.value })} />
                </div>
            </div>
        </div>
    );
};

// ─── Print Page Toggle ────────────────────────────────────────────────────────
const PageToggle: React.FC<{ pages: PrintPages; onChange: (p: PrintPages) => void }> = ({ pages, onChange }) => {
    const items: { key: keyof PrintPages; label: string; icon: string }[] = [
        { key: 'coverLetter', label: 'Cover Letter', icon: '📄' },
        { key: 'summarySheet', label: 'Summary Sheet', icon: '📊' },
        { key: 'termsConditions', label: 'Terms & Conditions', icon: '📜' },
        { key: 'approvedMakes', label: 'Approved Makes', icon: '✅' },
        { key: 'boqPages', label: 'BOQ Pages', icon: '📋' },
        { key: 'includeSignature', label: 'Include Signature', icon: '✍️' },
    ];
    return (
        <div className="flex flex-wrap gap-2">
            {items.map(item => (
                <button key={item.key}
                    onClick={() => onChange({ ...pages, [item.key]: !pages[item.key] })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition
                        ${pages[item.key] ? 'bg-red-600 text-white border-red-600 shadow' : 'bg-white text-gray-500 border-gray-300 hover:border-red-400'}`}>
                    <span>{item.icon}</span> {item.label}
                </button>
            ))}
        </div>
    );
};

// ─── Main QuotationModule ─────────────────────────────────────────────────────
const QuotationModule: React.FC<{ tabs?: React.ReactNode }> = ({ tabs }) => {
    const router = useRouter();
    const [quotation, setQuotation] = useState<Quotation>(defaultQuotation());
    const [selectorOpen, setSelectorOpen] = useState(true);
    const [makesSectionOpen, setMakesSectionOpen] = useState(false);
    const [tcSectionOpen, setTcSectionOpen] = useState(false);
    const [coverOpen, setCoverOpen] = useState(false);
    const [pagesOpen, setPagesOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [sectionsHistory, setSectionsHistory] = useState<Section[][]>([]); // undo stack
    const searchParams = useSearchParams();
    const quoteId = searchParams.get('id');

    const [clientExists, setClientExists] = useState(true);
    const [addToCRM, setAddToCRM] = useState(false);

    useEffect(() => {
        if (!quotation.companyName || quotation.companyName.trim().length < 2) {
            setClientExists(true);
            setAddToCRM(false);
            return;
        }
        const delayCheck = setTimeout(async () => {
            const exists = await checkClientExists(quotation.companyName);
            setClientExists(exists);
            if (exists) {
                setAddToCRM(false);
            }
        }, 500);
        return () => clearTimeout(delayCheck);
    }, [quotation.companyName]);

    const handleAddSections = (newSections: Section[]) => {
        setSectionsHistory(prev => [...prev, quotation.sections]); // save snapshot
        set({ sections: [...quotation.sections, ...newSections] });
    };

    const handleUndo = () => {
        if (sectionsHistory.length === 0) return;
        const prev = sectionsHistory[sectionsHistory.length - 1];
        set({ sections: prev });
        setSectionsHistory(h => h.slice(0, -1));
    };

    const set = (patch: Partial<Quotation>) => setQuotation(prev => ({ ...prev, ...patch }));
    const inp = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        set({ [e.target.name]: e.target.value } as any);

    // Auto-generate quotation no OR load from DB if id is present
    useEffect(() => {
        if (quoteId) {
            supabase.from('quotations').select('*').eq('id', quoteId).single()
                .then(({ data }) => {
                    if (data?.raw_json) {
                        setQuotation(data.raw_json as Quotation);
                    }
                });
        } else if (!quotation.quotationNo) {
            fetchNextQuotationNumber('professional').then(no => set({ quotationNo: no }));
        }
    }, [quoteId]);

    // Load default approved makes from DB
    useEffect(() => {
        if (!quoteId) {
            supabase.from('quotation_defaults').select('value').eq('key', 'approved_makes').single()
                .then(({ data }) => { if (data?.value) set({ approvedMakes: data.value as ApprovedMake[] }); });
        }
    }, [quoteId]);

    const totals = useMemo(() => calculateQuotationTotals(quotation.sections, quotation.gstPercentage), [quotation.sections, quotation.gstPercentage]);

    const saveToDatabase = async () => {
        setSaveStatus('saving');
        try {
            if (addToCRM && !clientExists && quotation.companyName.trim()) {
                await addClientToCRM({
                    name: quotation.companyName,
                    address: quotation.address,
                    area: quotation.projectLocation,
                    contact_person: quotation.contactPerson,
                    phone: quotation.mobile,
                    email: quotation.email,
                });
                setClientExists(true);
                setAddToCRM(false);
            }

            const payload = {
                quotation_number: quotation.quotationNo,
                quotation_date: quotation.date,
                ref_no: quotation.refNo,
                project_name: quotation.projectName,
                project_location: quotation.projectLocation,
                subject: quotation.subject,
                prepared_by: quotation.preparedBy,
                gst_percentage: quotation.gstPercentage,
                configuration: quotation.configuration,
                contact_person: quotation.contactPerson,
                designation: quotation.designation,
                cover_letter_body: quotation.coverLetterBody,
                validity_days: quotation.validityDays,
                sections_data: quotation.sections as any,
                approved_makes: quotation.approvedMakes as any,
                terms_config: quotation.termsConfig as any,
                print_pages: quotation.printPages as any,
                raw_json: quotation as any,
                subtotal: totals.subtotal,
                tax_total: totals.gstAmount,
                grand_total: totals.grandTotal,
                payment_terms: PAYMENT_OPTIONS[quotation.termsConfig?.paymentOptionIndex ?? 0]?.label,
                updated_at: new Date().toISOString(),
                status: 'Draft' as const,
                notes: quotation.subject,
            };
            let res, error;
            if (quoteId) {
                const { data: updateData, error: updateError } = await supabase.from('quotations')
                    .update(payload)
                    .eq('id', quoteId)
                    .select('id')
                    .single();
                res = updateData;
                error = updateError;
            } else {
                const { data: insertData, error: insertError } = await supabase.from('quotations')
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
                projectName: quotation.projectName || quotation.companyName,
                companyName: quotation.companyName,
                location: quotation.projectLocation || quotation.address,
                contactPerson: quotation.contactPerson,
                mobile: quotation.mobile,
                remarks: `Automatically created from Professional Quotation ${quotation.quotationNo}`,
            });

            setSaveStatus('saved');
            router.refresh();
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err: any) {
            console.error('Error saving quotation or creating lead:', err);
            alert(`Error saving quotation: ${err.message || 'Unknown error'}`);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const CollapseCard: React.FC<{
        title: string; icon: string; open: boolean; onToggle: () => void; badge?: string; children: React.ReactNode;
    }> = ({ title, icon, open, onToggle, badge, children }) => (
        <div className={`quotation-card no-print mb-4 transition-all overflow-hidden ${open ? '' : 'p-0'}`} style={open ? {} : { padding: 0 }}>
            <button onClick={onToggle}
                className={`w-full flex items-center justify-between px-5 py-3 transition ${open ? 'border-b border-slate-200 bg-slate-50' : 'bg-white hover:bg-slate-50 rounded-xl border border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="text-sm font-black text-slate-700">{title}</span>
                    {badge && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{badge}</span>}
                </div>
                <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="px-5 py-4">{children}</div>}
        </div>
    );

    return (
        <div className="quotation-container">

            <QuotationStickyHeader 
                actions={
                    <>
                        <button onClick={() => setQuotation(defaultQuotation())} style={{ padding: '7px 14px', background: '#fff', color: '#888', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                            🆕 New Quote
                        </button>
                        <button onClick={saveToDatabase} disabled={saveStatus === 'saving'} style={{ padding: '7px 16px', background: saveStatus === 'saved' ? '#16a34a' : saveStatus === 'error' ? '#dc2626' : '#1a73e8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Error – Retry' : '💾 Save'}
                        </button>
                        <button onClick={() => {
                            const originalTitle = document.title;
                            const sanitizedName = quotation.companyName ? quotation.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'project';
                            const safeQuoteNo = quotation.quotationNo ? quotation.quotationNo.replace(/[^a-z0-9]/gi, '_') : 'quote';
                            document.title = `${safeQuoteNo}_${sanitizedName}`;
                            window.print();
                            setTimeout(() => { document.title = originalTitle; }, 1000);
                        }} style={{ padding: '8px 18px', background: '#E3242B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            Preview / Print →
                        </button>
                    </>
                }
            />

            {/* ── TOP CARD: Master Details (compact) ── */}
            <div className="quotation-card no-print" style={{ padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>

                {/* CRM Search */}
                <div className="mb-3">
                    <label className="form-label mb-1 block">🔍 Search Client / Project (CRM)</label>
                    <ClientSearch value={quotation.companyName} onChange={patch => set(patch)} />
                </div>

                {/* Master form — 2 cols on mobile, 3 cols on sm+ */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
                    {/* Row 1 */}
                    <div>
                        <label className="form-label text-[10px]">Quotation No.</label>
                        <input className="form-input text-xs w-full py-1.5" name="quotationNo" value={quotation.quotationNo} onChange={inp} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Date</label>
                        <input type="date" className="form-input text-xs w-full py-1.5" name="date" value={quotation.date} onChange={inp} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Ref No.</label>
                        <input className="form-input text-xs w-full py-1.5" name="refNo" value={quotation.refNo} onChange={inp} placeholder="RFP/FFS/25-26/037" />
                    </div>

                    {/* Row 2 */}
                    <div>
                        <label className="form-label text-[10px]">Company / To</label>
                        <input className="form-input text-xs w-full py-1.5" name="companyName" value={quotation.companyName} onChange={inp} />
                        {!clientExists && quotation.companyName.trim().length >= 2 && (
                            <label className="flex items-center gap-1.5 mt-1 cursor-pointer select-none text-[10px] font-bold text-red-600 bg-red-50 p-1 px-2 rounded border border-red-200">
                                <input
                                    type="checkbox"
                                    checked={addToCRM}
                                    onChange={e => setAddToCRM(e.target.checked)}
                                    className="cursor-pointer"
                                />
                                ➕ Add to CRM?
                            </label>
                        )}
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Kind Attn. / Contact</label>
                        <input className="form-input text-xs w-full py-1.5" name="contactPerson" value={quotation.contactPerson} onChange={inp} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Designation</label>
                        <input list="designation-list" className="form-input text-xs w-full py-1.5" name="designation" value={quotation.designation} onChange={inp} placeholder="e.g. Developer" />
                        <datalist id="designation-list">
                            {DESIGNATIONS.map(d => <option key={d} value={d} />)}
                        </datalist>
                    </div>

                    {/* Row 3 */}
                    <div className="col-span-2">
                        <label className="form-label text-[10px]">Address</label>
                        <textarea className="form-input text-xs w-full py-1" name="address" value={quotation.address} onChange={inp} rows={2}
                            placeholder="Line 1&#10;Line 2&#10;City - Pincode" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div>
                            <label className="form-label text-[10px]">Mobile No.</label>
                            <input className="form-input text-xs w-full py-1.5" name="mobile" value={quotation.mobile} onChange={inp} />
                        </div>
                        <div>
                            <label className="form-label text-[10px]">Email I.D.</label>
                            <input className="form-input text-xs w-full py-1.5" name="email" value={quotation.email} onChange={inp} />
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="col-span-2">
                        <label className="form-label text-[10px]">Subject / Work Description</label>
                        <textarea className="form-input text-xs w-full py-1" name="subject" value={quotation.subject} onChange={inp} rows={2}
                            placeholder="Supplying, Installation, Testing & Commissioning of Fire Hydrant, Fire alarm & Sprinkler System..." />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Configuration</label>
                        <textarea className="form-input text-xs w-full py-1" name="configuration" value={quotation.configuration} onChange={inp} rows={2}
                            placeholder="Auto-filled from CRM or type here..." />
                    </div>

                    {/* Row 5 */}
                    <div>
                        <label className="form-label text-[10px]">Project Name</label>
                        <input className="form-input text-xs w-full py-1.5" name="projectName" value={quotation.projectName} onChange={inp} />
                    </div>
                    <div>
                        <label className="form-label text-[10px]">Project Location</label>
                        <input className="form-input text-xs w-full py-1.5" name="projectLocation" value={quotation.projectLocation} onChange={inp} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="form-label text-[10px]">GST %</label>
                            <input type="number" className="form-input text-xs w-full py-1.5" name="gstPercentage" value={quotation.gstPercentage} onChange={inp} />
                        </div>
                        <div>
                            <label className="form-label text-[10px]">Prepared By</label>
                            <input className="form-input text-xs w-full py-1.5" name="preparedBy" value={quotation.preparedBy} onChange={inp} />
                        </div>
                    </div>
                </div>

                {/* Print Pages toggle */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Pages to Print:</span>
                    </div>
                    <PageToggle pages={quotation.printPages} onChange={pp => set({ printPages: pp })} />
                </div>
            </div>

            {/* ── Cover Letter Panel ── */}
            <CollapseCard title="Cover Letter" icon="📄" open={coverOpen} onToggle={() => setCoverOpen(o => !o)}>
                <p className="text-xs text-slate-500 mb-2">Editable body text of the cover letter (Page 1). Leave blank to use default text.</p>
                <textarea className="form-input w-full text-xs" rows={10} name="coverLetterBody" value={quotation.coverLetterBody} onChange={inp}
                    placeholder={`With reference to above mentioned subject, we are submitting you our lowest & best offer for Fire Fighting work at your ${quotation.projectLocation || '[location]'} project.\n\nShould you require any further information relating to our offer, please do not hesitate to contact us, as we are open for negotiation.\n\nAssuring you our best services and sincere co-operation at all the time.`} />
            </CollapseCard>

            {/* ── Section Selector (Collapsible) ── */}
            <CollapseCard
                title="Section & Item Selector"
                icon="➕"
                open={selectorOpen}
                onToggle={() => setSelectorOpen(o => !o)}
                badge={quotation.sections.length > 0 ? `${quotation.sections.length} Section${quotation.sections.length > 1 ? 's' : ''} Added` : undefined}
            >
                <SectionSelector
                    onAddSections={handleAddSections}
                    existingSectionNames={quotation.sections.map(s => s.name)}
                />
            </CollapseCard>

            {/* ── BOQ Sections Editor ── */}
            {quotation.sections.length > 0 && (
                <div className="quotation-card no-print" style={{ padding: '1rem 1.5rem', marginBottom: '1rem' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">📋 BOQ Sections</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            {sectionsHistory.length > 0 && (
                                <button onClick={handleUndo}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition">
                                    ↩ Undo
                                </button>
                            )}
                            <span>Subtotal: <strong className="text-slate-800">₹{totals.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
                            <span>Total (incl. GST {quotation.gstPercentage}%): <strong className="text-red-600 text-sm">₹{totals.roundedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {quotation.sections.map(section => (
                            <BOQSectionComponent
                                key={section.id}
                                section={section}
                                onUpdate={(updated: Section) => set({ sections: quotation.sections.map(s => s.id === section.id ? updated : s) })}
                                onDelete={() => set({ sections: quotation.sections.filter(s => s.id !== section.id) })}
                            />
                        ))}
                    </div>
                    <button onClick={() => set({ sections: [...quotation.sections, { id: crypto.randomUUID(), name: 'New Section', items: [], total: 0 }] })}
                        className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition">
                        + Add Blank Section
                    </button>
                </div>
            )}

            {quotation.sections.length === 0 && (
                <div className="quotation-card no-print text-center py-8 text-gray-400 mb-4" style={{ padding: '2rem' }}>
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-bold">No Sections Added Yet</p>
                    <p className="text-xs mt-1">Use the Section Selector above ↑</p>
                </div>
            )}

            {/* ── Terms & Conditions ── */}
            <CollapseCard title="Terms & Conditions" icon="📜" open={tcSectionOpen} onToggle={() => setTcSectionOpen(o => !o)}>
                <TermsEditor tc={quotation.termsConfig} onChange={tc => set({ termsConfig: tc })} />
            </CollapseCard>

            {/* ── Approved Makes ── */}
            <CollapseCard title="Approved Makes List" icon="✅" open={makesSectionOpen} onToggle={() => setMakesSectionOpen(o => !o)}>
                <ApprovedMakesEditor makes={quotation.approvedMakes} onChange={m => set({ approvedMakes: m })} />
            </CollapseCard>

            {/* Print Preview — only shows in print */}
            <QuotationPreview quotation={quotation} summary={totals} />
        </div>
    );
};

export default QuotationModule;
