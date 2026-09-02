'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
    Plus, Trash2, Save, Download, ArrowRight, RefreshCw,
    Calculator, FileSpreadsheet, Percent, Info, CheckCircle2,
    Building2, Calendar, FileText, IndianRupee, Layers, Sparkles,
    Search, Package, Filter, X, ChevronRight, Check
} from 'lucide-react'
import { useFormDraft } from '@/hooks/useFormDraft'
import DraftNoticeBanner from '@/components/common/DraftNoticeBanner'

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export interface CostingItem {
    id: string
    category: string
    description: string
    specs?: string
    purchaseRate: number        // Base material/purchase rate with tax (C)
    qty: number                 // Quoted Qty (D)
    transportPct: number        // Transport % (default 1%)
    loadUnloadPct: number       // Load/Unload % (default 1%)
    labourRate: number          // Labour rate per unit (K)
    overheadPct: number         // Overhead % (default 5%)
    quotedRate: number          // Quoted selling rate per unit (E)
}

export interface CatalogEntry {
    category: string
    description: string
    specs?: string
    purchaseRate: number
    labourRate: number
    quotedRate: number
}

export interface CostingSheet {
    id?: string
    costingNo: string
    projectName: string
    developerName: string
    refNo: string
    date: string
    items: CostingItem[]
    status?: string
}

