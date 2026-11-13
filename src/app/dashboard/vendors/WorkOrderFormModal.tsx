'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/utils/supabase/client';
import { 
    X, Plus, Trash2, Printer, Search, FileText, ArrowLeft, 
    CheckCircle2, Download, Building2, User, Phone, MapPin, 
    FileSpreadsheet, Sparkles, AlertCircle 
} from 'lucide-react';
import { ClientSearchInput, ClientRec } from '@/components/quotation/ClientSearchInput';
import { exportWorkOrderToDoc } from '@/utils/exportDoc';

export interface WorkOrderItem {
    id: string;
    item_no: string;
    title?: string;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total: number;
}

export interface WorkOrderData {
    id?: string;
    wo_number: string;
    wo_date: string;
    ref_quotation_no: string;
    quotation_id?: string;
    quotation_type?: 'legacy' | 'professional' | 'amc';
    
    // Client & Site
    client_name: string;
    contact_person: string;
    client_phone: string;
    client_email: string;
    client_gst: string;
    
    site_name: string;
    site_street: string;
    site_location: string;
    site_city: string;
    site_state: string;
    site_pin: string;
    
    vendor_id?: number | null;
    
    // Items & Pricing
    items: WorkOrderItem[];
    subtotal: number;
    tax_rate: number;
    tax_total: number;
    other_total: number;
    grand_total: number;
    
    // Terms & Instructions
    terms: string[];
    special_instructions: string;
    status: 'Draft' | 'Issued' | 'Accepted' | 'Completed';
    raw_json?: any;
}

interface WorkOrderFormModalProps {
    initialData?: any;
    vendors?: any[];
    onClose: (savedWO?: any) => void;
    useDb: boolean;
}

const supabase = createClient();

// Number to Words converter for Indian Currency
function numberToWordsINR(amount: number): string {
    const num = Math.round(amount);
    if (num === 0) return 'Zero Rupees Only';

    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
        if (n === 0) return '';
        if (n < 20) return a[n] + ' ';
        if (n < 100) return b[Math.floor(n / 10)] + ' ' + inWords(n % 10);
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
        if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
        return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
    };

    return 'Rupees ' + inWords(num).trim() + ' Only';
}

const defaultTerms = [
    'Scope of Work: Supply, installation, testing and commissioning shall be executed in accordance with approved fire safety specifications and standards.',
    'Warranty: All installed equipment and materials carry 12 months manufacturer guarantee from completion/handover date.',
    'Payment Terms: 50% mobilization advance along with confirmed Work Order, 40% on delivery of materials at site, and 10% after completion and testing.',
    'Completion Schedule: Work to be commenced immediately upon site clearance and finished within the agreed delivery timeline.',
    'Client Responsibilities: Uninterrupted electricity, water supply, and secure storage for equipment at site to be provided by client.',
    'Statutory Compliance: GST and applicable taxes billed extra as specified.'
];

