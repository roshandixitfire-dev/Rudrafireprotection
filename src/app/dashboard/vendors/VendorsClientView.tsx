'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AccessLevel } from '@/utils/supabase/demo-users';
import { Plus, Search, Edit2, Trash2, FileText, Store, ClipboardList } from 'lucide-react';
import VendorFormModal from './VendorFormModal';
import PurchaseOrderFormModal from './PurchaseOrderFormModal';
import WorkOrderFormModal from './WorkOrderFormModal';
import { Briefcase } from 'lucide-react';

interface VendorsClientViewProps {
    initialVendors: any[];
    initialPOs: any[];
    accessLevel: AccessLevel;
    useDb: boolean;
}

const supabase = createClient();

export default function VendorsClientView({ initialVendors, initialPOs, accessLevel, useDb }: VendorsClientViewProps) {
    const [activeTab, setActiveTab] = useState<'vendors' | 'pos' | 'workorders'>('vendors');
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [woSearch, setWoSearch] = useState('');
    const [editingWO, setEditingWO] = useState<any>(null);
    const [isAddingWO, setIsAddingWO] = useState(false);
    const [vendors, setVendors] = useState<any[]>(initialVendors);
    const [pos, setPOs] = useState<any[]>(initialPOs);

    const [vendorSearch, setVendorSearch] = useState('');
    const [poSearch, setPoSearch] = useState('');

    // Modal States
    const [editingVendor, setEditingVendor] = useState<any>(null);
    const [isAddingVendor, setIsAddingVendor] = useState(false);
    const [editingPO, setEditingPO] = useState<any>(null);
    const [isAddingPO, setIsAddingPO] = useState(false);
    const [poPresetVendor, setPoPresetVendor] = useState<any>(null);

    
    // Load Work Orders
    useEffect(() => {
        const loadWOs = async () => {
            if (useDb) {
                try {
                    const { data, error } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
                    if (!error && data && data.length > 0) {
                        setWorkOrders(data);
                        return;
                    }
                } catch (e) {
                    console.warn('Could not fetch work_orders from DB, falling back to local storage');
                }
            }
            try {
                const local = localStorage.getItem('rudra-work-orders');
                if (local) setWorkOrders(JSON.parse(local));
            } catch (err) {
                console.error('Failed to load local work orders:', err);
            }
        };
        loadWOs();
    }, [useDb]);

    // Sync database state and local storage fallback
    useEffect(() => {
        if (!useDb) {
            try {
                const localVendors = localStorage.getItem('rudra-local-vendors');
                const localPOs = localStorage.getItem('rudra-local-pos');
                if (localVendors) setVendors(JSON.parse(localVendors));
                if (localPOs) setPOs(JSON.parse(localPOs));
            } catch (e) {
                console.error('Failed to load offline data:', e);
            }
        }
    }, [useDb]);

    // Vendor Search Filter
    const filteredVendors = vendors.filter(v => 
        v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.contact_person?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.city?.toLowerCase().includes(vendorSearch.toLowerCase())
    );

    // Work Orders Search Filter
    const filteredWOs = workOrders.filter(w => {
        const client = w.client_name || '';
        const num = w.wo_number || '';
        const quote = w.ref_quotation_no || '';
        const site = w.site_name || w.site_city || '';
        const term = woSearch.toLowerCase();
        return (
            num.toLowerCase().includes(term) ||
            client.toLowerCase().includes(term) ||
            quote.toLowerCase().includes(term) ||
            site.toLowerCase().includes(term)
        );
    });

    // PO Search Filter
    const filteredPOs = pos.filter(p => {
        const vendorName = p.vendors?.name || p.vendor?.name || '';
        return (
            p.po_number?.toLowerCase().includes(poSearch.toLowerCase()) ||
            vendorName.toLowerCase().includes(poSearch.toLowerCase()) ||
            p.po_date?.includes(poSearch)
        );
    });

    // Delete Vendor Handler
    const handleDeleteVendor = async (id: any) => {
        if (accessLevel === 'view') {
            alert('Access Denied. You do not have permission to delete vendors.');
            return;
        }
        if (!confirm('Are you sure you want to delete this vendor? This will remove all their logged details.')) {
            return;
        }

        try {
            if (useDb) {
                const { error } = await supabase.from('vendors').delete().eq('id', id);
                if (error) throw error;
                setVendors(prev => prev.filter(v => v.id !== id));
            } else {
                const updated = vendors.filter(v => v.id !== id);
                setVendors(updated);
                localStorage.setItem('rudra-local-vendors', JSON.stringify(updated));
            }
        } catch (e: any) {
            alert('Failed to delete vendor: ' + e.message);
        }
    };

    // Delete PO Handler
    const handleDeletePO = async (id: any) => {
        if (accessLevel === 'view') {
            alert('Access Denied. You do not have permission to delete Purchase Orders.');
            return;
        }
        if (!confirm('Are you sure you want to delete this Purchase Order? This action cannot be undone.')) {
            return;
        }

        try {
            if (useDb) {
                const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
                if (error) throw error;
                setPOs(prev => prev.filter(p => p.id !== id));
            } else {
                const updated = pos.filter(p => p.id !== id);
                setPOs(updated);
                localStorage.setItem('rudra-local-pos', JSON.stringify(updated));
            }
        } catch (e: any) {
            alert('Failed to delete Purchase Order: ' + e.message);
        }
    };

    const handleVendorModalClose = (savedVendor?: any) => {
        setIsAddingVendor(false);
        setEditingVendor(null);
        if (savedVendor) {
            setVendors(prev => {
                const exists = prev.some(v => v.id === savedVendor.id);
                if (exists) {
                    return prev.map(v => v.id === savedVendor.id ? savedVendor : v);
                }
                return [savedVendor, ...prev];
            });
        }
    };

    
    const handleDeleteWO = async (id: any) => {
        if (accessLevel === 'view') {
            alert('Access Denied. You do not have permission to delete Work Orders.');
            return;
        }
        if (!confirm('Are you sure you want to delete this Work Order?')) return;

        try {
            if (useDb) {
                try {
                    await supabase.from('work_orders').delete().eq('id', id);
                } catch (_) {}
            }
            const updated = workOrders.filter(w => w.id !== id);
            setWorkOrders(updated);
            localStorage.setItem('rudra-work-orders', JSON.stringify(updated));
        } catch (e: any) {
            alert('Failed to delete Work Order: ' + e.message);
        }
    };

    const handleWOModalClose = (savedWO?: any) => {
        setIsAddingWO(false);
        setEditingWO(null);
        if (savedWO) {
            setWorkOrders(prev => {
                const idx = prev.findIndex(w => w.id === savedWO.id || w.wo_number === savedWO.wo_number);
                if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = savedWO;
                    return updated;
                }
                return [savedWO, ...prev];
            });
        }
    };

    const handlePOModalClose = (savedPO?: any) => {
        setIsAddingPO(false);
        setEditingPO(null);
        setPoPresetVendor(null);
        if (savedPO) {
            setPOs(prev => {
                const exists = prev.some(p => p.id === savedPO.id);
                if (exists) {
                    return prev.map(p => p.id === savedPO.id ? savedPO : p);
                }
                return [savedPO, ...prev];
            });
        }
    };

    const handleCreatePOForVendor = (vendor: any) => {
        setPoPresetVendor(vendor);
        setIsAddingPO(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">🏢 Vendor & Purchase Order Hub</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage vendor contacts, details, billing info and dispatch purchase orders.</p>
                </div>
                {!useDb && (
                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[10px] font-semibold flex items-center gap-1.5 animate-pulse">
                        ⚠️ Database offline: Saving to local storage.
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200/80">
                <button
                    onClick={() => setActiveTab('vendors')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition ${activeTab === 'vendors' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <Store className="w-4 h-4" /> Vendors Directory
                </button>

                <button
                    onClick={() => setActiveTab('workorders')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition ${activeTab === 'workorders' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <Briefcase className="w-4 h-4" /> Work Orders
                </button>
                <button
                    onClick={() => setActiveTab('pos')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition ${activeTab === 'pos' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <ClipboardList className="w-4 h-4" /> Purchase Orders
                </button>
            </div>

            {/* TAB CONTENT: VENDORS */}
            {activeTab === 'vendors' && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search vendors by name, contact, city..."
                                value={vendorSearch}
                                onChange={e => setVendorSearch(e.target.value)}
                                className="form-input text-xs w-full py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                        {accessLevel !== 'view' && (
                            <button onClick={() => setIsAddingVendor(true)} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5">
                                <Plus className="w-4 h-4" /> Add Vendor
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100 font-bold text-slate-500">
                                    <th className="py-3 px-4">Vendor Name</th>
                                    <th className="py-3 px-4">Contact Person</th>
                                    <th className="py-3 px-4">Phone / Email</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredVendors.length > 0 ? (
                                    filteredVendors.map(v => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-800">{v.name}</td>
                                            <td className="py-3.5 px-4">{v.contact_person || '-'}</td>
                                            <td className="py-3.5 px-4 space-y-0.5">
                                                {v.phone && <p>{v.phone}</p>}
                                                {v.email && <p className="text-slate-400">{v.email}</p>}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {v.city ? `${v.city}, ${v.state || 'Maharashtra'}` : '-'}
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-2">
                                                <button onClick={() => handleCreatePOForVendor(v)} className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold transition">
                                                    ➕ Create PO
                                                </button>
                                                {accessLevel !== 'view' && (
                                                    <>
                                                        <button onClick={() => setEditingVendor(v)} className="p-1.5 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition inline-flex">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteVendor(v.id)} className="p-1.5 bg-slate-50 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition inline-flex">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">No vendors found. Add your first supplier using the button above.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: WORK ORDERS */}
            {activeTab === 'workorders' && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search by WO#, Client, Quote Ref, Site..."
                                value={woSearch}
                                onChange={e => setWoSearch(e.target.value)}
                                className="form-input text-xs w-full py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                        {accessLevel !== 'view' && (
                            <button 
                                onClick={() => { setEditingWO(null); setIsAddingWO(true); }} 
                                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-200"
                            >
                                <Plus className="w-4 h-4" /> Create Work Order
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100 font-bold text-slate-500">
                                    <th className="py-3 px-4">WO Number</th>
                                    <th className="py-3 px-4">Client / Contact</th>
                                    <th className="py-3 px-4">Ref Quotation</th>
                                    <th className="py-3 px-4">Site Location</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Grand Total</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredWOs.length > 0 ? (
                                    filteredWOs.map(w => (
                                        <tr key={w.id || w.wo_number} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-red-600">
                                                {w.wo_number}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-800">{w.client_name || 'Unnamed Client'}</div>
                                                {w.contact_person && <div className="text-[11px] text-slate-400">{w.contact_person}</div>}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[11px]">
                                                {w.ref_quotation_no ? (
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200">
                                                        {w.ref_quotation_no}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Direct</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600">
                                                {w.site_name || w.site_city || '-'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">
                                                {w.wo_date ? w.wo_date.split('-').reverse().join('-') : '-'}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                                ₹{Number(w.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] px-2 py-0.5 font-black rounded uppercase ${
                                                    w.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                    w.status === 'Completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                    w.status === 'Issued' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {w.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                                                <button 
                                                    onClick={() => setEditingWO(w)} 
                                                    className="p-1.5 bg-slate-50 text-slate-700 hover:text-red-700 hover:bg-red-50 rounded transition inline-flex items-center gap-1 font-bold px-2.5 border border-slate-200"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> View / Print
                                                </button>
                                                {accessLevel !== 'view' && (
                                                    <button 
                                                        onClick={() => handleDeleteWO(w.id)} 
                                                        className="p-1.5 bg-slate-50 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition inline-flex border border-slate-200"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Briefcase className="w-8 h-8 text-slate-300" />
                                                <p className="font-medium text-slate-600">No Work Orders Found</p>
                                                <p className="text-[11px] text-slate-400 max-w-sm">
                                                    Click &quot;Create Work Order&quot; above to import items and terms directly from any Quotation or build a new Work Order with client acceptance signature.
                                                </p>
                                                {accessLevel !== 'view' && (
                                                    <button 
                                                        onClick={() => { setEditingWO(null); setIsAddingWO(true); }}
                                                        className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition"
                                                    >
                                                        + Create First Work Order
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: PURCHASE ORDERS */}
            {activeTab === 'pos' && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search POs by number, supplier, date..."
                                value={poSearch}
                                onChange={e => setPoSearch(e.target.value)}
                                className="form-input text-xs w-full py-2 pl-9 pr-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                        {accessLevel !== 'view' && (
                            <button onClick={() => setIsAddingPO(true)} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5">
                                <Plus className="w-4 h-4" /> Create Purchase Order
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100 font-bold text-slate-500">
                                    <th className="py-3 px-4">PO Number</th>
                                    <th className="py-3 px-4">Supplier / Vendor</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Grand Total</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredPOs.length > 0 ? (
                                    filteredPOs.map(p => {
                                        const vendorName = p.vendors?.name || p.vendor?.name || 'Unknown Vendor';
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                                <td className="py-3.5 px-4 font-mono font-bold text-[#00B050]">{p.po_number}</td>
                                                <td className="py-3.5 px-4 font-semibold text-slate-800">{vendorName}</td>
                                                <td className="py-3.5 px-4">{p.po_date ? p.po_date.split('-').reverse().join('-') : '-'}</td>
                                                <td className="py-3.5 px-4 font-mono font-bold">
                                                    ₹{Number(p.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`text-[10px] px-2 py-0.5 font-black rounded uppercase ${p.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {p.status || 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right space-x-1">
                                                    <button onClick={() => setEditingPO(p)} className="p-1.5 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition inline-flex items-center gap-1 font-bold px-2.5">
                                                        <FileText className="w-3.5 h-3.5" /> View / Print
                                                    </button>
                                                    {accessLevel !== 'view' && (
                                                        <button onClick={() => handleDeletePO(p.id)} className="p-1.5 bg-slate-50 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition inline-flex">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">No purchase orders found. Click "Create Purchase Order" above to issue your first PO.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vendor Modals */}
            {(isAddingVendor || editingVendor) && (
                <VendorFormModal
                    initialData={editingVendor}
                    onClose={handleVendorModalClose}
                    useDb={useDb}
                />
            )}

            
            {/* Work Order Modal */}
            {(isAddingWO || editingWO) && (
                <WorkOrderFormModal
                    initialData={editingWO}
                    vendors={vendors}
                    onClose={handleWOModalClose}
                    useDb={useDb}
                />
            )}

            {/* PO Modals */}
            {(isAddingPO || editingPO) && (
                <PurchaseOrderFormModal
                    initialData={editingPO || (poPresetVendor ? { vendor: poPresetVendor, vendor_id: poPresetVendor.id } : null)}
                    vendors={vendors}
                    onClose={handlePOModalClose}
                    useDb={useDb}
                />
            )}
        </div>
    );
}