// ─────────────────────────────────────────────────────────────────
// Master Catalog Database (All Categories & Items)
// ─────────────────────────────────────────────────────────────────
export const COSTING_MASTER_CATALOG: CatalogEntry[] = [
    // --- Pumps & Accessories ---
    { category: 'Pumps & Accessories', description: 'Hydrant Pump (Surface Mounted) Kirloskar', specs: '2400 LPM @ 100 M/H, 100 HP @ 6%', purchaseRate: 257436, labourRate: 15000, quotedRate: 349755 },
    { category: 'Pumps & Accessories', description: 'Sprinkler Pump (Surface Mounted) Kirloskar', specs: '2400 LPM @ 100 M/H, 100 HP @ 6%', purchaseRate: 257436, labourRate: 15000, quotedRate: 349755 },
    { category: 'Pumps & Accessories', description: 'Jockey Pump (Surface Mounted)', specs: '240 LPM, 2900 RPM @ 90 M/H, 7.5 HP', purchaseRate: 66500, labourRate: 12000, quotedRate: 100585 },
    { category: 'Pumps & Accessories', description: 'Main Fire Pump (Electric)', specs: 'Supply & installation of main fire pump (electric) with panel', purchaseRate: 185000, labourRate: 15000, quotedRate: 235000 },
    { category: 'Pumps & Accessories', description: 'Diesel Fire Pump', specs: 'Supply & installation of diesel engine driven fire pump', purchaseRate: 285000, labourRate: 20000, quotedRate: 365000 },
    { category: 'Pumps & Accessories', description: 'Control Panel (Aviva Make)', specs: 'Control Panel @ 13.5%', purchaseRate: 600000, labourRate: 25000, quotedRate: 869505 },

    // --- Valves & Accessories ---
    { category: 'Valves & Accessories', description: 'N. R. V. (C & R Make ) PN 16 (150 mm)', specs: 'Includes N.R.V., 2 Flanges, 8 Bolts, Gasket', purchaseRate: 4068, labourRate: 800, quotedRate: 6236 },
    { category: 'Valves & Accessories', description: 'N. R. V. (C & R Make ) PN 10 (80 mm)', specs: 'Includes N.R.V., 2 Flanges, 4 Bolts, Gasket', purchaseRate: 1981, labourRate: 500, quotedRate: 3176 },
    { category: 'Valves & Accessories', description: 'Butterfly Valve (C & R Make) PN 16 (150 mm)', specs: 'Includes Butterfly Valve, 2 Flanges, 8 Bolts, Gasket', purchaseRate: 2943, labourRate: 800, quotedRate: 4500 },
    { category: 'Valves & Accessories', description: 'Fire Hydrant Point', specs: 'Supply and installation of fire hydrant point with ISI mark valve', purchaseRate: 5500, labourRate: 1200, quotedRate: 8500 },
    { category: 'Valves & Accessories', description: 'ISI Fire Hydrant Valve Replacement', specs: 'Supply, Installation, Testing, Commissioning Of ISI Make Fire Hydrant Valve', purchaseRate: 3200, labourRate: 600, quotedRate: 4750 },

    // --- Alarm & Detection ---
    { category: 'Alarm & Detection', description: 'Fire Alarm Panel (Conventional 4-Zone)', specs: 'Microprocessor-based 4-zone panel with battery backup', purchaseRate: 12000, labourRate: 2500, quotedRate: 18000 },
    { category: 'Alarm & Detection', description: 'Public Addressable Fire Alarm Panel', specs: 'Microprocessor-based Addressable Fire Alarm Control Panel', purchaseRate: 42000, labourRate: 5000, quotedRate: 57839 },
    { category: 'Alarm & Detection', description: 'Smoke Detector (Apollo Series 65)', specs: 'Photoelectric smoke detector with base & LED indicator', purchaseRate: 1400, labourRate: 300, quotedRate: 2322 },
    { category: 'Alarm & Detection', description: 'Heat Detector (Rate of Rise)', specs: 'Supply and installation of rate-of-rise heat detector', purchaseRate: 650, labourRate: 150, quotedRate: 1100 },
    { category: 'Alarm & Detection', description: 'Manual Call Point & Hooter', specs: 'Break glass push button MCP & Electronic Hooter', purchaseRate: 1800, labourRate: 400, quotedRate: 3090 },
    { category: 'Alarm & Detection', description: 'Fire Alarm Cabling (2-Core FRLS 1.5mm)', specs: 'Poly-cab make copper cable per meter', purchaseRate: 150, labourRate: 50, quotedRate: 260 },

    // --- Sprinkler System ---
    { category: 'Sprinkler System', description: 'Sprinkler Head Supply & Installation (Pendent/Upright)', specs: 'Quartzoid bulb sprinkler head 68°C as per NBC norms', purchaseRate: 450, labourRate: 150, quotedRate: 750 },
    { category: 'Sprinkler System', description: 'Sprinkler Alarm Valve Assembly (150mm)', specs: 'Complete flanged alarm valve with gong bell & pressure switch', purchaseRate: 28000, labourRate: 4500, quotedRate: 39500 },
    { category: 'Sprinkler System', description: 'Flow Switch / Water Flow Detector', specs: 'Vane type water flow detector for zone monitoring', purchaseRate: 3200, labourRate: 600, quotedRate: 4800 },

    // --- Fire Extinguishers ---
    { category: 'Fire Extinguishers', description: 'ABC Type 2kg Fire Extinguisher', specs: 'ISI Approved SafePro make 2kg ABC type fire extinguisher', purchaseRate: 1100, labourRate: 250, quotedRate: 1741 },
    { category: 'Fire Extinguishers', description: 'ABC Type 4kg Fire Extinguisher', specs: 'ISI Approved SafePro make 4kg ABC type fire extinguisher', purchaseRate: 1350, labourRate: 250, quotedRate: 2150 },
    { category: 'Fire Extinguishers', description: 'Co2 Type 4.5kg Fire Extinguisher', specs: 'Manganese Steel Cylinder CO2 type fire extinguisher', purchaseRate: 3200, labourRate: 350, quotedRate: 4850 },
    { category: 'Fire Extinguishers', description: 'ABC Type Extinguisher Refilling 4kg', specs: 'Servicing, Testing, Cleaning, Refilling & Pressure Testing', purchaseRate: 280, labourRate: 100, quotedRate: 450 },
    { category: 'Fire Extinguishers', description: 'Co2 Type Extinguisher Refilling 4.5kg', specs: 'Servicing, Testing, Cleaning, Refilling & Pressure Testing', purchaseRate: 480, labourRate: 120, quotedRate: 750 },

    // --- Hydrant & Hose Accessories ---
    { category: 'Hydrant & Hose Accessories', description: 'Fire Hose Reel Assembly (30m)', specs: 'Swing type wall mounted hose reel with fittings & nozzle', purchaseRate: 3100, labourRate: 600, quotedRate: 4500 },
    { category: 'Hydrant & Hose Accessories', description: 'Single ISI Hosebox Installation', specs: 'Single door ISI marked hose box', purchaseRate: 1450, labourRate: 350, quotedRate: 2150 },
    { category: 'Hydrant & Hose Accessories', description: 'Canvas Hosepipe (63mm x 15m)', specs: 'ISI marked RRL Canvas hosepipe with SS couplings', purchaseRate: 2600, labourRate: 400, quotedRate: 3895 },

    // --- Services & Maintenance ---
    { category: 'Services & Maintenance', description: 'Fire Safety Inspection & Audit', specs: 'Comprehensive NBC / Form-B Inspection Audit Visit', purchaseRate: 1000, labourRate: 1000, quotedRate: 2500 },
    { category: 'Services & Maintenance', description: 'Transportation & Logistics', specs: 'Transportation and logistics charges for equipment/materials', purchaseRate: 600, labourRate: 0, quotedRate: 1000 },
]

