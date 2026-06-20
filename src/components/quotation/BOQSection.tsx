'use client';
import React from 'react';
import { BOQSection as Section, BOQItem, UnitType } from './types';
import { formatCurrency, ITEM_LIBRARY, SECTION_TEMPLATES, MASTER_ITEM_LIBRARY } from './utils';

interface Props {
    section: Section;
    onUpdate: (updated: Section) => void;
    onDelete: () => void;
}

const UNITS: UnitType[] = ['Nos', 'Mtr', 'Lot', 'Set', 'Sq.Mtr', 'Kg', 'LS'];

const BOQSectionComponent: React.FC<Props> = ({ section, onUpdate, onDelete }) => {

    const addItem = () => {
        const newItem: BOQItem = {
            id: crypto.randomUUID(),
            srNo: section.items.length + 1,
            description: '',
            unit: 'Nos',
            qty: 0,
            rate: 0,
            amount: 0
        };
        const updatedItems = [...section.items, newItem];
        onUpdate({ ...section, items: updatedItems });
    };

    const updateItem = (id: string, field: keyof BOQItem, value: any) => {
        const updatedItems = section.items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'qty' || field === 'rate') {
                    updated.amount = (updated.qty || 0) * (updated.rate || 0);
                }
                return updated;
            }
            return item;
        });

        const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        onUpdate({ ...section, items: updatedItems, total: newTotal });
    };

    const deleteItem = (id: string) => {
        const updatedItems = section.items
            .filter(item => item.id !== id)
            .map((item, index) => ({ ...item, srNo: index + 1 }));

        const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        onUpdate({ ...section, items: updatedItems, total: newTotal });
    };

    return (
        <div className="section-container bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="section-header bg-gray-50 px-4 py-3 flex justify-between items-center border-bottom border-gray-200">
                <input
                    className="section-title bg-transparent border-none focus:ring-0 font-bold text-gray-800 text-lg w-1/2"
                    value={section.name}
                    onChange={(e) => onUpdate({ ...section, name: e.target.value })}
                />
                <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    Remove Section
                </button>
            </div>

            <table className="boq-table w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-12 text-center">Sr.</th>
                        <th>Description</th>
                        <th className="w-24">Unit</th>
                        <th className="w-24">Qty</th>
                        <th className="w-32">Rate</th>
                        <th className="w-32">Amount</th>
                        <th className="w-12"></th>
                    </tr>
                </thead>
                <tbody>
                    {section.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="text-center text-sm text-gray-500">{item.srNo}</td>
                            <td className="p-0">
                                <textarea
                                    className="w-full p-2 text-[10px] leading-tight border-none focus:ring-1 focus:ring-red-200 resize-none bg-transparent min-h-[60px]"
                                    placeholder="Material description..."
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                />
                            </td>
                            <td>
                                <select
                                    className="boq-input text-sm border-none focus:ring-1 focus:ring-red-200"
                                    value={item.unit}
                                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                >
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="boq-input text-sm border-none focus:ring-1 focus:ring-red-200"
                                    value={isNaN(item.qty) ? '' : (item.qty === 0 ? '' : item.qty)}
                                    onChange={(e) => updateItem(item.id, 'qty', e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="boq-input text-sm border-none focus:ring-1 focus:ring-red-200"
                                    value={isNaN(item.rate) ? '' : (item.rate === 0 ? '' : item.rate)}
                                    onChange={(e) => updateItem(item.id, 'rate', e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
                                />
                            </td>
                            <td className="font-medium text-right pr-4">
                                {formatCurrency(item.amount)}
                            </td>
                            <td>
                                <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500">×</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50/50">
                    <tr>
                        <td colSpan={5} className="text-right font-bold py-3 pr-4">Section Total:</td>
                        <td className="text-right font-bold py-3 pr-4 text-red-600">{formatCurrency(section.total)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            {/* Template Item Checklist */}
            {SECTION_TEMPLATES[section.name] && (
                <div className="px-4 py-3 bg-blue-50/50 border-t border-blue-100">
                    <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Available Items for {section.name}:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {SECTION_TEMPLATES[section.name].map(itemName => {
                            const isAdded = section.items.some(i => i.description.startsWith(itemName));
                            return (
                                <label key={itemName} className={`flex items-start gap-2 p-2 rounded border transition cursor-pointer ${isAdded ? 'bg-blue-100 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={isAdded}
                                        onChange={() => {
                                            if (isAdded) {
                                                // Remove logic could be added here if needed, but usually we just add
                                            } else {
                                                const template = MASTER_ITEM_LIBRARY[itemName];
                                                if (template) {
                                                    const newItem: BOQItem = {
                                                        id: crypto.randomUUID(),
                                                        srNo: section.items.length + 1,
                                                        description: template.description || itemName,
                                                        unit: template.unit || 'Nos',
                                                        qty: 1,
                                                        rate: template.rate || 0,
                                                        amount: template.rate || 0
                                                    };
                                                    onUpdate({
                                                        ...section,
                                                        items: [...section.items, newItem],
                                                        total: section.total + (template.rate || 0)
                                                    });
                                                }
                                            }
                                        }}
                                        className="mt-1 h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-[10px] font-bold text-gray-700 leading-tight">{itemName}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-4">
                <button
                    onClick={addItem}
                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                >
                    + Add Empty Item
                </button>
                <div className="relative group">
                    <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">
                        + Add from Library
                    </button>
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50 overflow-hidden">
                        <div className="p-2 bg-gray-50 border-b border-gray-200 font-bold text-[10px] uppercase text-gray-500">Pick from Library</div>
                        <div className="max-h-60 overflow-y-auto">
                            {Object.entries(ITEM_LIBRARY).map(([category, items]) => (
                                <div key={category} className="border-b border-gray-100 last:border-none">
                                    <div className="px-3 py-1 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-tighter">{category}</div>
                                    {items.map((itemTemplate, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const newItem: BOQItem = {
                                                    id: crypto.randomUUID(),
                                                    srNo: section.items.length + 1,
                                                    description: itemTemplate.description || '',
                                                    unit: itemTemplate.unit || 'Nos',
                                                    qty: 1,
                                                    rate: itemTemplate.rate || 0,
                                                    amount: itemTemplate.rate || 0
                                                };
                                                onUpdate({
                                                    ...section,
                                                    items: [...section.items, newItem],
                                                    total: section.total + (itemTemplate.rate || 0)
                                                });
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 transition border-b border-gray-50 last:border-none group/item"
                                        >
                                            <div className="font-bold text-gray-700 truncate">{itemTemplate.description}</div>
                                            <div className="text-[10px] text-emerald-600 font-bold">₹{itemTemplate.rate?.toLocaleString()} / {itemTemplate.unit}</div>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BOQSectionComponent;
