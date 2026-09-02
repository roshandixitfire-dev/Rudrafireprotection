'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X } from 'lucide-react';

interface VendorFormModalProps {
    initialData?: any;
    onClose: (savedVendor?: any) => void;
    useDb: boolean;
}

const supabase = createClient();

const STATES_LIST = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function VendorFormModal({ initialData, onClose, useDb }: VendorFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        website: '',
        fax: '',
        street: '',
        location: '',
        city: '',
        state: 'Maharashtra',
        pin: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                contact_person: initialData.contact_person || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                website: initialData.website || '',
                fax: initialData.fax || '',
                street: initialData.street || '',
                location: initialData.location || '',
                city: initialData.city || '',
                state: initialData.state || 'Maharashtra',
                pin: initialData.pin || ''
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Company Name is required.');
            return;
        }

        setSaving(true);
        try {
            if (useDb) {
                let res, error;
                if (initialData?.id) {
                    // Update
                    const { data, error: err } = await supabase
                        .from('vendors')
                        .update(formData)
                        .eq('id', initialData.id)
                        .select()
                        .single();
                    res = data;
                    error = err;
                } else {
                    // Insert
                    const { data, error: err } = await supabase
                        .from('vendors')
                        .insert(formData)
                        .select()
                        .single();
                    res = data;
                    error = err;
                }

                if (error) throw error;
                onClose(res);
            } else {
                // Local Storage Fallback
                const localVendorsStr = localStorage.getItem('rudra-local-vendors') || '[]';
                const localVendors = JSON.parse(localVendorsStr);
                
                let savedRecord: any;
                if (initialData?.id) {
                    // Update existing
                    savedRecord = { ...formData, id: initialData.id, created_at: initialData.created_at || new Date().toISOString() };
                    const updated = localVendors.map((v: any) => v.id === initialData.id ? savedRecord : v);
                    localStorage.setItem('rudra-local-vendors', JSON.stringify(updated));
                } else {
                    // Insert new
                    savedRecord = { ...formData, id: Date.now(), created_at: new Date().toISOString() };
                    localVendors.push(savedRecord);
                    localStorage.setItem('rudra-local-vendors', JSON.stringify(localVendors));
                }
                
                onClose(savedRecord);
            }
        } catch (error: any) {
            console.error('Error saving vendor:', error);
            alert('Failed to save vendor: ' + (error.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">
                        {initialData ? '✏️ Edit Vendor Details' : '➕ Add New Vendor'}
                    </h2>
                    <button onClick={() => onClose()} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Details */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🏢 Supplier Company Info</h3>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name *</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange}
                                    placeholder="e.g. Acme Fire Equipment Corp" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person</label>
                                <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange}
                                    placeholder="e.g. John Doe (Manager)" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    placeholder="e.g. +91 98765 43210" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="e.g. sales@acmefire.com" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Website</label>
                                    <input type="text" name="website" value={formData.website} onChange={handleChange}
                                        placeholder="www.acme.com" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fax</label>
                                    <input type="text" name="fax" value={formData.fax} onChange={handleChange}
                                        placeholder="Fax no." className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📍 Address Info</h3>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address</label>
                                <input type="text" name="street" value={formData.street} onChange={handleChange}
                                    placeholder="Building/Shop/Gala No., Street" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Location / Area</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange}
                                    placeholder="e.g. MIDC Industrial Area" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">City / Town</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange}
                                    placeholder="e.g. Mumbai" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                                    <select name="state" value={formData.state} onChange={handleChange}
                                        className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                        {STATES_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pin Code</label>
                                    <input type="text" name="pin" value={formData.pin} onChange={handleChange}
                                        placeholder="400001" className="form-input text-xs w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => onClose()} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-1.5">
                            {saving ? '⏳ Saving...' : '💾 Save Vendor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