const DEFAULT_ITEMS: CostingItem[] = [
    {
        id: '1',
        category: 'Pumps & Accessories',
        description: 'Hydrant Pump (Surface Mounted) Kirloskar',
        specs: '2400 LPM @ 100 M/H, 100 HP @ 6%',
        purchaseRate: 257436,
        qty: 2,
        transportPct: 1,
        loadUnloadPct: 1,
        labourRate: 15000,
        overheadPct: 5,
        quotedRate: 349755
    },
    {
        id: '2',
        category: 'Pumps & Accessories',
        description: 'Sprinkler Pump (Surface Mounted) Kirloskar',
        specs: '2400 LPM @ 100 M/H, 100 HP @ 6%',
        purchaseRate: 257436,
        qty: 1,
        transportPct: 1,
        loadUnloadPct: 1,
        labourRate: 15000,
        overheadPct: 5,
        quotedRate: 349755
    },
    {
        id: '3',
        category: 'Pumps & Accessories',
        description: 'Jockey Pump (Surface Mounted)',
        specs: '240 LPM, 2900 RPM @ 90 M/H, 7.5 HP',
        purchaseRate: 66500,
        qty: 3,
        transportPct: 1,
        loadUnloadPct: 1,
        labourRate: 12000,
        overheadPct: 5,
        quotedRate: 100585
    },
    {
        id: '4',
        category: 'Pumps & Accessories',
        description: 'Control Panel (Aviva Make)',
        specs: 'Control Panel @ 13.5%',
        purchaseRate: 600000,
        qty: 1,
        transportPct: 1,
        loadUnloadPct: 1,
        labourRate: 25000,
        overheadPct: 5,
        quotedRate: 869505
    },
    {
        id: '5',
        category: 'Valves & Accessories',
        description: 'N. R. V. (C & R Make ) PN 16 (150 mm)',
        specs: 'Includes N.R.V., 2 Flanges, 8 Bolts, Gasket',
        purchaseRate: 4068,
        qty: 4,
        transportPct: 1,
        loadUnloadPct: 1,
        labourRate: 800,
        overheadPct: 5,
        quotedRate: 6236
    },
    {
        id: '6',
        category: 'Valves & Accessories',
        description: 'N. R. V. (C & R Make ) PN 10 (80 mm)',
        specs: 'Includes N.R.V., 2 Flanges, 4 Bolts, Gasket',
        purchaseRate: 1981,
        qty: 4,
        transportPct: 1,
        loadUnloadPct: 1,
        labourRate: 500,
        overheadPct: 5,
        quotedRate: 3176
    }
]

const SAVED_COSTINGS_KEY = 'rudra_sales_costings_v1'

