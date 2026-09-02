'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Plus, Trash2, Printer, Search } from 'lucide-react';
import { ClientSearchInput, ClientRec } from '@/components/quotation/ClientSearchInput';

interface POItem {
    id: string;
    item_no: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface PurchaseOrderFormModalProps {
    initialData?: any;
    vendors: any[];
    onClose: (savedPO?: any) => void;
    useDb: boolean;
}

const supabase = createClient();

const defaultCompanyHeader = {
    name: 'Rudra Fire Protection Services',
    address: 'Shop No. 5, Plot No. 18, Sector 20, Kamothe',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pin: '410209',
    phone: '+91 97693 88165',
    email: 'info@rudrafire.com',
    website: 'www.rudrafire.com'
};

const defaultShipTo = {
    name: 'Site Supervisor',
    company: 'Rudra Fire Site Office',
    street: 'Plot No. 4, Sector 12',
    location: 'Kharghar',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pin: '410210',
    phone: '+91 98214 55301'
};

export default function PurchaseOrderFormModal({ initialData, vendors, onClose, useDb }: PurchaseOrderFormModalProps) {
    const [poNumber, setPoNumber] = useState('');
    const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [vendorQuery, setVendorQuery] = useState('');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const vendorSearchRef = useRef<HTMLDivElement>(null);

    const [requisitioner, setRequisitioner] = useState('');
    const [shipVia, setShipVia] = useState('');
    const [fob, setFob] = useState('');
    const [shippingTerms, setShippingTerms] = useState('');

    const [shipTo, setShipTo] = useState(defaultShipTo);
    const [items, setItems] = useState<POItem[]>([
        { id: crypto.randomUUID(), item_no: '', description: '', quantity: 1, unit_price: 0, total: 0 }
    ]);

    const [taxRate, setTaxRate] = useState(18); // Default 18% GST
    const [shippingCost, setShippingCost] = useState(0);
    const [otherCost, setOtherCost] = useState(0);
    const [comments, setComments] = useState('');
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [clientSearchQuery, setClientSearchQuery] = useState('');

    const onClientSelect = (c: ClientRec) => {
        setClientSearchQuery(c.name);
        setShipTo({
            name: c.contact_person || c.contact_name || 'Site Supervisor',
            company: c.name,
            street: c.address || '',
            location: c.area || '',
            city: c.district || '',
            state: c.state || 'Maharashtra',
            pin: c.pincode || '',
            phone: c.phone || ''
        });
    };

    const applyFontSize = (size: string) => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (range.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = size;
                span.innerHTML = '&#8203;'; // zero-width space
                range.insertNode(span);
                range.setStartAfter(span);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                const span = document.createElement('span');
                span.style.fontSize = size;
                span.appendChild(range.extractContents());
                range.insertNode(span);
            }
        }
    };

    // Initial load
    useEffect(() => {
        if (initialData) {
            setPoNumber(initialData.po_number || '');
            setPoDate(initialData.po_date || '');
            
            const vendor = vendors.find(v => Number(v.id) === Number(initialData.vendor_id)) || initialData.vendor;
            if (vendor) {
                setSelectedVendor(vendor);
                setVendorQuery(vendor.name);
            }
            
            setRequisitioner(initialData.requisitioner || '');
            setShipVia(initialData.ship_via || '');
            setFob(initialData.fob || '');
            setShippingTerms(initialData.shipping_terms || '');
            
            setShipTo({
                name: initialData.ship_to_name || '',
                company: initialData.ship_to_company || '',
                street: initialData.ship_to_street || '',
                location: initialData.ship_to_location || '',
                city: initialData.ship_to_city || '',
                state: initialData.ship_to_state || 'Maharashtra',
                pin: initialData.ship_to_pin || '',
                phone: initialData.ship_to_phone || ''
            });

            if (initialData.raw_json && Array.isArray(initialData.raw_json.items)) {
                setItems(initialData.raw_json.items);
            } else if (Array.isArray(initialData.items)) {
                setItems(initialData.items.map((it: any) => ({
                    id: it.id || crypto.randomUUID(),
                    item_no: it.item_no || '',
                    description: it.description || '',
                    quantity: Number(it.quantity) || 0,
                    unit_price: Number(it.unit_price) || 0,
                    total: Number(it.total_price) || 0
                })));
            }

            setTaxRate(initialData.raw_json?.taxRate !== undefined ? initialData.raw_json.taxRate : 18);
            setShippingCost(Number(initialData.shipping_total) || 0);
            setOtherCost(Number(initialData.other_total) || 0);
            setComments(initialData.comments || '');
        } else {
            // Auto generate PO Number
            const rnd = Math.floor(100000 + Math.random() * 900000);
            setPoNumber(`PO-${rnd}`);
        }
    }, [initialData, vendors]);

    // Handle clicks outside vendor dropdown
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (vendorSearchRef.current && !vendorSearchRef.current.contains(e.target as Node)) {
                setShowVendorDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const filteredVendors = vendorQuery
        ? vendors.filter(v => v.name.toLowerCase().includes(vendorQuery.toLowerCase()))
        : vendors;

    const selectVendor = (vendor: any) => {
        setSelectedVendor(vendor);
        setVendorQuery(vendor.name);
        setShowVendorDropdown(false);
    };

    const handleItemChange = (itemId: string, field: keyof POItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'unit_price') {
                    const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
                    const price = field === 'unit_price' ? parseFloat(value) || 0 : item.unit_price;
                    updated.total = qty * price;
                }
                return updated;
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems(prev => [...prev, { id: crypto.randomUUID(), item_no: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
    };

    const removeItem = (itemId: string) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter(item => item.id !== itemId));
    };

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount + shippingCost + otherCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor) {
            alert('Please select a Vendor.');
            return;
        }
        if (!poNumber.trim()) {
            alert('PO Number is required.');
            return;
        }

        setSaving(true);
        try {
            const raw_json = {
                items,
                taxRate,
                shippingCost,
                otherCost
            };

            const payload = {
                po_number: poNumber,
                vendor_id: selectedVendor.id,
                po_date: poDate,
                requisitioner,
                ship_via: shipVia,
                fob,
                shipping_terms: shippingTerms,
                ship_to_name: shipTo.name,
                ship_to_company: shipTo.company,
                ship_to_street: shipTo.street,
                ship_to_location: shipTo.location,
                ship_to_city: shipTo.city,
                ship_to_state: shipTo.state,
                ship_to_pin: shipTo.pin,
                ship_to_phone: shipTo.phone,
                subtotal,
                tax_total: taxAmount,
                shipping_total: shippingCost,
                other_total: otherCost,
                grand_total: grandTotal,
                status: initialData?.status || 'Draft',
                comments,
                raw_json
            };

            if (useDb) {
                let savedId = initialData?.id;
                let res, error;

                if (savedId) {
                    // Update main PO
                    const { data, error: err } = await supabase
                        .from('purchase_orders')
                        .update(payload)
                        .eq('id', savedId)
                        .select()
                        .single();
                    res = data;
                    error = err;
                } else {
                    // Insert main PO
                    const { data, error: err } = await supabase
                        .from('purchase_orders')
                        .insert(payload)
                        .select()
                        .single();
                    res = data;
                    error = err;
                }

                if (error) {
                    // Self healing duplicate key
                    if (error.code === '23505') {
                        const { data: existing } = await supabase
                            .from('purchase_orders')
                            .select('id')
                            .eq('po_number', payload.po_number)
                            .single();
                        if (existing?.id) {
                            const { data: retryRes, error: retryErr } = await supabase
                                .from('purchase_orders')
                                .update(payload)
                                .eq('id', existing.id)
                                .select()
                                .single();
                            res = retryRes;
                            error = retryErr;
                        }
                    } else {
                        throw error;
                    }
                }

                if (error) throw error;

                // Sync line items in database
                if (res?.id) {
                    // Clear old items
                    await supabase.from('purchase_order_items').delete().eq('purchase_order_id', res.id);

                    // Insert new items
                    const itemsPayload = items.map((it, idx) => ({
                        purchase_order_id: res.id,
                        item_no: it.item_no || null,
                        description: it.description,
                        quantity: it.quantity,
                        unit_price: it.unit_price,
                        total_price: it.total,
                        sort_order: idx
                    }));
                    await supabase.from('purchase_order_items').insert(itemsPayload);
                }

                onClose(res);
            } else {
                // Local Storage Fallback
                const localPOsStr = localStorage.getItem('rudra-local-pos') || '[]';
                const localPOs = JSON.parse(localPOsStr);

                let savedRecord: any;
                const completeRecord = {
                    ...payload,
                    vendor: selectedVendor,
                    id: initialData?.id || crypto.randomUUID(),
                    created_at: initialData?.created_at || new Date().toISOString()
                };

                if (initialData?.id) {
                    savedRecord = completeRecord;
                    const updated = localPOs.map((p: any) => p.id === initialData.id ? savedRecord : p);
                    localStorage.setItem('rudra-local-pos', JSON.stringify(updated));
                } else {
                    savedRecord = completeRecord;
                    localPOs.push(savedRecord);
                    localStorage.setItem('rudra-local-pos', JSON.stringify(localPOs));
                }

                onClose(savedRecord);
            }
        } catch (error: any) {
            console.error('Error saving PO:', error);
            alert('Failed to save Purchase Order: ' + (error.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const triggerPrint = () => {
        const originalTitle = document.title;
        document.title = `${poNumber}_PO_${selectedVendor?.name || 'Supplier'}`;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden">
            {/* Action Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center no-print">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-800">
                        📋 {initialData ? `Edit PO: ${poNumber}` : 'Create Purchase Order'}
                    </h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${useDb ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {useDb ? 'DATABASE SYNC' : 'LOCAL OFFLINE'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold hover:bg-slate-50 transition">
                        {showPreview ? '✏️ Edit Details' : '👁️ GimBooks Preview'}
                    </button>
                    <button onClick={triggerPrint} disabled={!selectedVendor} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-1.5">
                        <Printer className="w-4 h-4" /> Print PO
                    </button>
                    <button onClick={handleSubmit} disabled={saving || !selectedVendor} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                        {saving ? 'Saving...' : '💾 Save PO'}
                    </button>
                    <button onClick={() => onClose()} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto">
                {/* ─── PRINT PREVIEW MODE (Rudra Corporate Letterhead + Watermark + GimBooks Table Layout) ─── */}
                <div id="po-print-page" className={`${showPreview ? 'block' : 'hidden print:block'} max-w-[800px] mx-auto my-6 bg-white shadow-lg border border-slate-200 print:shadow-none print:border-none print:my-0`} style={{
                    width: '210mm', minHeight: '297mm', background: '#fff',
                    fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
                    position: 'relative'
                }}>
                    <style>{`
                        @media print {
                            @page { size: A4 portrait; margin: 0 !important; }
                            html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; }
                            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #fff !important; }
                            body * { visibility: hidden; }
                            #po-print-page, #po-print-page * { visibility: visible; }
                            #po-print-page {
                                position: absolute !important; left: 0 !important; top: 0 !important;
                                width: 210mm !important; min-height: auto !important;
                                margin: 0 !important; padding: 0 !important; border: none !important;
                                box-shadow: none !important; background: #fff !important;
                            }
                            table { border-collapse: collapse; width: 100%; border: none !important; }
                            thead { display: table-header-group; }
                            tfoot { display: table-footer-group; }
                            .footer-spacer { height: 10mm; }
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
                            #po-print-page { 
                                box-shadow: 0 0 10px rgba(0,0,0,0.15); 
                                position: relative;
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
                                    {/* ─── HEADER (Repeats on every page) ─── */}
                                    <div style={{ position: 'relative', width: '100%', height: '125px', marginBottom: '0px' }}>
                                        {/* Pink Background with Zigzag Slant */}
                                        <div style={{
                                            position: 'absolute', left: 0, right: 0, width: '100%', height: '115px',
                                            background: '#FFF1F1',
                                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 45% 80%, 35% 100%, 0% 100%)',
                                            zIndex: 0
                                        }} />

                                        {/* Logo and Content Area */}
                                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 10mm 0 10mm', height: '100%' }}>
                                            <div style={{ textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '115px' }}>
                                                <img src="/logo.png" alt="Logo" style={{ height: '110px', width: 'auto', display: 'block' }} />
                                                <div style={{
                                                    position: 'absolute', bottom: '2px', left: '0', color: '#E3242B',
                                                    fontSize: '10px', fontWeight: '700', fontStyle: 'italic', whiteSpace: 'nowrap'
                                                }}>
                                                    Fire Prevention Is Better Than Fire Fighting.
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', height: '115px', justifyContent: 'space-between' }}>
                                                <div style={{ marginTop: '8px' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '0.5px' }}>RUDRA FIRE PROTECTION</div>
                                                    <div style={{ fontSize: '9px', color: '#444', marginTop: '1px' }}>GSTIN : 27CECPD2175P1Z9</div>
                                                    <div style={{ fontSize: '9px', color: '#444' }}>info@rudrafireprotection.com</div>
                                                </div>
                                                <div style={{ color: '#E3242B', fontSize: '18px', fontWeight: '700', fontFamily: 'Arial, sans-serif', marginRight: '-5mm', marginBottom: '-5px', textTransform: 'uppercase' }}>
                                                    PURCHASE ORDER
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td style={{ border: 'none', padding: '0 10mm 0mm 10mm' }}>
                                    {/* PO Meta Info */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '8px', fontSize: '10px', borderBottom: '1px solid #eee', paddingBottom: '4px', marginTop: '4px' }}>
                                        <div><span style={{ fontWeight: 'bold', color: '#666' }}>DATE:</span> {poDate.split('-').reverse().join('-')}</div>
                                        <div><span style={{ fontWeight: 'bold', color: '#666' }}>PO #:</span> <span style={{ fontWeight: 'bold', color: '#E3242B' }}>{poNumber}</span></div>
                                    </div>

                                    {/* VENDOR & SHIP TO */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                                        {/* Vendor details */}
                                        <div>
                                            <div style={{ backgroundColor: '#EC5E63', color: '#fff', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', marginBottom: '4px', borderRadius: '4px 4px 0 0' }}>
                                                VENDOR
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#333', lineHeight: '1.4', paddingLeft: '4px' }}>
                                                {selectedVendor ? (
                                                    <>
                                                        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '11px' }}>{selectedVendor.name}</div>
                                                        {selectedVendor.contact_person && <div style={{ fontWeight: '600', color: '#666' }}>Attn: {selectedVendor.contact_person}</div>}
                                                        <div>{[selectedVendor.street, selectedVendor.location].filter(Boolean).join(', ')}</div>
                                                        <div>{[selectedVendor.city, selectedVendor.state, selectedVendor.pin].filter(Boolean).join(', ')}</div>
                                                        {selectedVendor.phone && <div>Phone: {selectedVendor.phone}</div>}
                                                    </>
                                                ) : (
                                                    <div style={{ color: '#999', fontStyle: 'italic' }}>No vendor selected.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Ship to details */}
                                        <div>
                                            <div style={{ backgroundColor: '#EC5E63', color: '#fff', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', marginBottom: '4px', borderRadius: '4px 4px 0 0' }}>
                                                SHIP TO
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#333', lineHeight: '1.4', paddingLeft: '4px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#000', fontSize: '11px' }}>{shipTo.name}</div>
                                                <div style={{ fontWeight: '600', color: '#555' }}>{shipTo.company}</div>
                                                <div>{shipTo.street} {shipTo.location ? `, ${shipTo.location}` : ''}</div>
                                                <div>{shipTo.city}, {shipTo.state} - {shipTo.pin}</div>
                                                {shipTo.phone && <div>Phone: {shipTo.phone}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Grid Info */}
                                    <div style={{ marginBottom: '8px' }}>
                                        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#EC5E63', color: '#fff', fontWeight: 'bold' }}>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'center', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REQUISITIONER</th>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'center', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SHIP VIA</th>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'center', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>F.O.B.</th>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'center', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SHIPPING TERMS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ color: '#333', textAlign: 'center', fontWeight: '600', backgroundColor: '#f9f9f9' }}>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 6px' }}>{requisitioner || '-'}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 6px' }}>{shipVia || '-'}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 6px' }}>{fob || '-'}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 6px' }}>{shippingTerms || '-'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Items Table */}
                                    <div style={{ marginBottom: '10px' }}>
                                        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#EC5E63', color: '#fff', fontWeight: 'bold' }}>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'left', width: '75px', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEM #</th>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'left', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION</th>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'center', width: '45px', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>QTY</th>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'right', width: '80px', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UNIT PRICE</th>
                                                    <th style={{ border: '1px solid #ddd', padding: '3px 6px', textAlign: 'right', width: '90px', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, idx) => (
                                                    <tr key={item.id} style={{ color: '#333', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                        <td style={{ border: '1px solid #ddd', padding: '4px 6px', fontFamily: 'monospace', fontSize: '9px' }}>{item.item_no || '-'}</td>
                                                        <td 
                                                            style={{ border: '1px solid #ddd', padding: '4px 6px', fontWeight: '500', wordBreak: 'break-word', fontSize: '9.5px', lineHeight: '1.3' }}
                                                            dangerouslySetInnerHTML={{ __html: item.description || 'No description' }}
                                                        />
                                                        <td style={{ border: '1px solid #ddd', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                                                        <td style={{ border: '1px solid #ddd', padding: '4px 6px', textAlign: 'right', fontFamily: 'monospace' }}>₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td style={{ border: '1px solid #ddd', padding: '4px 6px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                                {/* Fill spacing to make A4 height uniform, only if very few items */}
                                                {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, i) => (
                                                    <tr key={i} style={{ height: '22px', color: 'transparent', userSelect: 'none' }}>
                                                        <td style={{ border: '1px solid #ddd', padding: '3px 6px' }}></td>
                                                        <td style={{ border: '1px solid #ddd', padding: '3px 6px' }}></td>
                                                        <td style={{ border: '1px solid #ddd', padding: '3px 6px' }}></td>
                                                        <td style={{ border: '1px solid #ddd', padding: '3px 6px' }}></td>
                                                        <td style={{ border: '1px solid #ddd', padding: '3px 6px' }}></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Comments & Summary */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '15px', alignItems: 'start' }}>
                                        {/* Comments */}
                                        <div>
                                            <div style={{ backgroundColor: '#EC5E63', color: '#fff', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 6px', marginBottom: '4px', borderRadius: '3px 3px 0 0', display: 'inline-block' }}>
                                                Comments or Special Instructions
                                            </div>
                                            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '6px 8px', fontSize: '10px', color: '#555', backgroundColor: '#fafafa', minHeight: '55px', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>
                                                {comments || 'No special instructions.'}
                                            </div>
                                        </div>

                                        {/* Summary Totals */}
                                        <div style={{ fontSize: '10px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', fontSize: '8px' }}>SUBTOTAL</td>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', fontSize: '8px' }}>TAX ({taxRate}%)</td>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', fontSize: '8px' }}>SHIPPING</td>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>₹{shippingCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', fontSize: '8px' }}>OTHER</td>
                                                        <td style={{ paddingTop: '3px', paddingBottom: '3px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>₹{otherCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                    <tr style={{ backgroundColor: '#facc15', color: '#000', fontWeight: 'bold' }}>
                                                        <td style={{ padding: '5px 8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '9px' }}>TOTAL</td>
                                                        <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '11px' }}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
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

                    {/* Visual Footer (repeats at absolute bottom of page) */}
                    <div className="visual-footer" style={{ padding: '10px 10mm 15px 10mm', borderTop: '1px solid #999' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '9px', color: '#555' }}>
                            <div>17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104 ☎ 7777088817</div>
                            <div style={{ color: '#999' }}>Page 1 / 1</div>
                        </div>
                        <div style={{ fontSize: '9px', color: '#555', marginTop: '3px' }}>www.rudrafireprotection.com</div>
                    </div>
                </div>

                {/* ─── INTERACTIVE EDITOR MODE ─── */}
                <div className={`${showPreview ? 'hidden' : 'block print:hidden'} max-w-5xl mx-auto my-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-200/80`}>
                    <form onSubmit={e => e.preventDefault()} className="space-y-6">
                        {/* ROW 1: PO Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date</label>
                                <input type="date" value={poDate} onChange={e => setPoDate(e.target.value)}
                                    className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">PO Number</label>
                                <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)}
                                    placeholder="PO-xxxxxx" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            {/* Vendor search dropdown */}
                            <div ref={vendorSearchRef} className="relative">
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Search Vendor *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={vendorQuery}
                                        onChange={e => { setVendorQuery(e.target.value); setShowVendorDropdown(true); }}
                                        onFocus={() => setShowVendorDropdown(true)}
                                        placeholder="Type vendor name to search..."
                                        className="form-input text-xs w-full py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                </div>
                                {showVendorDropdown && filteredVendors.length > 0 && (
                                    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                        {filteredVendors.map(v => (
                                            <button key={v.id} type="button" onClick={() => selectVendor(v)}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition border-b border-slate-100 last:border-0 font-semibold text-slate-700">
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ROW 2: Address grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            {/* Selected Vendor Display */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">🏢 Supplier Information</h3>
                                {selectedVendor ? (
                                    <div className="text-xs text-slate-700 space-y-1">
                                        <p className="font-bold text-slate-900 text-sm">{selectedVendor.name}</p>
                                        {selectedVendor.contact_person && <p className="text-slate-500 font-semibold">Attn: {selectedVendor.contact_person}</p>}
                                        <p>{[selectedVendor.street, selectedVendor.location].filter(Boolean).join(', ')}</p>
                                        <p>{[selectedVendor.city, selectedVendor.state, selectedVendor.pin].filter(Boolean).join(', ')}</p>
                                        <p>Phone: {selectedVendor.phone || '-'}</p>
                                        <p>Email: {selectedVendor.email || '-'}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic font-semibold">Please select a vendor using the search box above.</p>
                                )}
                            </div>

                            {/* Shipping Destination */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">📍 Shipping Destination (Ship To)</h3>
                                
                                {/* CRM Client Selection Search */}
                                <div className="mb-3">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">🔍 Search Client (CRM) to Auto-Fill</label>
                                    <ClientSearchInput
                                        value={clientSearchQuery}
                                        onChange={setClientSearchQuery}
                                        onSelect={onClientSelect}
                                        placeholder="Type client name to auto-fill..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Attention (Name)</label>
                                        <input type="text" value={shipTo.name} onChange={e => setShipTo({ ...shipTo, name: e.target.value })}
                                            className="form-input text-xs w-full py-1.5 px-2.5 border border-slate-200 rounded focus:outline-none bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Company Name</label>
                                        <input type="text" value={shipTo.company} onChange={e => setShipTo({ ...shipTo, company: e.target.value })}
                                            className="form-input text-xs w-full py-1.5 px-2.5 border border-slate-200 rounded focus:outline-none bg-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Street Address</label>
                                        <input type="text" value={shipTo.street} onChange={e => setShipTo({ ...shipTo, street: e.target.value })}
                                            className="form-input text-xs w-full py-1.5 px-2.5 border border-slate-200 rounded focus:outline-none bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Area / Landmark</label>
                                        <input type="text" value={shipTo.location} onChange={e => setShipTo({ ...shipTo, location: e.target.value })}
                                            className="form-input text-xs w-full py-1.5 px-2.5 border border-slate-200 rounded focus:outline-none bg-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">City</label>
                                        <input type="text" value={shipTo.city} onChange={e => setShipTo({ ...shipTo, city: e.target.value })}
                                            className="form-input text-xs w-full py-1.5 px-2.5 border border-slate-200 rounded focus:outline-none bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Pin Code</label>
                                        <input type="text" value={shipTo.pin} onChange={e => setShipTo({ ...shipTo, pin: e.target.value })}
                                            className="form-input text-xs w-full py-1.5 px-2.5 border border-slate-200 rounded focus:outline-none bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                                        <input type="text" value={shipTo.phone} onChange={e => setShipTo({ ...shipTo, phone: e.target.value })}
                                            className="form-input text-xs w-full py-1.5 px-2.5 border border-slate-200 rounded focus:outline-none bg-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 3: Requisitioner and Shipping Terms */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Requisitioner</label>
                                <input type="text" value={requisitioner} onChange={e => setRequisitioner(e.target.value)}
                                    placeholder="e.g. Roshan Dixit" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ship Via</label>
                                <input type="text" value={shipVia} onChange={e => setShipVia(e.target.value)}
                                    placeholder="e.g. Courier / Truck" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">F.O.B.</label>
                                <input type="text" value={fob} onChange={e => setFob(e.target.value)}
                                    placeholder="e.g. Destination" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Shipping Terms</label>
                                <input type="text" value={shippingTerms} onChange={e => setShippingTerms(e.target.value)}
                                    placeholder="e.g. Net 30" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none" />
                            </div>
                        </div>

                        {/* ROW 4: Line Items */}
                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">📦 PO Items List</h3>
                                <button type="button" onClick={addItem} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition flex items-center gap-1">
                                    <Plus className="w-3.5 h-3.5" /> Add Row
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-slate-700 border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="border border-slate-200 py-2 px-3 text-left w-20">Item #</th>
                                            <th className="border border-slate-200 py-2 px-3 text-left">Description</th>
                                            <th className="border border-slate-200 py-2 px-3 text-center w-14">Qty</th>
                                            <th className="border border-slate-200 py-2 px-3 text-right w-24">Unit Price (₹)</th>
                                            <th className="border border-slate-200 py-2 px-3 text-right w-28">Total (₹)</th>
                                            <th className="border border-slate-200 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="border border-slate-200 p-1">
                                                    <input type="text" value={item.item_no} onChange={e => handleItemChange(item.id, 'item_no', e.target.value)}
                                                        placeholder="Item/SKU" className="w-full py-1.5 px-2 border-0 bg-transparent focus:outline-none font-mono text-[10px]" />
                                                </td>
                                                <td className="border border-slate-200 p-1.5 relative group/cell">
                                                    {/* Font styling tools toolbar */}
                                                    <div className="absolute bottom-full left-1 mb-1 hidden group-focus-within/cell:flex items-center gap-1.5 bg-slate-800 text-white rounded-lg p-1 shadow-lg z-20 no-print border border-slate-700">
                                                        <button type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('bold'); }} className="hover:bg-slate-700 px-1.5 py-0.5 rounded font-black text-[10px] w-6 h-5 flex items-center justify-center" title="Bold">B</button>
                                                        <button type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('italic'); }} className="hover:bg-slate-700 px-1.5 py-0.5 rounded italic text-[10px] w-6 h-5 flex items-center justify-center" title="Italic">I</button>
                                                        <button type="button" onMouseDown={e => { e.preventDefault(); document.execCommand('underline'); }} className="hover:bg-slate-700 px-1.5 py-0.5 rounded underline text-[10px] w-6 h-5 flex items-center justify-center" title="Underline">U</button>
                                                        <span className="w-[1px] h-3.5 bg-slate-600"></span>
                                                        <button type="button" onMouseDown={e => { e.preventDefault(); applyFontSize('10px'); }} className="hover:bg-slate-700 px-1 py-0.5 rounded text-[8px] font-bold" title="Extra Small">XS</button>
                                                        <button type="button" onMouseDown={e => { e.preventDefault(); applyFontSize('12px'); }} className="hover:bg-slate-700 px-1 py-0.5 rounded text-[9px] font-bold" title="Small">S</button>
                                                        <button type="button" onMouseDown={e => { e.preventDefault(); applyFontSize('14px'); }} className="hover:bg-slate-700 px-1 py-0.5 rounded text-[10px] font-bold" title="Medium">M</button>
                                                        <button type="button" onMouseDown={e => { e.preventDefault(); applyFontSize('16px'); }} className="hover:bg-slate-700 px-1 py-0.5 rounded text-[11px] font-bold" title="Large">L</button>
                                                    </div>
                                                    
                                                    {/* Editable description area */}
                                                    <div
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        data-placeholder="Material/Service specifications..."
                                                        onBlur={e => {
                                                            handleItemChange(item.id, 'description', e.currentTarget.innerHTML);
                                                        }}
                                                        className="w-full min-h-[36px] py-1.5 px-2 focus:outline-none text-xs bg-transparent text-slate-800 leading-relaxed font-sans empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:block"
                                                        dangerouslySetInnerHTML={{ __html: item.description || '' }}
                                                    />
                                                </td>
                                                <td className="border border-slate-200 p-1 text-center">
                                                    <input type="number" value={item.quantity === 0 ? '' : item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                                        className="w-full py-1.5 px-2 border-0 bg-transparent text-center focus:outline-none font-bold" />
                                                </td>
                                                <td className="border border-slate-200 p-1 text-right">
                                                    <input type="number" value={item.unit_price === 0 ? '' : item.unit_price} onChange={e => handleItemChange(item.id, 'unit_price', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                                        className="w-full py-1.5 px-2 border-0 bg-transparent text-right focus:outline-none font-mono" />
                                                </td>
                                                <td className="border border-slate-200 py-2 px-3 text-right font-mono font-bold bg-slate-50/30">
                                                    ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="border border-slate-200 p-1 text-center">
                                                    <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1}
                                                        className="text-red-400 hover:text-red-600 transition disabled:opacity-30">
                                                        <Trash2 className="w-4 h-4 mx-auto" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ROW 5: Bottom details, Tax, shipping, comments */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                            {/* Comments input */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Comments or Special Instructions</label>
                                <textarea value={comments} onChange={e => setComments(e.target.value)}
                                    placeholder="Enter warranty, delivery location terms, inspections details etc..." rows={4}
                                    className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none" />
                            </div>

                            {/* Summary Inputs */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5">💵 Total Summary</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <span className="font-semibold text-slate-600 py-1">Subtotal</span>
                                    <span className="text-right font-mono font-bold py-1">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs items-center">
                                    <span className="font-semibold text-slate-600">Tax Rate (GST %)</span>
                                    <input type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                        className="py-1 px-2 border border-slate-200 rounded focus:outline-none w-20 ml-auto text-right font-mono" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs items-center">
                                    <span className="font-semibold text-slate-600">Shipping Cost (₹)</span>
                                    <input type="number" value={shippingCost === 0 ? '' : shippingCost} onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                                        className="py-1 px-2 border border-slate-200 rounded focus:outline-none w-24 ml-auto text-right font-mono" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs items-center pb-2 border-b border-slate-200">
                                    <span className="font-semibold text-slate-600">Other Adjustments (₹)</span>
                                    <input type="number" value={otherCost === 0 ? '' : otherCost} onChange={e => setOtherCost(parseFloat(e.target.value) || 0)}
                                        className="py-1 px-2 border border-slate-200 rounded focus:outline-none w-24 ml-auto text-right font-mono" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                                    <span className="font-black text-slate-800">Grand Total</span>
                                    <span className="text-right font-mono font-black text-emerald-600">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