export default function WorkOrderFormModal({ initialData, vendors = [], onClose, useDb }: WorkOrderFormModalProps) {
    const [woNumber, setWoNumber] = useState('');
    const [woDate, setWoDate] = useState(new Date().toISOString().split('T')[0]);
    const [refQuoteNo, setRefQuoteNo] = useState('');
    const [status, setStatus] = useState<'Draft' | 'Issued' | 'Accepted' | 'Completed'>('Draft');

    // Client & Site
    const [clientName, setClientName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientGst, setClientGst] = useState('');

    const [siteName, setSiteName] = useState('');
    const [siteStreet, setSiteStreet] = useState('');
    const [siteLocation, setSiteLocation] = useState('');
    const [siteCity, setSiteCity] = useState('Mumbai');
    const [siteState, setSiteState] = useState('Maharashtra');
    const [sitePin, setSitePin] = useState('');

    // Optional Contractor / Vendor
    const [selectedVendorId, setSelectedVendorId] = useState<number | ''>('');

    // Items
    const [items, setItems] = useState<WorkOrderItem[]>([
        { id: crypto.randomUUID(), item_no: '1', title: '', description: '', quantity: 1, unit: 'Nos', unit_price: 0, total: 0 }
    ]);

    // Financials
    const [taxRate, setTaxRate] = useState(18);
    const [otherCost, setOtherCost] = useState(0);
    const [isCustomSubtotal, setIsCustomSubtotal] = useState(false);
    const [customSubtotal, setCustomSubtotal] = useState<number | null>(null);

    // Terms
    const [terms, setTerms] = useState<string[]>(defaultTerms);
    const [newTermText, setNewTermText] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');

    const [showPreview, setShowPreview] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const [saving, setSaving] = useState(false);

        // Print Handler with smart title
    const handleTriggerPrint = () => {
        setShowPreview(true);
        setTimeout(() => {
            const originalTitle = document.title;
            const sanitizedName = clientName ? clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'client';
            const safeWoNo = woNumber ? woNumber.replace(/[^a-z0-9]/gi, '_') : 'work_order';
            document.title = `${safeWoNo}_${sanitizedName}`;
            window.print();
            setTimeout(() => { document.title = originalTitle; }, 1000);
        }, 150);
    };

    // Quotation Import Selector Modal
    const [showQuotePicker, setShowQuotePicker] = useState(false);
    const [fetchingQuote, setFetchingQuote] = useState(false);
    const [fetchNotification, setFetchNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [loadingQuotes, setLoadingQuotes] = useState(false);
    const [availableQuotes, setAvailableQuotes] = useState<any[]>([]);
    const [quoteSearch, setQuoteSearch] = useState('');

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            setWoNumber(initialData.wo_number || '');
            setWoDate(initialData.wo_date || new Date().toISOString().split('T')[0]);
            setRefQuoteNo(initialData.ref_quotation_no || '');
            setStatus(initialData.status || 'Draft');

            setClientName(initialData.client_name || '');
            setContactPerson(initialData.contact_person || '');
            setClientPhone(initialData.client_phone || '');
            setClientEmail(initialData.client_email || '');
            setClientGst(initialData.client_gst || '');

            setSiteName(initialData.site_name || '');
            setSiteStreet(initialData.site_street || '');
            setSiteLocation(initialData.site_location || '');
            setSiteCity(initialData.site_city || 'Mumbai');
            setSiteState(initialData.site_state || 'Maharashtra');
            setSitePin(initialData.site_pin || '');

            setSelectedVendorId(initialData.vendor_id || '');

            if (Array.isArray(initialData.items) && initialData.items.length > 0) {
                setItems(initialData.items);
            } else if (initialData.raw_json?.items) {
                setItems(initialData.raw_json.items);
            }

            setTaxRate(initialData.tax_rate !== undefined ? Number(initialData.tax_rate) : 18);
            setOtherCost(Number(initialData.other_total) || 0);

            if (initialData.raw_json?.isCustomSubtotal !== undefined) {
                setIsCustomSubtotal(Boolean(initialData.raw_json.isCustomSubtotal));
                setCustomSubtotal(initialData.raw_json.customSubtotal !== null ? Number(initialData.raw_json.customSubtotal) : null);
            } else if (initialData.subtotal !== undefined && initialData.subtotal !== null) {
                const itemsList = Array.isArray(initialData.items) ? initialData.items : (initialData.raw_json?.items || []);
                const itemsSum = itemsList.reduce((sum: number, it: any) => sum + (Number(it.total) || 0), 0);
                if (Number(initialData.subtotal) !== itemsSum && Number(initialData.subtotal) > 0) {
                    setIsCustomSubtotal(true);
                    setCustomSubtotal(Number(initialData.subtotal));
                }
            }

            if (initialData.terms && Array.isArray(initialData.terms)) {
                setTerms(initialData.terms);
            } else if (initialData.raw_json?.terms && Array.isArray(initialData.raw_json.terms)) {
                setTerms(initialData.raw_json.terms);
            }

            setSpecialInstructions(initialData.special_instructions || '');
        } else {
            // Generate next sequential WO number (e.g. WO/26-27/0001 or WO-XXXXXX)
            const rnd = Math.floor(1000 + Math.random() * 9000);
            const d = new Date();
            const yr = String(d.getFullYear()).slice(2);
            const nextYr = String(d.getFullYear() + 1).slice(2);
            setWoNumber(`WO/${yr}-${nextYr}/${rnd}`);
        }
    }, [initialData]);

    // Fetch quotes for quotation selector
    const loadQuotesForPicker = async () => {
        setShowQuotePicker(true);
        setLoadingQuotes(true);
        try {
            const list: any[] = [];

            // 1. Fetch Legacy quotes
            const { data: legacy } = await supabase
                .from('legacy_quotations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(40);
            if (legacy) {
                list.push(...legacy.map(q => ({
                    id: q.id,
                    type: 'legacy',
                    number: q.quote_no,
                    client: q.company_name,
                    date: q.quote_date,
                    amount: q.grand_total,
                    raw: q
                })));
            }

            // 2. Fetch Professional quotes
            const { data: pro } = await supabase
                .from('quotations')
                .select('*, clients(name)')
                .order('created_at', { ascending: false })
                .limit(40);
            if (pro) {
                list.push(...pro.map(q => ({
                    id: q.id,
                    type: 'professional',
                    number: q.quotation_number,
                    client: q.clients?.name || q.company_name || 'Client',
                    date: q.quotation_date,
                    amount: q.grand_total,
                    raw: q
                })));
            }

            // 3. Fetch AMC quotes
            const { data: amc } = await supabase
                .from('amc_quotations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            if (amc) {
                list.push(...amc.map(q => ({
                    id: q.id,
                    type: 'amc',
                    number: q.quotation_number,
                    client: q.company_name,
                    date: q.quotation_date,
                    amount: q.grand_total,
                    raw: q
                })));
            }

            // Also check localStorage
            try {
                const draft = localStorage.getItem('rudra-legacy-quote-draft');
                if (draft) {
                    const parsed = JSON.parse(draft);
                    if (parsed?.data?.quoteNo && !list.some(x => x.number === parsed.data.quoteNo)) {
                        list.unshift({
                            id: 'local-draft',
                            type: 'legacy',
                            number: parsed.data.quoteNo,
                            client: parsed.data.companyName || 'Draft Client',
                            date: parsed.data.date,
                            amount: parsed.data.items?.reduce((s: number, i: any) => s + (i.amount || 0), 0) || 0,
                            raw: { raw_json: parsed.data, ...parsed.data }
                        });
                    }
                }
            } catch (err) {
                console.warn('Could not read local draft:', err);
            }

            // Sort by date desc
            list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
            setAvailableQuotes(list);
        } catch (e: any) {
            console.error('Error fetching quotes for conversion:', e);
        } finally {
            setLoadingQuotes(false);
        }
    };

        // Direct Quotation Fetcher (by Quote # or client name)
    const handleDirectFetchQuote = async (searchTerm?: string) => {
        const term = (searchTerm !== undefined ? searchTerm : refQuoteNo || '').trim();
        if (!term) {
            loadQuotesForPicker();
            return;
        }

        setFetchingQuote(true);
        setFetchNotification(null);

        try {
            // A. Search in Legacy Quotations
            const { data: legacyQuotes, error: err1 } = await supabase
                .from('legacy_quotations')
                .select('*')
                .or(`quote_no.ilike.%${term}%,company_name.ilike.%${term}%`)
                .order('created_at', { ascending: false })
                .limit(1);

            if (legacyQuotes && legacyQuotes.length > 0) {
                const q = legacyQuotes[0];
                handleSelectQuoteToConvert({
                    id: q.id,
                    type: 'legacy',
                    number: q.quote_no,
                    client: q.company_name,
                    date: q.quote_date,
                    amount: q.grand_total,
                    raw: q
                });
                setFetchNotification({
                    type: 'success',
                    message: `✓ Found & Loaded Legacy Quotation "${q.quote_no}" for ${q.company_name || 'Client'}!`
                });
                return;
            }

            // B. Search in Professional Quotations
            const { data: proQuotes, error: err2 } = await supabase
                .from('quotations')
                .select('*, clients(name)')
                .ilike('quotation_number', `%${term}%`)
                .order('created_at', { ascending: false })
                .limit(1);

            if (proQuotes && proQuotes.length > 0) {
                const q = proQuotes[0];
                handleSelectQuoteToConvert({
                    id: q.id,
                    type: 'professional',
                    number: q.quotation_number,
                    client: q.clients?.name || q.company_name || 'Client',
                    date: q.quotation_date,
                    amount: q.grand_total,
                    raw: q
                });
                setFetchNotification({
                    type: 'success',
                    message: `✓ Found & Loaded Professional Quotation "${q.quotation_number}" for ${q.clients?.name || q.company_name || 'Client'}!`
                });
                return;
            }

            // C. Search in AMC Quotations
            const { data: amcQuotes, error: err3 } = await supabase
                .from('amc_quotations')
                .select('*')
                .or(`quotation_number.ilike.%${term}%,company_name.ilike.%${term}%`)
                .order('created_at', { ascending: false })
                .limit(1);

            if (amcQuotes && amcQuotes.length > 0) {
                const q = amcQuotes[0];
                handleSelectQuoteToConvert({
                    id: q.id,
                    type: 'amc',
                    number: q.quotation_number,
                    client: q.company_name,
                    date: q.quotation_date,
                    amount: q.grand_total,
                    raw: q
                });
                setFetchNotification({
                    type: 'success',
                    message: `✓ Found & Loaded AMC Quotation "${q.quotation_number}" for ${q.company_name || 'Client'}!`
                });
                return;
            }

            // D. Check localStorage for local draft
            try {
                const draft = localStorage.getItem('rudra-legacy-quote-draft');
                if (draft) {
                    const parsed = JSON.parse(draft);
                    if (parsed?.data?.quoteNo && parsed.data.quoteNo.toLowerCase().includes(term.toLowerCase())) {
                        handleSelectQuoteToConvert({
                            id: 'local-draft',
                            type: 'legacy',
                            number: parsed.data.quoteNo,
                            client: parsed.data.companyName || 'Draft Client',
                            date: parsed.data.date,
                            amount: parsed.data.items?.reduce((s: number, i: any) => s + (i.amount || 0), 0) || 0,
                            raw: { raw_json: parsed.data, ...parsed.data }
                        });
                        setFetchNotification({
                            type: 'success',
                            message: `✓ Found & Loaded Local Draft Quotation "${parsed.data.quoteNo}"!`
                        });
                        return;
                    }
                }
            } catch (_) {}

            // E. If not found directly, open picker with pre-filled search
            setQuoteSearch(term);
            loadQuotesForPicker();
            setFetchNotification({
                type: 'error',
                message: `No quotation exactly matching "${term}". Opened picker with all available quotes.`
            });
        } catch (e: any) {
            console.error('Error in direct quote fetch:', e);
            setQuoteSearch(term);
            loadQuotesForPicker();
        } finally {
            setFetchingQuote(false);
        }
    };

    // Convert Quotation to Work Order
    const handleSelectQuoteToConvert = (q: any) => {
        setRefQuoteNo(q.number);
        setClientName(q.client || '');

        let convertedItems: WorkOrderItem[] = [];
        let convertedTerms: string[] = [];
        let quoteTaxRate = 18;

        if (q.type === 'legacy') {
            const raw = q.raw?.raw_json || q.raw || {};
            setContactPerson(raw.toTitle || q.raw?.to_title || '');
            setSiteStreet(raw.street || q.raw?.street || '');
            setSiteLocation(raw.location || q.raw?.location || '');
            setSiteCity(raw.city || q.raw?.city || 'Mumbai');
            setSiteState(raw.state || q.raw?.state || 'Maharashtra');
            setSitePin(raw.pin || q.raw?.pin || '');

            if (raw.sgstPct !== undefined && raw.cgstPct !== undefined) {
                quoteTaxRate = Number(raw.sgstPct) + Number(raw.cgstPct);
            }

            if (Array.isArray(raw.items) && raw.items.length > 0) {
                convertedItems = raw.items.map((it: any, idx: number) => {
                    const desc = [it.title, it.description].filter(Boolean).join('\n');
                    return {
                        id: crypto.randomUUID(),
                        item_no: it.srNo || String(idx + 1),
                        title: it.title || '',
                        description: desc || it.title || '',
                        quantity: Number(it.qty) || 1,
                        unit: it.unit || 'Nos',
                        unit_price: Number(it.rate) || 0,
                        total: Number(it.amount) || ((Number(it.qty) || 1) * (Number(it.rate) || 0))
                    };
                });
            }

            if (Array.isArray(raw.termsItems) && raw.termsItems.length > 0) {
                convertedTerms = raw.termsItems;
            }
        } else if (q.type === 'professional') {
            const raw = q.raw?.raw_json || q.raw || {};
            setContactPerson(raw.contactPerson || q.raw?.contact_person || '');
            setClientPhone(raw.mobile || raw.phoneNo || '');
            setSiteName(raw.projectName || q.raw?.project_name || '');
            setSiteLocation(raw.projectLocation || q.raw?.project_location || '');
            setSiteStreet(raw.address || '');

            if (raw.gstPercentage !== undefined) {
                quoteTaxRate = Number(raw.gstPercentage);
            }

            const sections = raw.sections || q.raw?.sections_data || [];
            let itemCounter = 1;
            sections.forEach((sec: any) => {
                (sec.items || []).forEach((it: any) => {
                    convertedItems.push({
                        id: crypto.randomUUID(),
                        item_no: String(itemCounter++),
                        title: it.title || '',
                        description: [sec.name ? `[${sec.name}] ` + (it.title || '') : it.title, it.description].filter(Boolean).join('\n'),
                        quantity: Number(it.qty) || 1,
                        unit: it.unit || 'Nos',
                        unit_price: Number(it.rate) || 0,
                        total: (Number(it.qty) || 1) * (Number(it.rate) || 0)
                    });
                });
            });

            if (raw.termsConfig) {
                const tc = raw.termsConfig;
                convertedTerms = [
                    tc.scopeText,
                    tc.priceText,
                    tc.guaranteeText,
                    tc.completionText,
                    tc.validityText,
                    ...(Array.isArray(tc.commercialTerms) ? tc.commercialTerms : [])
                ].filter(Boolean);
            }
        } else if (q.type === 'amc') {
            const raw = q.raw || {};
            setContactPerson(raw.contact_person || '');
            setClientPhone(raw.contact_number || '');
            setSiteStreet(raw.address || '');

            if (Array.isArray(raw.items)) {
                convertedItems = raw.items.map((it: any, idx: number) => ({
                    id: crypto.randomUUID(),
                    item_no: String(idx + 1),
                    title: it.name || it.title || 'AMC Package',
                    description: it.description || it.name || '',
                    quantity: Number(it.qty) || 1,
                    unit: 'Year',
                    unit_price: Number(it.rate) || Number(it.price) || 0,
                    total: Number(it.total) || ((Number(it.qty) || 1) * (Number(it.rate) || 0))
                }));
            }

            if (Array.isArray(raw.terms)) {
                convertedTerms = raw.terms;
            }
        }

        if (convertedItems.length > 0) {
            setItems(convertedItems);
        }
        if (convertedTerms.length > 0) {
            setTerms(convertedTerms);
        }
        setTaxRate(quoteTaxRate);

        const quoteGrandTotal = Number(q.grandTotal) || Number(q.raw?.grand_total) || Number(q.raw?.totalAmount) || 0;
        const itemsSum = convertedItems.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
        if (itemsSum === 0 && quoteGrandTotal > 0) {
            setIsCustomSubtotal(true);
            setCustomSubtotal(quoteGrandTotal);
        } else {
            setIsCustomSubtotal(false);
            setCustomSubtotal(null);
        }

        setShowQuotePicker(false);
        setFetchNotification({
            type: 'success',
            message: `✓ Successfully converted Quotation ${q.number}! All client details, ${convertedItems.length} items, rates, and terms loaded.`
        });
    };

    // Item manipulation
    const handleItemChange = (itemId: string, field: keyof WorkOrderItem, value: any) => {
        setItems(prev => prev.map(it => {
            if (it.id === itemId) {
                const updated = { ...it, [field]: value };
                if (field === 'quantity' || field === 'unit_price') {
                    const q = field === 'quantity' ? parseFloat(value) || 0 : it.quantity;
                    const p = field === 'unit_price' ? parseFloat(value) || 0 : it.unit_price;
                    updated.total = q * p;
                }
                return updated;
            }
            return it;
        }));
    };

    const addItem = () => {
        setItems(prev => [
            ...prev,
            { id: crypto.randomUUID(), item_no: String(prev.length + 1), description: '', quantity: 1, unit: 'Nos', unit_price: 0, total: 0 }
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length <= 1) return;
        setItems(prev => prev.filter(it => it.id !== id));
    };

    // Terms manipulation
    const addTerm = () => {
        if (!newTermText.trim()) return;
        setTerms(prev => [...prev, newTermText.trim()]);
        setNewTermText('');
    };

    const removeTerm = (index: number) => {
        setTerms(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateTerm = (index: number, text: string) => {
        setTerms(prev => prev.map((t, i) => i === index ? text : t));
    };

    // Calculations
    const calculatedItemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    const subtotal = isCustomSubtotal && customSubtotal !== null ? customSubtotal : calculatedItemsSubtotal;
    const taxTotal = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxTotal + otherCost;

    // Save handler
    const handleSave = async () => {
        if (!clientName.trim()) {
            alert('Please enter or select a Client Name.');
            return;
        }
        if (!woNumber.trim()) {
            alert('Work Order Number is required.');
            return;
        }

        setSaving(true);
        try {
            const raw_json = {
                items,
                terms,
                taxRate,
                otherCost,
                isCustomSubtotal,
                customSubtotal
            };

            const payload: any = {
                wo_number: woNumber,
                wo_date: woDate,
                ref_quotation_no: refQuoteNo,
                client_name: clientName,
                contact_person: contactPerson,
                client_phone: clientPhone,
                client_email: clientEmail,
                client_gst: clientGst,
                site_name: siteName,
                site_street: siteStreet,
                site_location: siteLocation,
                site_city: siteCity,
                site_state: siteState,
                site_pin: sitePin,
                vendor_id: selectedVendorId ? Number(selectedVendorId) : null,
                subtotal,
                tax_rate: taxRate,
                tax_total: taxTotal,
                other_total: otherCost,
                grand_total: grandTotal,
                status,
                special_instructions: specialInstructions,
                raw_json
            };

            let savedRecord = null;

            if (useDb) {
                try {
                    let res, error;
                    if (initialData?.id) {
                        const updateRes = await supabase
                            .from('work_orders')
                            .update(payload)
                            .eq('id', initialData.id)
                            .select()
                            .single();
                        res = updateRes.data;
                        error = updateRes.error;
                    } else {
                        const insertRes = await supabase
                            .from('work_orders')
                            .insert(payload)
                            .select()
                            .single();
                        res = insertRes.data;
                        error = insertRes.error;
                    }

                    if (!error && res) {
                        savedRecord = res;
                    } else {
                        console.warn('Supabase work_orders table not available or error:', error?.message);
                    }
                } catch (dbErr) {
                    console.warn('Database save failed, using local storage:', dbErr);
                }
            }

            // Always update localStorage as well for offline reliability
            try {
                const localStr = localStorage.getItem('rudra-work-orders');
                const list: any[] = localStr ? JSON.parse(localStr) : [];
                const localObj = {
                    ...payload,
                    id: savedRecord?.id || initialData?.id || `wo-local-${Date.now()}`,
                    items,
                    terms,
                    created_at: new Date().toISOString()
                };

                const idx = list.findIndex(x => x.id === localObj.id || x.wo_number === localObj.wo_number);
                if (idx >= 0) {
                    list[idx] = localObj;
                } else {
                    list.unshift(localObj);
                }
                localStorage.setItem('rudra-work-orders', JSON.stringify(list));
                if (!savedRecord) savedRecord = localObj;
            } catch (err) {
                console.error('Failed to save to localStorage:', err);
            }

            alert(`Work Order ${woNumber} saved successfully!`);
            onClose(savedRecord);
        } catch (e: any) {
            alert('Failed to save Work Order: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    // Client select handler
    const onClientSelect = (c: ClientRec) => {
        setClientName(c.name);
        setContactPerson(c.contact_person || c.contact_name || '');
        setClientPhone(c.phone || '');
        setClientEmail(c.email || '');
        setSiteStreet(c.address || '');
        setSiteLocation(c.area || '');
        setSiteCity(c.district || 'Mumbai');
        setSiteState(c.state || 'Maharashtra');
        setSitePin(c.pincode || '');
    };

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <div id="work-order-portal-root" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 print:p-0 print:bg-white wo-print-backdrop">
            
            {/* Top Control Bar */}
            <div className="w-full max-w-5xl my-4 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:m-0 print:max-w-none wo-print-card">
                
                {/* Header Actions */}
                <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onClose()}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                            title="Close"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-400 text-base">{woNumber || 'NEW WORK ORDER'}</span>
                                {refQuoteNo && (
                                    <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                        Ref: {refQuoteNo}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400">Rudra Fire Protection Services • Work Order &amp; Scope Authorization</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Direct Choose from Quotation Button */}
                        <button
                            type="button"
                            onClick={loadQuotesForPicker}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
                            title="Open Quotation Picker"
                        >
                            <Sparkles className="w-4 h-4" /> Choose from Quotation
                        </button>

                        {/* Print / Preview Mode Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                        >
                            {showPreview ? '✏️ Edit Form' : '👁️ View / Print Preview'}
                        </button>

                        {/* Export to Word .doc */}
                        <button
                            type="button"
                            onClick={() => {
                                const woObj: WorkOrderData = {
                                    wo_number: woNumber,
                                    wo_date: woDate,
                                    ref_quotation_no: refQuoteNo,
                                    client_name: clientName,
                                    contact_person: contactPerson,
                                    client_phone: clientPhone,
                                    client_email: clientEmail,
                                    client_gst: clientGst,
                                    site_name: siteName,
                                    site_street: siteStreet,
                                    site_location: siteLocation,
                                    site_city: siteCity,
                                    site_state: siteState,
                                    site_pin: sitePin,
                                    items,
                                    subtotal,
                                    tax_rate: taxRate,
                                    tax_total: taxTotal,
                                    other_total: otherCost,
                                    grand_total: grandTotal,
                                    terms,
                                    special_instructions: specialInstructions,
                                    status
                                };
                                exportWorkOrderToDoc(woObj);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
                            title="Export to Microsoft Word"
                        >
                            <Download className="w-3.5 h-3.5" /> Word (.doc)
                        </button>

                        {/* Direct Print Button */}
                        <button
                            type="button"
                            onClick={handleTriggerPrint}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
                        >
                            <Printer className="w-4 h-4" /> Print / PDF
                        </button>

                        {/* Save Button */}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : '💾 Save'}
                        </button>

                        <button
                            onClick={() => onClose()}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ─── A4 PRINTABLE PREVIEW MODE (Multi-page Print Ready + Compact Spacing) ─── */}
                <div id="work-order-print-page" className={`${showPreview ? 'block' : 'hidden print:block'}`} style={{
                        width: '210mm', minHeight: '297mm', background: '#fff',
                        fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
                        margin: '0 auto', position: 'relative',
                        display: showPreview ? 'flex' : undefined,
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <style>{`
                            @media print {
                                @page {
                                    size: A4 portrait;
                                    margin: 0 !important;
                                }
                                html, body {
                                    width: 210mm !important;
                                    height: auto !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    background: #fff !important;
                                    overflow: visible !important;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }

                                /* Hide EVERYTHING in body except our portal root */
                                body > *:not(#work-order-portal-root) {
                                    display: none !important;
                                }

                                /* Zero out portal wrapper and modal card */
                                #work-order-portal-root {
                                    position: static !important;
                                    display: block !important;
                                    width: 210mm !important;
                                    min-height: auto !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    background: #fff !important;
                                    overflow: visible !important;
                                    border: none !important;
                                    box-shadow: none !important;
                                    backdrop-filter: none !important;
                                    -webkit-backdrop-filter: none !important;
                                }

                                .wo-print-card {
                                    position: static !important;
                                    display: block !important;
                                    width: 210mm !important;
                                    min-height: auto !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    background: #fff !important;
                                    overflow: visible !important;
                                    border: none !important;
                                    box-shadow: none !important;
                                    border-radius: 0 !important;
                                }

                                .no-print, .no-print * {
                                    display: none !important;
                                }

                                /* Work Order Page starts at (0,0) in normal block flow */
                                #work-order-print-page {
                                    position: static !important;
                                    display: block !important;
                                    width: 210mm !important;
                                    min-height: auto !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    background: #fff !important;
                                    overflow: visible !important;
                                    border: none !important;
                                    box-shadow: none !important;
                                }

                                table {
                                    border-collapse: collapse;
                                    width: 100%;
                                    border: none !important;
                                }
                                thead {
                                    display: table-header-group !important;
                                }
                                tfoot {
                                    display: table-footer-group !important;
                                }
                                .footer-spacer {
                                    height: 14mm !important;
                                }
                                .visual-footer {
                                    position: fixed !important;
                                    bottom: 0 !important;
                                    left: 0 !important;
                                    width: 100% !important;
                                    background: #fff !important;
                                    z-index: 100;
                                }

                                tr.boq-row {
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                }
                                .signature-table {
                                    page-break-inside: avoid !important;
                                    break-inside: avoid !important;
                                }

                                .watermark {
                                    position: fixed !important;
                                    top: 50% !important;
                                    left: 50% !important;
                                    transform: translate(-50%, -50%) !important;
                                    opacity: 0.05 !important;
                                    z-index: 0 !important;
                                    width: 80% !important;
                                    pointer-events: none !important;
                                    display: block !important;
                                }
                            }
                            @media screen {
                                #work-order-print-page { 
                                    box-shadow: 0 0 10px rgba(0,0,0,0.15); 
                                    position: relative;
                                    display: flex !important;
                                    flex-direction: column !important;
                                    justify-content: space-between !important;
                                    min-height: 297mm !important;
                                }
                                #work-order-print-page > table {
                                    flex: 1 0 auto;
                                }
                                #work-order-print-page .footer-spacer {
                                    height: 14mm;
                                }
                                #work-order-print-page .visual-footer {
                                    margin-top: auto !important;
                                    position: relative !important;
                                    width: 100% !important;
                                    background: #fff !important;
                                }
                                .watermark {
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    opacity: 0.06;
                                    z-index: 0;
                                    width: 70%;
                                    max-width: 500px;
                                    pointer-events: none;
                                    display: block !important;
                                }
                            }
                        `}</style>

                        {/* Watermark for Screen & Print */}
                        <div className="watermark">
                            <img src="/logo.png" alt="" style={{ width: '100%', height: 'auto' }} />
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                            <thead>
                                <tr>
                                    <td style={{ border: 'none', padding: 0 }}>
                                        {/* ─── HEADER (Repeats on every page) ─── */}
                                        <div style={{ position: 'relative', width: '100%', height: '140px', marginBottom: '0px' }}>
                                            {/* Pink Background with Zigzag Slant */}
                                            <div style={{
                                                position: 'absolute', left: 0, right: 0, width: '100%', height: '130px',
                                                background: '#FFF1F1',
                                                clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 45% 80%, 35% 100%, 0% 100%)',
                                                zIndex: 0
                                            }} />

                                            {/* Logo and Content Area */}
                                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 10mm 0 10mm', height: '100%' }}>
                                                <div style={{ textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '130px' }}>
                                                    <img src="/logo.png" alt="Logo" style={{ height: '130px', width: 'auto', display: 'block' }} />
                                                    <div style={{
                                                        position: 'absolute', bottom: '4px', left: '0', color: '#E3242B',
                                                        fontSize: '11px', fontWeight: '700', fontStyle: 'italic', whiteSpace: 'nowrap'
                                                    }}>
                                                        Fire Prevention Is Better Than Fire Fighting.
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', height: '130px', justifyContent: 'space-between' }}>
                                                    <div style={{ marginTop: '10px' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '0.5px' }}>RUDRA FIRE PROTECTION</div>
                                                        <div style={{ fontSize: '10px', color: '#444', marginTop: '1px' }}>GSTIN : 27CECPD2175P1Z9</div>
                                                        <div style={{ fontSize: '10px', color: '#444' }}>info@rudrafireprotection.com</div>
                                                    </div>
                                                    <div style={{ color: '#E3242B', fontSize: '22px', fontWeight: '700', fontFamily: 'Arial, sans-serif', marginRight: '-5mm', marginBottom: '-4px' }}>
                                                        WORK ORDER {woNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td style={{ border: 'none', padding: '0 8mm 0mm 8mm' }}>
                                        <div style={{ marginTop: 6 }}>
                                            {/* Date and Ref Quotation bar */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
                                                <div style={{ fontSize: '10.5px', color: '#4b5563' }}>
                                                    {refQuoteNo ? (
                                                        <span><strong>Ref Quotation:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1d4ed8' }}>{refQuoteNo}</span></span>
                                                    ) : (
                                                        <span><strong>Ref Quotation:</strong> <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Direct Work Order</span></span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '10.5px', color: '#111827', textAlign: 'right' }}>
                                                    Date : <strong>{woDate ? woDate.split('-').reverse().join('-') : '-'}</strong>
                                                </div>
                                            </div>

                                            {/* Issued By (Client) and Issued To (Rudra Fire Protection) */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px', fontSize: '11px', lineHeight: 1.4 }}>
                                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', background: '#fafafa' }}>
                                                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '9.5px', color: '#E3242B', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '4px', letterSpacing: '0.5px' }}>
                                                        ISSUED BY (CLIENT)
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>{clientName || 'Client / Company Name'}</div>
                                                    {contactPerson && <div style={{ color: '#475569' }}>Attn: {contactPerson}</div>}
                                                    <div style={{ color: '#475569' }}>{[siteStreet, siteLocation].filter(Boolean).join(', ')}</div>
                                                    <div style={{ color: '#475569' }}>{[siteCity, siteState].filter(Boolean).join(', ')} {sitePin ? `- ${sitePin}` : ''}</div>
                                                    {clientPhone && <div style={{ color: '#475569', marginTop: '1px' }}>Phone: {clientPhone}</div>}
                                                    {clientGst && <div style={{ color: '#475569', fontFamily: 'monospace', marginTop: '1px' }}>GSTIN: {clientGst}</div>}
                                                </div>

                                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 10px', background: '#fafafa' }}>
                                                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '9.5px', color: '#E3242B', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '4px', letterSpacing: '0.5px' }}>
                                                        ISSUED TO (CONTRACTOR)
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>RUDRA FIRE PROTECTION SERVICES</div>
                                                    <div style={{ color: '#475569' }}>17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West</div>
                                                    <div style={{ color: '#475569' }}>Mumbai, Maharashtra - 400104</div>
                                                    <div style={{ color: '#475569', marginTop: '1px' }}>Phone: 7777088817 / 9769388165</div>
                                                    <div style={{ color: '#475569', fontFamily: 'monospace', marginTop: '1px' }}>GSTIN: 27CECPD2175P1Z9</div>
                                                    {(siteName || siteLocation) && (
                                                        <div style={{ marginTop: '3px', paddingTop: '2px', borderTop: '1px dashed #cbd5e1', fontSize: '10px', color: '#334155' }}>
                                                            <strong>Project Site:</strong> {[siteName, siteLocation, siteCity].filter(Boolean).join(', ')}
                                                        </div>
                                                    )}
                                                    {specialInstructions && (
                                                        <div style={{ color: '#92400e', background: '#fef3c7', padding: '2px 5px', borderRadius: '3px', marginTop: '3px', fontSize: '9.5px', border: '1px solid #fde68a' }}>
                                                            <strong>Note:</strong> {specialInstructions}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Subtitle / Intro */}
                                            <div style={{ textAlign: 'center', fontSize: '9.5px', fontStyle: 'italic', marginBottom: 6, color: '#444' }}>
                                                Schedule of Quantities (BOQ), Specifications &amp; Approved Commercial Terms
                                            </div>

                                            {/* Schedule of Quantities (BOQ) */}
                                            <div style={{ marginBottom: '8px' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10.5px' }}>
                                                    <thead>
                                                        <tr style={{ background: '#f1f5f9' }}>
                                                            <th style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', width: '28px' }}>#</th>
                                                            <th style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Item &amp; Description of Work</th>
                                                            <th style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', width: '40px' }}>Qty</th>
                                                            <th style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', width: '40px' }}>Unit</th>
                                                            <th style={{ border: '1px solid #000', padding: '4px 5px', textAlign: 'right', width: '70px' }}>Rate (₹)</th>
                                                            <th style={{ border: '1px solid #000', padding: '4px 5px', textAlign: 'right', width: '80px' }}>Amount (₹)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {items.map((it, idx) => (
                                                            <tr key={it.id} className="boq-row" style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                                <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', fontFamily: 'monospace' }}>{it.item_no || idx + 1}</td>
                                                                <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                                                                    {it.title && <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{it.title}</div>}
                                                                    <div style={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.3, fontSize: '10px' }}>{it.description}</div>
                                                                </td>
                                                                <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', fontWeight: 'bold' }}>{it.quantity}</td>
                                                                <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', color: '#475569' }}>{it.unit || 'Nos'}</td>
                                                                <td style={{ border: '1px solid #000', padding: '4px 5px', textAlign: 'right', fontFamily: 'monospace' }}>₹{it.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                                <td style={{ border: '1px solid #000', padding: '4px 5px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>₹{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colSpan={5} style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 'bold' }}>SUBTOTAL:</td>
                                                            <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                                <span className="hidden print:inline">
                                                                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                                <span className="inline-flex items-center justify-end gap-1 print:hidden">
                                                                    <span>₹</span>
                                                                    <input
                                                                        type="number"
                                                                        step="any"
                                                                        value={isCustomSubtotal ? (customSubtotal ?? '') : (subtotal > 0 ? subtotal : '')}
                                                                        onChange={e => {
                                                                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                                            setIsCustomSubtotal(true);
                                                                            setCustomSubtotal(val);
                                                                        }}
                                                                        placeholder="0.00"
                                                                        className="w-24 text-right font-mono font-bold text-[10.5px] p-0.5 border border-dashed border-slate-400 hover:border-blue-500 focus:border-blue-600 rounded bg-amber-50/70 focus:bg-white focus:outline-none transition"
                                                                        title="Direct Subtotal: Click to put amount directly"
                                                                    />
                                                                    {isCustomSubtotal && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setIsCustomSubtotal(false);
                                                                                setCustomSubtotal(null);
                                                                            }}
                                                                            className="text-[9px] text-blue-600 hover:text-blue-800 ml-0.5 underline font-sans"
                                                                            title="Reset to calculate automatically from items"
                                                                        >
                                                                            ↻
                                                                        </button>
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={5} style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 'bold' }}>GST ({taxRate}%):</td>
                                                            <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                        {otherCost > 0 && (
                                                            <tr>
                                                                <td colSpan={5} style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontWeight: 'bold' }}>OTHER / FREIGHT:</td>
                                                                <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'right', fontFamily: 'monospace' }}>₹{otherCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            </tr>
                                                        )}
                                                        <tr style={{ background: '#fee2e2' }}>
                                                            <td colSpan={5} style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right', fontWeight: 'bold', color: '#991b1b', fontSize: '11px' }}>GRAND TOTAL:</td>
                                                            <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#991b1b', fontSize: '11px' }}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            {/* Total Amount in Words */}
                                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '5px', padding: '3px 8px', background: '#fafafa', marginBottom: '5px', fontSize: '10px' }}>
                                                <strong style={{ color: '#475569', textTransform: 'uppercase', fontSize: '9.5px' }}>Total Amount in Words: </strong>
                                                <span style={{ fontWeight: 'bold', color: '#0f172a', fontStyle: 'italic' }}>{numberToWordsINR(grandTotal)}</span>
                                            </div>

                                            {/* Terms & Conditions */}
                                            {terms.length > 0 && (
                                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px 8px', background: '#fff', marginBottom: '5px', fontSize: '9.5px' }}>
                                                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '9.5px', color: '#0f172a', textDecoration: 'underline', marginBottom: '4px' }}>
                                                        Commercial Terms &amp; Conditions:
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        {terms.map((t, i) => {
                                                            const cleanText = t.replace(/^\d+[\.\)\-]\s*/, '');
                                                            return (
                                                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#334155', lineHeight: 1.35 }}>
                                                                    <span style={{ fontWeight: 'bold', color: '#0f172a', minWidth: '16px', flexShrink: 0, textAlign: 'right' }}>{i + 1}.</span>
                                                                    <span style={{ flex: 1, whiteSpace: 'pre-line' }}>{cleanText}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* ─── DUAL ACCEPTANCE & STAMP BOXES (BORDERLESS & COMPACT) ─── */}
                                            <table className="signature-table" style={{ width: '100%', border: 'none', borderCollapse: 'collapse', marginTop: '6px', pageBreakInside: 'avoid' }}>
                                                <tbody>
                                                    {/* Row 1: Clean Headers */}
                                                    <tr>
                                                        <td style={{ width: '50%', border: 'none', padding: '0 12px 2px 0', verticalAlign: 'bottom' }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', color: '#0f172a' }}>
                                                                For {clientName || 'Client Name'}
                                                            </div>
                                                        </td>
                                                        <td style={{ width: '50%', border: 'none', padding: '0 0 2px 12px', verticalAlign: 'bottom' }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', color: '#0f172a' }}>
                                                                For Rudra Fire Protection Services
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Row 2: Stamp & Signature Image Area (Compact 24px) */}
                                                    <tr>
                                                        <td style={{ width: '50%', border: 'none', padding: '0 12px 0 0', verticalAlign: 'bottom', height: '26px' }}>
                                                            <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '9px', color: '#94a3b8', fontStyle: 'italic' }}>(Client Official Stamp &amp; Sign)</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ width: '50%', border: 'none', padding: '0 0 0 12px', verticalAlign: 'bottom', height: '26px' }}>
                                                            <div style={{ height: '24px', display: 'flex', alignItems: 'flex-end' }}>
                                                                <img src="/signature.png" alt="Signature" style={{ height: '24px', width: 'auto', mixBlendMode: 'multiply' }} />
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Row 3: Parallel Signature Lines & Signatory Information (100% Horizontal Alignment) */}
                                                    <tr>
                                                        <td style={{ width: '50%', border: 'none', padding: '0 12px 0 0', verticalAlign: 'top' }}>
                                                            <div style={{ borderTop: '1.5px solid #334155', paddingTop: '3px', fontSize: '10px', fontWeight: 'bold', color: '#0f172a' }}>
                                                                Authorized Signatory with Official Stamp
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                                                                <span>Name: ______________________</span>
                                                                <span>Date: __________________</span>
                                                            </div>
                                                        </td>

                                                        <td style={{ width: '50%', border: 'none', padding: '0 0 0 12px', verticalAlign: 'top' }}>
                                                            <div style={{ borderTop: '1.5px solid #334155', paddingTop: '3px', fontSize: '10px', fontWeight: 'bold', color: '#0f172a' }}>
                                                                Authorized Signatory &amp; Stamp
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                                                                <span>Date: {woDate ? woDate.split('-').reverse().join('-') : '-'}</span>
                                                                <span>Place: Mumbai</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

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

                        {/* ─── VISUAL FOOTER (Fixed at absolute bottom of page) ─── */}
                        <div className="visual-footer" style={{ padding: '6px 10mm 10px 10mm', borderTop: '1px solid #999', background: '#fff', marginTop: 'auto', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '9.5px', color: '#374151' }}>
                                <div>17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104 ☎ 7777088817</div>
                                <div style={{ color: '#6b7280' }}>www.rudrafireprotection.com</div>
                            </div>
                        </div>

                    </div>

                {/* ─── INTERACTIVE FORM EDITOR ─── */}
                <div className={`${showPreview ? 'hidden' : 'block'} no-print p-6 bg-slate-50 max-h-[82vh] overflow-y-auto space-y-5`}>
                        
                        {/* Notification banner on direct fetch */}
                        {fetchNotification && (
                            <div className={`rounded-xl p-3.5 text-xs flex items-center justify-between ${
                                fetchNotification.type === 'success' ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'bg-amber-50 border border-amber-300 text-amber-800'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {fetchNotification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                                    <span className="font-medium">{fetchNotification.message}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFetchNotification(null)}
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Top Direct Quotation Fetch Banner */}
                        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 border border-amber-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                                    <Sparkles className="w-5 h-5 text-amber-100" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                        ⚡ Fetch Quotation Directly
                                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">Instant Auto-Fill</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Auto-fill client details, site address, all BOQ line items, rates, taxes, and terms from any quotation.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={loadQuotesForPicker}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> Choose from Quotation List
                                </button>
                            </div>
                        </div>

                        {/* Active Converted Quotation Badge */}
                        {refQuoteNo && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3 text-xs flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>
                                        Connected to Quotation <strong>{refQuoteNo}</strong> for <strong>{clientName || 'Client'}</strong> ({items.length} items loaded).
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={loadQuotesForPicker}
                                    className="text-blue-700 hover:text-blue-900 font-bold underline ml-2"
                                >
                                    Change / Select Another
                                </button>
                            </div>
                        )}

                        {/* Section 1: WO Meta */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                                📋 Work Order Metadata
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Work Order # *</label>
                                    <input
                                        type="text"
                                        value={woNumber}
                                        onChange={e => setWoNumber(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                                        placeholder="WO/26-27/xxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Work Order Date *</label>
                                    <input
                                        type="date"
                                        value={woDate}
                                        onChange={e => setWoDate(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg text-slate-800"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[11px] font-bold text-slate-700">Reference Quotation #</label>
                                        <button
                                            type="button"
                                            onClick={loadQuotesForPicker}
                                            className="text-amber-600 hover:text-amber-800 text-[10.5px] font-bold flex items-center gap-1"
                                            title="Browse all quotations"
                                        >
                                            <Sparkles className="w-3 h-3 text-amber-500" /> Browse
                                        </button>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={refQuoteNo}
                                                onChange={e => setRefQuoteNo(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleDirectFetchQuote(refQuoteNo);
                                                    }
                                                }}
                                                className="form-input text-xs w-full py-2 pl-3 pr-7 border border-slate-200 rounded-lg font-mono text-blue-700 font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="e.g. 00056 or RFP/26-27/00056"
                                            />
                                            {refQuoteNo && (
                                                <button
                                                    type="button"
                                                    onClick={() => setRefQuoteNo('')}
                                                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                                                    title="Clear"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDirectFetchQuote(refQuoteNo)}
                                            disabled={fetchingQuote}
                                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shrink-0"
                                            title="Type quote number and click to fetch directly"
                                        >
                                            {fetchingQuote ? (
                                                <>
                                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Fetching...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                                    Fetch
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Type quote number &amp; press <strong>Enter</strong> or click <strong>Fetch</strong> to auto-fill.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value as any)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg font-bold"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Issued">Issued</option>
                                        <option value="Accepted">Accepted by Client</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Client & Project Info */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                                    🏢 Client & Site Details
                                </h2>
                                <div className="w-72">
                                    <ClientSearchInput
                                        value={clientName}
                                        onChange={v => setClientName(v)}
                                        onSelect={onClientSelect}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Client / Company Name *</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg font-bold"
                                        placeholder="e.g. AZAD NAGAR STADIUM VIEW CHS LTD"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Contact Person</label>
                                    <input
                                        type="text"
                                        value={contactPerson}
                                        onChange={e => setContactPerson(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg"
                                        placeholder="e.g. Hon. Chairman / Secretary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={clientPhone}
                                        onChange={e => setClientPhone(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg"
                                        placeholder="e.g. 98200XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={clientEmail}
                                        onChange={e => setClientEmail(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg"
                                        placeholder="e.g. client@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Client GSTIN</label>
                                    <input
                                        type="text"
                                        value={clientGst}
                                        onChange={e => setClientGst(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg font-mono uppercase"
                                        placeholder="27XXXXX0000X1ZX"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Site / Street Address</label>
                                    <input
                                        type="text"
                                        value={siteStreet}
                                        onChange={e => setSiteStreet(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg"
                                        placeholder="Plot No, Street, Building"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Location / Area</label>
                                    <input
                                        type="text"
                                        value={siteLocation}
                                        onChange={e => setSiteLocation(e.target.value)}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg"
                                        placeholder="e.g. Andheri West"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">City & PIN</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={siteCity}
                                            onChange={e => setSiteCity(e.target.value)}
                                            className="form-input text-xs w-2/3 py-2 px-2 border border-slate-200 rounded-lg"
                                            placeholder="Mumbai"
                                        />
                                        <input
                                            type="text"
                                            value={sitePin}
                                            onChange={e => setSitePin(e.target.value)}
                                            className="form-input text-xs w-1/3 py-2 px-2 border border-slate-200 rounded-lg font-mono"
                                            placeholder="400053"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: BOQ / Items Table */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                                        📦 Scope of Work & BOQ Line Items ({items.length})
                                    </h2>
                                    <p className="text-[11px] text-slate-400">Add or edit equipment, quantities, rates and descriptions.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Row
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <th className="py-2.5 px-2 text-center w-12">#</th>
                                            <th className="py-2.5 px-2 text-left">Description of Item / Work</th>
                                            <th className="py-2.5 px-2 text-center w-20">Qty</th>
                                            <th className="py-2.5 px-2 text-center w-20">Unit</th>
                                            <th className="py-2.5 px-2 text-right w-28">Rate (₹)</th>
                                            <th className="py-2.5 px-2 text-right w-28">Total (₹)</th>
                                            <th className="py-2.5 px-2 text-center w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((it, idx) => (
                                            <tr key={it.id} className="hover:bg-slate-50/50">
                                                <td className="p-2 text-center">
                                                    <input
                                                        type="text"
                                                        value={it.item_no}
                                                        onChange={e => handleItemChange(it.id, 'item_no', e.target.value)}
                                                        className="form-input text-xs w-full text-center py-1 border border-slate-200 rounded font-mono"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <textarea
                                                        rows={2}
                                                        value={it.description}
                                                        onChange={e => handleItemChange(it.id, 'description', e.target.value)}
                                                        className="form-input text-xs w-full py-1.5 px-2 border border-slate-200 rounded resize-y"
                                                        placeholder="Item details, brand, model, specifications..."
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={it.quantity}
                                                        onChange={e => handleItemChange(it.id, 'quantity', e.target.value)}
                                                        className="form-input text-xs w-full text-center py-1 border border-slate-200 rounded font-bold"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={it.unit}
                                                        onChange={e => handleItemChange(it.id, 'unit', e.target.value)}
                                                        className="form-input text-xs w-full text-center py-1 border border-slate-200 rounded"
                                                        placeholder="Nos"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={it.unit_price}
                                                        onChange={e => handleItemChange(it.id, 'unit_price', e.target.value)}
                                                        className="form-input text-xs w-full text-right py-1 border border-slate-200 rounded font-mono"
                                                    />
                                                </td>
                                                <td className="p-2 text-right font-mono font-bold text-slate-800">
                                                    ₹{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(it.id)}
                                                        className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                                                        title="Delete row"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals & Tax */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Special Site Instructions / Notes</label>
                                    <textarea
                                        rows={3}
                                        value={specialInstructions}
                                        onChange={e => setSpecialInstructions(e.target.value)}
                                        className="form-input text-xs w-full py-1.5 px-2 border border-slate-200 rounded-lg"
                                        placeholder="Work timings, entry permits, security guidelines, handover remarks..."
                                    />
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                                    <div className="flex justify-between items-center gap-4 text-slate-700">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold">Subtotal:</span>
                                            {isCustomSubtotal && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomSubtotal(false);
                                                        setCustomSubtotal(null);
                                                    }}
                                                    className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-medium"
                                                    title="Auto-calculate from items list"
                                                >
                                                    ↻ Auto-calc
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono text-xs text-slate-500 font-bold">₹</span>
                                            <input
                                                type="number"
                                                step="any"
                                                value={isCustomSubtotal ? (customSubtotal ?? '') : (subtotal > 0 ? subtotal : '')}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                    setIsCustomSubtotal(true);
                                                    setCustomSubtotal(val);
                                                }}
                                                placeholder="0.00"
                                                className="form-input text-xs w-32 py-1 px-2 text-right border border-slate-300 rounded font-mono font-bold text-slate-900 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                title="Enter subtotal amount directly"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span>GST Rate:</span>
                                            <input
                                                type="number"
                                                value={taxRate}
                                                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                                className="form-input text-xs w-16 py-0.5 px-1.5 text-center border border-slate-300 rounded font-bold"
                                            />
                                            <span>%</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-700">₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span>Other / Transport Charges:</span>
                                        <input
                                            type="number"
                                            value={otherCost}
                                            onChange={e => setOtherCost(parseFloat(e.target.value) || 0)}
                                            className="form-input text-xs w-24 py-0.5 px-1.5 text-right border border-slate-300 rounded font-mono"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                                        <span>Grand Total:</span>
                                        <span className="font-mono text-emerald-700">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic mt-1">{numberToWordsINR(grandTotal)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Terms & Conditions */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                                    ⚖️ Terms & Conditions ({terms.length})
                                </h2>
                                <span className="text-[10px] text-slate-400">
                                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600">Shift + Enter</kbd> for line break
                                </span>
                            </div>

                            <ul className="space-y-2 text-xs">
                                {terms.map((t, idx) => (
                                    <li key={idx} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100 group hover:border-slate-300 transition">
                                        <div className="flex items-start gap-2 flex-1">
                                            <strong className="text-slate-900 min-w-[20px] pt-1 font-mono">{idx + 1}.</strong>
                                            <textarea
                                                rows={Math.max(1, t.split('\n').length)}
                                                value={t}
                                                onChange={e => handleUpdateTerm(idx, e.target.value)}
                                                className="w-full bg-transparent border-0 p-1 text-xs text-slate-700 leading-relaxed focus:bg-white focus:ring-1 focus:ring-blue-400 rounded resize-y font-sans"
                                                placeholder="Term text..."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeTerm(idx)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1 mt-1"
                                            title="Remove term"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-2 space-y-1.5">
                                <div className="flex gap-2">
                                    <textarea
                                        rows={2}
                                        value={newTermText}
                                        onChange={e => setNewTermText(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                if (e.shiftKey) {
                                                    // Shift + Enter: allow native new line insertion
                                                    return;
                                                }
                                                // Enter without Shift: add the term line
                                                e.preventDefault();
                                                addTerm();
                                            }
                                        }}
                                        className="form-input text-xs flex-1 py-2 px-3 border border-slate-200 rounded-lg resize-y focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Add custom term or warranty requirement... (Shift+Enter for new line, Enter to add)"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTerm}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition self-start flex items-center gap-1.5 shadow-sm"
                                        title="Add Term (Enter)"
                                    >
                                        + Add Term
                                    </button>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Tip: Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600">Shift + Enter</kbd> to add a new line inside the term. Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600">Enter</kbd> to add as a term line.
                                </div>
                            </div>
                        </div>

                    </div>
            </div>

            {/* ─── QUOTATION IMPORT MODAL (SELECT QUOTE & CONVERT) ─── */}
            {showQuotePicker && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Choose Quotation to Convert into Work Order
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Select any quotation to auto-fill client information, line items, rates, taxes, and terms.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowQuotePicker(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={quoteSearch}
                                onChange={e => setQuoteSearch(e.target.value)}
                                placeholder="Search by Quotation Number or Client Name..."
                                className="form-input text-xs w-full py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        {/* Quotes list */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                            {loadingQuotes ? (
                                <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
                                    Loading quotations from database...
                                </div>
                            ) : availableQuotes.filter(q => 
                                q.number?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
                                q.client?.toLowerCase().includes(quoteSearch.toLowerCase())
                            ).length > 0 ? (
                                availableQuotes.filter(q => 
                                    q.number?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
                                    q.client?.toLowerCase().includes(quoteSearch.toLowerCase())
                                ).map(q => (
                                    <div key={q.id + q.number} className="p-3.5 hover:bg-amber-50/50 transition flex items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-sm text-slate-900">{q.number}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                    q.type === 'legacy' ? 'bg-red-100 text-red-700' :
                                                    q.type === 'professional' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {q.type} Quote
                                                </span>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-700 mt-1">{q.client}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Date: {q.date || '-'} • Amount: ₹{Number(q.amount || 0).toLocaleString('en-IN')}</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleSelectQuoteToConvert(q)}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0"
                                        >
                                            Convert →
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    No quotations found matching your search.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}