// ─────────────────────────────────────────────────────────────────
// Auto-complete Catalog Dropdown Input Component
// ─────────────────────────────────────────────────────────────────
function CostingItemSearchInput({
    value,
    onChange,
    onSelect
}: {
    value: string
    onChange: (val: string) => void
    onSelect: (item: CatalogEntry) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const safeValue = value || ''
    const matches = useMemo(() => {
        if (!safeValue || safeValue.length < 1) return []
        const q = safeValue.toLowerCase()
        return COSTING_MASTER_CATALOG.filter(c =>
            c.description.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            (c.specs && c.specs.toLowerCase().includes(q))
        ).slice(0, 8)
    }, [safeValue])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} className="relative w-full">
            <input
                type="text"
                value={safeValue}
                onChange={e => {
                    onChange(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                placeholder="Type to search equipment or description…"
                className="w-full font-bold text-slate-800 bg-transparent focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 px-2 py-1 rounded border border-slate-200 text-xs transition-all"
            />
            {open && matches.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                    {matches.map((item, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                onSelect(item)
                                setOpen(false)
                            }}
                            className="w-full text-left p-2.5 hover:bg-violet-50/70 transition-colors flex items-center justify-between gap-2 group"
                        >
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                                        {item.category}
                                    </span>
                                    <span className="font-bold text-slate-900 text-xs group-hover:text-violet-700">
                                        {item.description}
                                    </span>
                                </div>
                                {item.specs && (
                                    <p className="text-[10px] text-slate-500 mt-0.5">{item.specs}</p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className="text-xs font-mono font-bold text-slate-700 block">₹{item.purchaseRate.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400">Labour: ₹{item.labourRate}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────
// Main Costing Module Component
// ─────────────────────────────────────────────────────────────────
export default function CostingModule({
    clients = [],
    onBackToSales
}: {
    clients?: any[]
    onBackToSales?: () => void
}) {
    // Form state
    const [costingNo, setCostingNo] = useState(`RFP/COST/26-27/${Math.floor(1000 + Math.random() * 9000)}`)
    const [projectName, setProjectName] = useState('Sparkle')
    const [developerName, setDeveloperName] = useState('M/s Sparkle Earth Developer')
    const [refNo, setRefNo] = useState('RFP/FFS/25-26/037')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [items, setItems] = useState<CostingItem[]>(DEFAULT_ITEMS)
    const [globalMargin, setGlobalMargin] = useState<number>(20) // default target profit %

    const {
        hasDraft,
        draftTime,
        lastSavedNotice,
        saveDraft,
        clearDraft,
        restoreDraft,
        discardDraft
    } = useFormDraft<{ costingNo: string; projectName: string; developerName: string; refNo: string; date: string; items: CostingItem[]; globalMargin: number }>({
        storageKey: 'draft_costing_sheet',
        onRestore: (draft) => {
            if (draft) {
                if (draft.costingNo) setCostingNo(draft.costingNo)
                if (draft.projectName) setProjectName(draft.projectName)
                if (draft.developerName) setDeveloperName(draft.developerName)
                if (draft.refNo) setRefNo(draft.refNo)
                if (draft.date) setDate(draft.date)
                if (draft.items && draft.items.length > 0) setItems(draft.items)
                if (draft.globalMargin) setGlobalMargin(draft.globalMargin)
            }
        }
    })

    useEffect(() => {
        if (projectName || developerName || (items && items.length > 0)) {
            const timer = setTimeout(() => {
                saveDraft({ costingNo, projectName, developerName, refNo, date, items, globalMargin })
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [costingNo, projectName, developerName, refNo, date, items, globalMargin, saveDraft])

    // Modals & Drawers
    const [savedSheets, setSavedSheets] = useState<CostingSheet[]>([])
    const [saveStatus, setSaveStatus] = useState<string>('')
    const [showSavedDrawer, setShowSavedDrawer] = useState(false)
    const [showCatalogDrawer, setShowCatalogDrawer] = useState(false)
    const [catalogCategory, setCatalogCategory] = useState<string>('All')
    const [catalogSearchTerm, setCatalogSearchTerm] = useState<string>('')

    // Load saved costings from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(SAVED_COSTINGS_KEY)
            if (raw) setSavedSheets(JSON.parse(raw))
        } catch { }
    }, [])

    // Filter catalog entries for catalog drawer
    const catalogCategories = useMemo(() => {
        return ['All', ...Array.from(new Set(COSTING_MASTER_CATALOG.map(c => c.category)))]
    }, [])

    const filteredCatalogEntries = useMemo(() => {
        return COSTING_MASTER_CATALOG.filter(item => {
            const matchesCat = catalogCategory === 'All' || item.category === catalogCategory
            const q = catalogSearchTerm.toLowerCase()
            const matchesQuery = !q ||
                item.description.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                (item.specs && item.specs.toLowerCase().includes(q))
            return matchesCat && matchesQuery
        })
    }, [catalogCategory, catalogSearchTerm])

    // ─────────────────────────────────────────────────────────────────
    // Mathematical Formula Calculations per row (matches Excel exactly)
    // ─────────────────────────────────────────────────────────────────
    const calculatedRows = useMemo(() => {
        return items.map((it, idx) => {
            const purchaseRate = Number(it.purchaseRate) || 0
            const qty = Number(it.qty) || 0
            const transportPct = Number(it.transportPct) ?? 1
            const loadUnloadPct = Number(it.loadUnloadPct) ?? 1
            const labourRate = Number(it.labourRate) || 0
            const overheadPct = Number(it.overheadPct) ?? 5
            const quotedRate = Number(it.quotedRate) || 0

            // 1. Supply Rate breakdown
            const transportAmt = purchaseRate * (transportPct / 100)
            const loadUnloadAmt = purchaseRate * (loadUnloadPct / 100)
            const supplyRate = purchaseRate + transportAmt + loadUnloadAmt

            // 2. Supply & Labour Rate
            const supplyLabourRate = supplyRate + labourRate

            // 3. Overhead Expense (5% of Supply & Labour)
            const overheadAmt = supplyLabourRate * (overheadPct / 100)

            // 4. Actual Costing Unit Rate (N)
            const actualCostUnitRate = supplyLabourRate + overheadAmt

            // 5. Totals for Quoted Quantity
            const actualSupplyAmount = qty * supplyRate
            const actualLabourAmount = qty * labourRate
            const actualOverheadAmount = qty * overheadAmt
            const actualTotalCostingAmount = qty * actualCostUnitRate

            // 6. Selling / Quoted Totals
            const quotedAmount = qty * quotedRate

            // 7. Margins & Differences
            const diffRate = quotedRate - actualCostUnitRate
            const profitAmount = quotedAmount - actualTotalCostingAmount
            const profitPct = actualTotalCostingAmount > 0
                ? (profitAmount / actualTotalCostingAmount) * 100
                : 0

            return {
                ...it,
                srNo: idx + 1,
                transportAmt,
                loadUnloadAmt,
                supplyRate,
                supplyLabourRate,
                overheadAmt,
                actualCostUnitRate,
                actualSupplyAmount,
                actualLabourAmount,
                actualOverheadAmount,
                actualTotalCostingAmount,
                quotedAmount,
                diffRate,
                profitAmount,
                profitPct
            }
        })
    }, [items])

    // ─────────────────────────────────────────────────────────────────
    // Summary Aggregates
    // ─────────────────────────────────────────────────────────────────
    const summary = useMemo(() => {
        let totalPurchase = 0
        let totalSupply = 0
        let totalLabour = 0
        let totalOverhead = 0
        let totalActualCost = 0
        let totalQuoted = 0

        calculatedRows.forEach(r => {
            totalPurchase += (r.purchaseRate * r.qty)
            totalSupply += r.actualSupplyAmount
            totalLabour += r.actualLabourAmount
            totalOverhead += r.actualOverheadAmount
            totalActualCost += r.actualTotalCostingAmount
            totalQuoted += r.quotedAmount
        })

        const totalProfit = totalQuoted - totalActualCost
        const overallProfitPct = totalActualCost > 0 ? (totalProfit / totalActualCost) * 100 : 0

        return {
            totalPurchase,
            totalSupply,
            totalLabour,
            totalOverhead,
            totalActualCost,
            totalQuoted,
            totalProfit,
            overallProfitPct
        }
    }, [calculatedRows])

    // ─────────────────────────────────────────────────────────────────
    // Actions
    // ─────────────────────────────────────────────────────────────────
    const handleAddItem = (entry?: CatalogEntry) => {
        const newItem: CostingItem = {
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            category: entry?.category || 'General Equipment',
            description: entry?.description || 'New Equipment / Item Description',
            specs: entry?.specs || '',
            purchaseRate: entry?.purchaseRate || 1000,
            qty: 1,
            transportPct: 1,
            loadUnloadPct: 1,
            labourRate: entry?.labourRate || 200,
            overheadPct: 5,
            quotedRate: entry?.quotedRate || Math.round((entry?.purchaseRate || 1000) * 1.3)
        }
        setItems(prev => [...prev, newItem])
    }

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(it => it.id !== id))
    }

    const handleSelectCatalogItem = (id: string, entry: CatalogEntry) => {
        setItems(prev => prev.map(it => {
            if (it.id !== id) return it
            const p = entry.purchaseRate
            const l = entry.labourRate
            const s = p * (1 + (it.transportPct + it.loadUnloadPct) / 100)
            const c = (s + l) * (1 + it.overheadPct / 100)
            const calcQuoted = Math.round(c * (1 + globalMargin / 100))

            return {
                ...it,
                category: entry.category,
                description: entry.description,
                specs: entry.specs || '',
                purchaseRate: entry.purchaseRate,
                labourRate: entry.labourRate,
                quotedRate: entry.quotedRate || calcQuoted
            }
        }))
    }

    const handleUpdateItem = (id: string, field: keyof CostingItem, value: any) => {
        setItems(prev => prev.map(it => {
            if (it.id !== id) return it
            const updated = { ...it, [field]: value }
            
            // Auto-recalculate Quoted Rate if purchaseRate or labourRate changes and user wants margin
            if (field === 'purchaseRate' || field === 'labourRate') {
                const p = Number(field === 'purchaseRate' ? value : it.purchaseRate) || 0
                const l = Number(field === 'labourRate' ? value : it.labourRate) || 0
                const s = p * (1 + (it.transportPct + it.loadUnloadPct) / 100)
                const c = (s + l) * (1 + it.overheadPct / 100)
                updated.quotedRate = Math.round(c * (1 + globalMargin / 100))
            }
            return updated
        }))
    }

    const handleApplyGlobalMargin = (margin: number) => {
        setGlobalMargin(margin)
        setItems(prev => prev.map(it => {
            const p = Number(it.purchaseRate) || 0
            const l = Number(it.labourRate) || 0
            const s = p * (1 + (it.transportPct + it.loadUnloadPct) / 100)
            const c = (s + l) * (1 + it.overheadPct / 100)
            return {
                ...it,
                quotedRate: Math.round(c * (1 + margin / 100))
            }
        }))
    }

    const handleLoadExcelSample = () => {
        setProjectName('Sparkle')
        setDeveloperName('M/s Sparkle Earth Developer')
        setRefNo('RFP/FFS/25-26/037')
        setItems(DEFAULT_ITEMS)
        setSaveStatus('Loaded Excel Sample (Malad Sparkle Site)!')
        setTimeout(() => setSaveStatus(''), 3000)
    }

    const handleSaveSheet = () => {
        const sheet: CostingSheet = {
            id: Date.now().toString(),
            costingNo,
            projectName,
            developerName,
            refNo,
            date,
            items
        }

        const updated = [sheet, ...savedSheets.filter(s => s.costingNo !== costingNo)]
        setSavedSheets(updated)
        try {
            localStorage.setItem(SAVED_COSTINGS_KEY, JSON.stringify(updated))
            setSaveStatus('Costing Sheet Saved Successfully!')
            clearDraft()
            setTimeout(() => setSaveStatus(''), 3000)
        } catch (e) {
            alert('Failed to save costing sheet locally.')
        }
    }

    const handleExportCSV = () => {
        let csv = 'Sr. No.,Category,Description,Specs,Purchase Rate (₹),Qty,Transport %,Load/Unload %,Supply Rate (₹),Labour Rate (₹),Overhead Exp (5%),Actual Unit Cost (₹),Quoted Rate (₹),Actual Total Cost (₹),Quoted Total Amount (₹),Profit (₹),Profit %\n'
        
        calculatedRows.forEach(r => {
            const row = [
                r.srNo,
                `"${r.category}"`,
                `"${r.description}"`,
                `"${r.specs || ''}"`,
                r.purchaseRate,
                r.qty,
                r.transportPct,
                r.loadUnloadPct,
                r.supplyRate.toFixed(2),
                r.labourRate,
                r.overheadAmt.toFixed(2),
                r.actualCostUnitRate.toFixed(2),
                r.quotedRate,
                r.actualTotalCostingAmount.toFixed(2),
                r.quotedAmount.toFixed(2),
                r.profitAmount.toFixed(2),
                r.profitPct.toFixed(2) + '%'
            ]
            csv += row.join(',') + '\n'
        })

        csv += `\nTOTALS,,,,,,,,,,,,${summary.totalActualCost.toFixed(2)},${summary.totalQuoted.toFixed(2)},${summary.totalProfit.toFixed(2)},${summary.overallProfitPct.toFixed(2)}%\n`

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName.replace(/\s+/g, '_')}_Costing_${costingNo.replace(/\//g, '-')}.csv`
        a.click()
    }

    const handleTransferToQuotation = () => {
        // Formats payload to transfer to Legacy Quotation Module
        const quotePayload = {
            companyName: projectName ? `${projectName} (${developerName})` : developerName,
            street: '',
            location: '',
            items: calculatedRows.map(r => ({
                srNo: String(r.srNo),
                title: r.description,
                description: r.specs ? `${r.description} - ${r.specs}` : r.description,
                qty: String(r.qty),
                unit: 'Nos',
                rate: r.quotedRate,
                taxPct: 18,
                amount: r.quotedAmount
            }))
        }

        try {
            localStorage.setItem('rudra-legacy-quotation-draft', JSON.stringify({ data: quotePayload }))
            window.location.href = '/dashboard/quotations/legacy'
        } catch {
            alert('Failed to transfer costing data to quotation.')
        }
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
            <DraftNoticeBanner
                hasDraft={hasDraft}
                draftTime={draftTime}
                lastSavedNotice={lastSavedNotice}
                onRestore={restoreDraft}
                onDiscard={discardDraft}
            />
            
            {/* Top Navigation & Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center font-bold">
                        <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-violet-50 text-violet-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-violet-200">
                                Pre-Quotation Module
                            </span>
                            {saveStatus && (
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {saveStatus}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Costing Estimator</h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setShowCatalogDrawer(true)}
                        className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-all border border-violet-200"
                    >
                        <Package className="w-4 h-4 text-violet-600" /> 📦 Master Catalog ({COSTING_MASTER_CATALOG.length})
                    </button>
                    <button
                        onClick={handleLoadExcelSample}
                        className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        title="Load Malad Sparkle Site Sample Data"
                    >
                        <Sparkles className="w-4 h-4 text-amber-500" /> Load Excel Sample
                    </button>
                    <button
                        onClick={() => setShowSavedDrawer(true)}
                        className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Saved Sheets ({savedSheets.length})
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all border border-emerald-200"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={handleSaveSheet}
                        className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm shadow-violet-600/20 active:scale-95"
                    >
                        <Save className="w-4 h-4" /> Save Costing
                    </button>
                    <button
                        onClick={handleTransferToQuotation}
                        className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-95"
                        title="Convert rates to legacy quotation"
                    >
                        <ArrowRight className="w-4 h-4" /> Convert to Quote
                    </button>
                </div>
            </div>

            {/* Costing Header Meta Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Costing Sheet No.</label>
                        <input
                            type="text"
                            value={costingNo}
                            onChange={e => setCostingNo(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Project Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Sparkle Earth"
                            value={projectName}
                            onChange={e => setProjectName(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Developer / Client</label>
                        <input
                            type="text"
                            placeholder="e.g. M/s Sparkle Earth Developer"
                            value={developerName}
                            onChange={e => setDeveloperName(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ref / Tender No.</label>
                        <input
                            type="text"
                            placeholder="e.g. RFP/FFS/25-26/037"
                            value={refNo}
                            onChange={e => setRefNo(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                    </div>
                </div>

                {/* Target Profit Quick Preset */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Info className="w-4 h-4 text-violet-500" />
                        <span>Formulas automatically calculate: <strong className="text-slate-800">Supply (Material + 1% Trans + 1% Load) + Labour + 5% Overhead = Actual Unit Cost</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Quick Target Profit Margin:</span>
                        {[15, 20, 25, 30].map(m => (
                            <button
                                key={m}
                                onClick={() => handleApplyGlobalMargin(m)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                    globalMargin === m
                                        ? 'bg-violet-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {m}%
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Supply Cost</p>
                    <p className="text-xl font-black text-slate-800 mt-1">₹{summary.totalSupply.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Incl. Freight & Loading</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Labour & Overhead</p>
                    <p className="text-xl font-black text-slate-800 mt-1">₹{(summary.totalLabour + summary.totalOverhead).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Labour: ₹{summary.totalLabour.toLocaleString()} | O.H 5%</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actual Cost Amount (Land)</p>
                    <p className="text-xl font-black text-slate-900 mt-1">₹{summary.totalActualCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Total Landed Cost</p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Quoted Amount & Profit</p>
                    <p className="text-xl font-black text-emerald-700 mt-1">₹{summary.totalQuoted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">
                        Profit: +₹{summary.totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({summary.overallProfitPct.toFixed(1)}%)
                    </p>
                </div>
            </div>

            {/* Items Excel Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-violet-600" /> Costing Line Items ({items.length})
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCatalogDrawer(true)}
                            className="flex items-center gap-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-violet-200"
                        >
                            <Package className="w-4 h-4 text-violet-600" /> Browse Catalog
                        </button>
                        <button
                            onClick={() => handleAddItem()}
                            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                <th className="p-3 text-center w-10">Sr.</th>
                                <th className="p-3 min-w-[280px]">Description & Specs (Type to Search Catalog)</th>
                                <th className="p-3 text-right w-24">Purchase Rate ₹</th>
                                <th className="p-3 text-center w-16">Qty</th>
                                <th className="p-3 text-right w-24">Supply Rate ₹</th>
                                <th className="p-3 text-right w-24">Labour Rate ₹</th>
                                <th className="p-3 text-right w-28">Actual Unit Cost ₹</th>
                                <th className="p-3 text-right w-28 bg-violet-50/50 text-violet-800">Quoted Rate ₹</th>
                                <th className="p-3 text-right w-32 bg-violet-50/50 text-violet-800">Quoted Amount ₹</th>
                                <th className="p-3 text-right w-28 bg-emerald-50/50 text-emerald-800">Profit ₹</th>
                                <th className="p-3 text-center w-20 bg-emerald-50/50 text-emerald-800">Profit %</th>
                                <th className="p-3 text-center w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {calculatedRows.map((r, idx) => (
                                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-3 text-center font-bold text-slate-400">{r.srNo}</td>
                                    
                                    {/* Description (With Auto-complete Catalog Dropdown) & Specs */}
                                    <td className="p-2 space-y-1">
                                        <CostingItemSearchInput
                                            value={r.description}
                                            onChange={val => handleUpdateItem(r.id, 'description', val)}
                                            onSelect={catItem => handleSelectCatalogItem(r.id, catItem)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Specifications / notes…"
                                            value={r.specs || ''}
                                            onChange={e => handleUpdateItem(r.id, 'specs', e.target.value)}
                                            className="w-full text-[11px] text-slate-500 bg-transparent focus:bg-white focus:ring-1 focus:ring-violet-500 px-1.5 py-0.5 rounded border border-transparent hover:border-slate-200"
                                        />
                                    </td>

                                    {/* Base Purchase Rate */}
                                    <td className="p-2 text-right">
                                        <input
                                            type="number"
                                            value={r.purchaseRate || ''}
                                            onChange={e => handleUpdateItem(r.id, 'purchaseRate', parseFloat(e.target.value) || 0)}
                                            className="w-full text-right font-mono text-xs font-semibold text-slate-800 bg-transparent focus:bg-white focus:ring-1 focus:ring-violet-500 px-1.5 py-1 rounded border border-transparent hover:border-slate-200"
                                        />
                                    </td>

                                    {/* Qty */}
                                    <td className="p-2 text-center">
                                        <input
                                            type="number"
                                            value={r.qty}
                                            onChange={e => handleUpdateItem(r.id, 'qty', parseInt(e.target.value) || 0)}
                                            className="w-full text-center font-bold text-xs text-slate-900 bg-transparent focus:bg-white focus:ring-1 focus:ring-violet-500 px-1.5 py-1 rounded border border-transparent hover:border-slate-200"
                                        />
                                    </td>

                                    {/* Calculated Supply Rate (Purchase + 1% Trans + 1% Load) */}
                                    <td className="p-3 text-right font-mono text-slate-600" title={`Base: ₹${r.purchaseRate} + 1% Trans + 1% Load`}>
                                        ₹{r.supplyRate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </td>

                                    {/* Labour Rate */}
                                    <td className="p-2 text-right">
                                        <input
                                            type="number"
                                            value={r.labourRate || ''}
                                            onChange={e => handleUpdateItem(r.id, 'labourRate', parseFloat(e.target.value) || 0)}
                                            className="w-full text-right font-mono text-xs text-slate-700 bg-transparent focus:bg-white focus:ring-1 focus:ring-violet-500 px-1.5 py-1 rounded border border-transparent hover:border-slate-200"
                                        />
                                    </td>

                                    {/* Actual Unit Cost (Landed + 5% Overhead) */}
                                    <td className="p-3 text-right font-mono font-bold text-slate-900" title={`(Supply + Labour) + 5% Overhead`}>
                                        ₹{r.actualCostUnitRate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </td>

                                    {/* Quoted Rate */}
                                    <td className="p-2 text-right bg-violet-50/30">
                                        <input
                                            type="number"
                                            value={r.quotedRate || ''}
                                            onChange={e => handleUpdateItem(r.id, 'quotedRate', parseFloat(e.target.value) || 0)}
                                            className="w-full text-right font-mono font-bold text-xs text-violet-900 bg-white focus:ring-2 focus:ring-violet-500 px-1.5 py-1 rounded border border-violet-200"
                                        />
                                    </td>

                                    {/* Quoted Amount */}
                                    <td className="p-3 text-right font-mono font-bold text-violet-900 bg-violet-50/30">
                                        ₹{r.quotedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </td>

                                    {/* Profit Amount */}
                                    <td className={`p-3 text-right font-mono font-bold bg-emerald-50/30 ${r.profitAmount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                        ₹{r.profitAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </td>

                                    {/* Profit % */}
                                    <td className={`p-3 text-center font-bold bg-emerald-50/30 ${r.profitPct >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                        {r.profitPct.toFixed(1)}%
                                    </td>

                                    {/* Delete button */}
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleRemoveItem(r.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Add button */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={() => handleAddItem()}
                        className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700"
                    >
                        <Plus className="w-4 h-4" /> Add Item Line
                    </button>
                    <div className="text-xs text-slate-400 font-medium">
                        Showing {items.length} items
                    </div>
                </div>
            </div>

            {/* 📦 Master Catalog Browser Drawer */}
            {showCatalogDrawer && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-4 flex flex-col">
                        <div className="flex items-center justify-between border-b pb-3 flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <Package className="w-5 h-5 text-violet-600" /> Master Equipment & Item Catalog
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Click any item to add it directly to your costing sheet</p>
                            </div>
                            <button onClick={() => setShowCatalogDrawer(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search & Category Filter Pills */}
                        <div className="space-y-3 flex-shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search catalog by name, category, or specs…"
                                    value={catalogSearchTerm}
                                    onChange={e => setCatalogSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {catalogCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCatalogCategory(cat)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            catalogCategory === cat
                                                ? 'bg-violet-600 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Catalog Cards Grid */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {filteredCatalogEntries.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-8">No matching catalog items found.</p>
                            ) : (
                                filteredCatalogEntries.map((catItem, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all bg-white flex items-center justify-between gap-3 group"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">
                                                    {catItem.category}
                                                </span>
                                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-violet-700 transition-colors truncate">
                                                    {catItem.description}
                                                </h4>
                                            </div>
                                            {catItem.specs && (
                                                <p className="text-xs text-slate-500 line-clamp-1">{catItem.specs}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-0.5">
                                                <span>Purchase: <strong className="text-slate-800 font-mono">₹{catItem.purchaseRate.toLocaleString()}</strong></span>
                                                <span>Labour: <strong className="text-slate-800 font-mono">₹{catItem.labourRate.toLocaleString()}</strong></span>
                                                <span>Quoted: <strong className="text-violet-700 font-mono font-bold">₹{catItem.quotedRate.toLocaleString()}</strong></span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                handleAddItem(catItem)
                                                setSaveStatus(`Added "${catItem.description}" to Costing!`)
                                                setTimeout(() => setSaveStatus(''), 2500)
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white text-xs font-bold rounded-xl transition-all flex-shrink-0 active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Saved Costing Sheets Drawer */}
            {showSavedDrawer && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-violet-600" /> Saved Costing Sheets
                            </h3>
                            <button onClick={() => setShowSavedDrawer(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                                ✕
                            </button>
                        </div>

                        {savedSheets.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No saved costing sheets yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {savedSheets.map(s => (
                                    <div key={s.id} className="p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-all space-y-2 bg-slate-50/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{s.projectName || 'Untitled Project'}</p>
                                                <p className="text-xs text-slate-500">{s.developerName} • {s.costingNo}</p>
                                            </div>
                                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">{s.date}</span>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => {
                                                    setCostingNo(s.costingNo)
                                                    setProjectName(s.projectName)
                                                    setDeveloperName(s.developerName)
                                                    setRefNo(s.refNo)
                                                    setDate(s.date)
                                                    setItems(s.items)
                                                    setShowSavedDrawer(false)
                                                }}
                                                className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Load Sheet
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const updated = savedSheets.filter(x => x.costingNo !== s.costingNo)
                                                    setSavedSheets(updated)
                                                    localStorage.setItem(SAVED_COSTINGS_KEY, JSON.stringify(updated))
                                                }}
                                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}
