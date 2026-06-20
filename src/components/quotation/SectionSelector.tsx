'use client';
import React, { useState } from 'react';
import { HIERARCHICAL_LIBRARY, BOQ_ITEM_DATA, LibrarySection, LibraryItem } from './utils';
import { BOQSection as Section, BOQItem } from './types';

interface Props {
    onAddSections: (sections: Section[]) => void;
    existingSectionNames?: string[];   // sections already in quotation
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function leafKeys(item: LibraryItem): string[] {
    if (item.children && item.children.length > 0) return item.children.flatMap(leafKeys);
    return [item.key];
}

function allLeafKeysForSection(libSection: LibrarySection): string[] {
    return libSection.items.flatMap(leafKeys);
}

function makeBOQItem(key: string, srNo: number): BOQItem {
    const data = BOQ_ITEM_DATA[key] ?? {};
    return {
        id: crypto.randomUUID(),
        srNo,
        description: data.description ?? key,
        unit: (data.unit as any) ?? 'Nos',
        qty: 1,
        rate: data.rate ?? 0,
        amount: data.rate ?? 0,
    };
}

// ─── Sub-item leaf row ──────────────────────────────────────────────────────

const LeafRow: React.FC<{
    item: LibraryItem; checked: boolean;
    onChange: (key: string, val: boolean) => void; indent?: number;
}> = ({ item, checked, onChange, indent = 0 }) => (
    <label
        className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-all
            ${checked ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50 text-gray-700'}`}
        style={{ paddingLeft: `${0.75 + indent * 1.5}rem` }}
    >
        <input type="checkbox" checked={checked}
            onChange={e => onChange(item.key, e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
        <span className={`text-[11px] font-semibold leading-tight flex-1 ${checked ? 'text-green-700' : ''}`}>
            {item.label}
        </span>
        {BOQ_ITEM_DATA[item.key]?.rate && (
            <span className="text-[10px] text-gray-400 font-mono">
                ₹{BOQ_ITEM_DATA[item.key].rate?.toLocaleString('en-IN')}
            </span>
        )}
    </label>
);

// ─── Parent expandable row ─────────────────────────────────────────────────

const ParentRow: React.FC<{
    item: LibraryItem; selectedKeys: Set<string>;
    onToggleKey: (key: string, val: boolean) => void;
}> = ({ item, selectedKeys, onToggleKey }) => {
    const [open, setOpen] = useState(true);
    const children = item.children ?? [];
    const allChildKeys = children.flatMap(leafKeys);
    const checkedCount = allChildKeys.filter(k => selectedKeys.has(k)).length;
    const allChecked = checkedCount === allChildKeys.length && allChildKeys.length > 0;
    const someChecked = checkedCount > 0 && !allChecked;

    return (
        <div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all
                ${allChecked ? 'bg-blue-50' : someChecked ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                <input type="checkbox" checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked; }}
                    onChange={e => allChildKeys.forEach(k => onToggleKey(k, e.target.checked))}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="flex-1 text-[11px] font-bold text-gray-700 cursor-pointer" onClick={() => setOpen(o => !o)}>
                    {item.label}
                    {someChecked && <span className="ml-1 text-[10px] text-blue-500 font-bold">({checkedCount}/{allChildKeys.length})</span>}
                </span>
                <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600 text-xs px-1">
                    {open ? '▲' : '▼'}
                </button>
            </div>
            {open && (
                <div className="ml-2 border-l-2 border-blue-100 pl-1 mb-1">
                    {children.map(child => (
                        <LeafRow key={child.key} item={child}
                            checked={selectedKeys.has(child.key)}
                            onChange={onToggleKey} indent={1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main SectionSelector ──────────────────────────────────────────────────

const SectionSelector: React.FC<Props> = ({ onAddSections, existingSectionNames = [] }) => {
    const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
    const [selectedKeys, setSelectedKeys] = useState<Record<string, Set<string>>>({});
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [notification, setNotification] = useState<string | null>(null);
    const [history, setHistory] = useState<Section[][]>([]);  // undo stack

    const notify = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    // Select / deselect a section (with duplicate check)
    const toggleSection = (name: string) => {
        if (existingSectionNames.includes(name) && !selectedSections.has(name)) {
            notify(`"${name}" is already added to this quotation!`);
            return;
        }
        setSelectedSections(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    // Select ALL sections (skip already-added duplicates)
    const selectAllSections = (val: boolean) => {
        if (val) {
            const alreadyAdded = HIERARCHICAL_LIBRARY.filter(s => existingSectionNames.includes(s.name)).map(s => s.name);
            if (alreadyAdded.length > 0) {
                notify(`${alreadyAdded.length} section(s) skipped — already in quotation.`);
            }
            const selectable = HIERARCHICAL_LIBRARY.filter(s => !existingSectionNames.includes(s.name)).map(s => s.name);
            setSelectedSections(new Set(selectable));
        } else {
            setSelectedSections(new Set());
        }
    };

    const allSectionsSelected = HIERARCHICAL_LIBRARY
        .filter(s => !existingSectionNames.includes(s.name))
        .every(s => selectedSections.has(s.name))
        && selectedSections.size > 0;

    const toggleKey = (sectionName: string, key: string, val: boolean) => {
        setSelectedKeys(prev => {
            const sectionKeys = new Set(prev[sectionName] ?? []);
            val ? sectionKeys.add(key) : sectionKeys.delete(key);
            return { ...prev, [sectionName]: sectionKeys };
        });
    };

    // Select ALL items inside a section
    const selectAllInSection = (sectionName: string, val: boolean) => {
        const libSection = HIERARCHICAL_LIBRARY.find(s => s.name === sectionName);
        if (!libSection) return;
        const all = allLeafKeysForSection(libSection);
        setSelectedKeys(prev => ({ ...prev, [sectionName]: val ? new Set(all) : new Set() }));
    };

    const totalSelected = Array.from(selectedSections).reduce((acc, name) => acc + (selectedKeys[name]?.size ?? 0), 0);

    const handleAddToQuotation = () => {
        const sections = HIERARCHICAL_LIBRARY
            .filter(s => selectedSections.has(s.name))
            .map(libSection => {
                const keys = selectedKeys[libSection.name] ?? new Set<string>();
                const items: BOQItem[] = [];
                let srNo = 1;
                for (const item of libSection.items) {
                    if (item.children) {
                        for (const child of item.children) {
                            if (keys.has(child.key)) items.push(makeBOQItem(child.key, srNo++));
                        }
                    } else if (keys.has(item.key)) {
                        items.push(makeBOQItem(item.key, srNo++));
                    }
                }
                const total = items.reduce((s, i) => s + i.amount, 0);
                return { id: crypto.randomUUID(), name: libSection.name, items, total } as Section;
            });

        // Save snapshot to undo stack, then add
        setHistory(prev => [...prev, sections]);
        onAddSections(sections);

        // Reset
        setSelectedSections(new Set());
        setSelectedKeys({});
        setStep(1);
        setExpandedSection(null);
        notify(`✓ ${sections.length} section(s) added. Use Undo to reverse.`);
    };

    return (
        <div className="mb-4 no-print rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Notification banner */}
            {notification && (
                <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 animate-pulse">
                    ⚠️ {notification}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-red-600 to-red-700">
                <div>
                    <p className="text-white font-black text-sm tracking-wide">Section &amp; Item Selector</p>
                    <p className="text-red-200 text-[10px]">Tick sections, then pick individual items below</p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition
                        ${step === 1 ? 'bg-white text-red-700' : 'bg-red-800 text-white hover:bg-red-700'}`}
                        onClick={() => setStep(1)}>
                        1 · Sections
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition
                        ${step === 2 ? 'bg-white text-red-700' : 'bg-red-800 text-white hover:bg-red-700'} ${selectedSections.size === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        onClick={() => { if (selectedSections.size > 0) setStep(2); }}>
                        2 · Items
                    </span>
                </div>
            </div>

            {/* ── STEP 1: Section selection ── */}
            {step === 1 && (
                <div className="p-4">
                    {/* Select All row */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-400">Select sections for this quotation:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 hover:text-red-600 transition">
                            <input type="checkbox"
                                checked={allSectionsSelected}
                                onChange={e => selectAllSections(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-red-600" />
                            Select All
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {HIERARCHICAL_LIBRARY.map(section => {
                            const isDuplicate = existingSectionNames.includes(section.name);
                            const checked = selectedSections.has(section.name);
                            return (
                                <label key={section.name}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                                        ${isDuplicate ? 'border-amber-300 bg-amber-50 opacity-70' :
                                            checked ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-200 hover:bg-red-50/30'}`}
                                    onClick={() => toggleSection(section.name)}
                                >
                                    <input type="checkbox" checked={checked}
                                        onChange={() => toggleSection(section.name)}
                                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        disabled={isDuplicate} />
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-gray-800">{section.name}</p>
                                        <p className="text-[10px] text-gray-400">{section.items.length} items available</p>
                                    </div>
                                    {isDuplicate && <span className="text-[9px] bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-bold">ADDED</span>}
                                    {checked && !isDuplicate && <span className="text-red-500 text-sm">✓</span>}
                                </label>
                            );
                        })}
                    </div>

                    {selectedSections.size > 0 && (
                        <button onClick={() => setStep(2)}
                            className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-lg transition">
                            Next: Pick Items for {selectedSections.size} Section{selectedSections.size > 1 ? 's' : ''} →
                        </button>
                    )}
                </div>
            )}

            {/* ── STEP 2: Sub-item selection ── */}
            {step === 2 && (
                <div className="p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Tick items to include in each section:</p>
                    <div className="space-y-3">
                        {HIERARCHICAL_LIBRARY.filter(s => selectedSections.has(s.name)).map(section => {
                            const allKeys = allLeafKeysForSection(section);
                            const selCount = selectedKeys[section.name]?.size ?? 0;
                            const allItemsSelected = selCount === allKeys.length && allKeys.length > 0;

                            return (
                                <div key={section.name} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Section header */}
                                    <div className={`flex items-center gap-2 px-4 py-2.5 transition
                                        ${expandedSection === section.name ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                                        <button onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
                                            className="flex-1 flex items-center gap-2 text-left">
                                            <span className="text-xs font-black">{section.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                                                ${expandedSection === section.name ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                                {selCount}/{allKeys.length}
                                            </span>
                                        </button>
                                        {/* Select All in this section */}
                                        <label className={`flex items-center gap-1 text-[10px] font-bold cursor-pointer px-2 py-1 rounded transition
                                            ${expandedSection === section.name ? 'text-red-300 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                                            <input type="checkbox" checked={allItemsSelected}
                                                onChange={e => selectAllInSection(section.name, e.target.checked)}
                                                className="h-3 w-3 rounded" />
                                            All
                                        </label>
                                        <button onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
                                            className="text-xs px-1 opacity-70">
                                            {expandedSection === section.name ? '▲' : '▼'}
                                        </button>
                                    </div>

                                    {expandedSection === section.name && (
                                        <div className="p-2 bg-white">
                                            {section.items.map(item =>
                                                item.children ? (
                                                    <ParentRow key={item.key} item={item}
                                                        selectedKeys={selectedKeys[section.name] ?? new Set()}
                                                        onToggleKey={(key, val) => toggleKey(section.name, key, val)} />
                                                ) : (
                                                    <LeafRow key={item.key} item={item}
                                                        checked={selectedKeys[section.name]?.has(item.key) ?? false}
                                                        onChange={(key, val) => toggleKey(section.name, key, val)} />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer buttons */}
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => setStep(1)}
                            className="px-4 py-2.5 border border-gray-300 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 transition">
                            ← Back
                        </button>
                        <button
                            onClick={handleAddToQuotation}
                            disabled={totalSelected === 0}
                            className={`flex-1 py-2.5 font-black text-sm rounded-lg transition
                                ${totalSelected > 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                            ✓ Add {totalSelected} Item{totalSelected !== 1 ? 's' : ''} to Quotation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionSelector;
