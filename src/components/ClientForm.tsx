import { useState, useEffect } from 'react'
import { createClientAction, updateClientAction } from '@/app/dashboard/clients/actions'
import {
    User,
    Package,
    Calendar,
    CreditCard,
    FileText,
    Info,
    Building2,
    ShieldCheck,
    Droplets,
    Activity,
    FilePlus,
    Check,
    CloudUpload,
    CalendarCheck,
    ExternalLink,
    List,
    Camera,
    Image as ImageIcon,
    FolderOpen,
    BellRing
} from 'lucide-react'
import { getDailyServiceCountAction } from '@/app/dashboard/clients/actions'

interface ClientFormProps {
    onClose?: () => void
    initialData?: any
}

type TabType = 'primary' | 'assets' | 'financial' | 'reports'

export default function ClientForm({ onClose, initialData }: ClientFormProps) {
    const [activeTab, setActiveTab] = useState<TabType>('primary')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [referenceType, setReferenceType] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)

    // State for auto-calculating AMC End Date
    const [amcStart, setAmcStart] = useState('')
    const [contractDuration, setContractDuration] = useState('')
    const [amcEnd, setAmcEnd] = useState('')
    const [servicePlan, setServicePlan] = useState('Quarterly')
    const [nextService, setNextService] = useState('')
    const [nextRefilling, setNextRefilling] = useState('')
    const [allSchedules, setAllSchedules] = useState<string[]>([])

    const HOLIDAYS = [
        '01-26', // Republic Day
        '05-01', // Maharashtra Day
        '08-15', // Independence Day
        '10-02', // Gandhi Jayanti
        '12-25', // Christmas
    ]

    const isHolidayOrSunday = (date: Date) => {
        const day = date.getDay()
        if (day === 0) return true // Sunday
        const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        return HOLIDAYS.includes(mmdd)
    }

    const getNextValidDate = async (baseDate: Date) => {
        let current = new Date(baseDate)
        let attempts = 0
        while (attempts < 30) {
            if (!isHolidayOrSunday(current)) {
                // Check capacity
                const dateStr = current.toISOString().split('T')[0]
                const capacity = await getDailyServiceCountAction(dateStr)
                if (capacity.success && capacity.count! < 3) {
                    return dateStr
                }
            }
            current.setDate(current.getDate() + 1)
            attempts++
        }
        return current.toISOString().split('T')[0]
    }

    const calculateSchedules = async () => {
        if (!amcStart) return
        const start = new Date(amcStart)

        // 1. Calculate Next Service Date
        // Offset by a few days from start to avoid immediate same-day pressure
        const firstServiceBase = new Date(start)
        firstServiceBase.setDate(firstServiceBase.getDate() + 7)
        const firstService = await getNextValidDate(firstServiceBase)
        setNextService(firstService)

        // 2. Refill Date (usually 1 year cycle, group with service)
        // Group refill with first service of next year if possible, 
        // but for now we'll just set it 11 months from start grouped with nearest service
        const refillBase = new Date(start)
        refillBase.setMonth(refillBase.getMonth() + 11)
        const refillDate = await getNextValidDate(refillBase)
        setNextRefilling(refillDate)

        // 3. Populate All Previews (for UI)
        let interval = 3 // Quarterly
        if (servicePlan === 'Monthly') interval = 1
        if (servicePlan === 'Half Yearly') interval = 6
        if (servicePlan === 'Yearly') interval = 12

        const count = servicePlan === 'Monthly' ? 12 : (servicePlan === 'Quarterly' ? 4 : 2)
        let newSchedules = []
        for (let i = 0; i < count; i++) {
            const d = new Date(start)
            d.setMonth(d.getMonth() + (i * interval))
            newSchedules.push(d.toISOString().split('T')[0])
        }
        setAllSchedules(newSchedules)
    }

    useEffect(() => {
        calculateSchedules()
    }, [amcStart, servicePlan])

    // Pre-fill helper
    const getInit = (key: string) => initialData?.[key] || ''
    const getInitBool = (key: string) => !!initialData?.[key]

    // Derived states
    const [contactPrefix, setContactPrefix] = useState('Mr.')
    const [contactName, setContactName] = useState('')

    useEffect(() => {
        if (initialData) {
            if (initialData.contact_name) {
                const parts = initialData.contact_name.split(' ')
                if (parts[0].includes('.')) {
                    setContactPrefix(parts[0])
                    setContactName(parts.slice(1).join(' '))
                } else {
                    setContactName(initialData.contact_name)
                }
            }
            if (initialData.amc_start_date) setAmcStart(initialData.amc_start_date)
            if (initialData.amc_end_date) setAmcEnd(initialData.amc_end_date)
            if (initialData.service_plan) setServicePlan(initialData.service_plan)
            if (initialData.next_service) setNextService(initialData.next_service)
            if (initialData.next_refilling) setNextRefilling(initialData.next_refilling)
            if (initialData.client_reference) {
                if (['WOM', 'Justdial', 'Website', 'DTD Letter'].includes(initialData.client_reference)) {
                    setReferenceType(initialData.client_reference)
                } else {
                    setReferenceType('Other')
                }
            }
        }
    }, [initialData])

    useEffect(() => {
        if (amcStart && contractDuration) {
            const start = new Date(amcStart)
            const duration = parseInt(contractDuration)
            if (!isNaN(duration)) {
                start.setFullYear(start.getFullYear() + duration)
                start.setDate(start.getDate() - 1)
                setAmcEnd(start.toISOString().split('T')[0])
            }
        }
    }, [amcStart, contractDuration])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        console.log('Submitting client form...')

        try {
            if (referenceType === 'Other') {
                const customRef = formData.get('customReference') as string
                formData.set('clientReference', `Other: ${customRef}`)
            }

            // Ensure contactName is combined
            const prefix = formData.get('contactPrefix')
            const name = formData.get('contactName')
            formData.set('contactName', `${prefix} ${name}`)

            // Ensure hidden fields are in formData
            formData.set('nextService', nextService)
            formData.set('nextRefilling', nextRefilling)

            // Handle checkboxes (if not checked, formData might not have them)
            const checkFields = ['sdMeterRoom', 'sdLiftMachineRoom', 'sdElectricDuct', 'ssGround', 'ssBasement', 'ssPodium', 'ssLiftLobby', 'ssFlat']
            checkFields.forEach(f => {
                if (!formData.has(f)) formData.append(f, 'false')
            })

            let result
            if (initialData?.id) {
                result = await updateClientAction(initialData.id, formData)
            } else {
                result = await createClientAction(formData)
            }

            if (result.success) {
                if (onClose) onClose()
                window.location.reload()
            } else {
                setError(result.error || 'Failed to save client')
            }
        } catch (e: any) {
            console.error('Error handling form submission:', e)
            if (e.message?.includes('fetch failed')) {
                setError('Network error: Could not reach the server. Please check your internet connection and ensure Supabase is online.')
            } else {
                setError(e.message || 'An unexpected error occurred during submission.')
            }
        } finally {
            setLoading(false)
        }
    }

    const tabs: { id: TabType; label: string; icon: any; optional?: boolean }[] = [
        { id: 'primary', label: 'Project Overview', icon: User },
        { id: 'assets', label: 'Technical Assets', icon: Package, optional: true },
        { id: 'financial', label: 'Contract & Fin', icon: CreditCard, optional: true },
        { id: 'reports', label: 'Reports & Certs', icon: FileText, optional: true },
    ]

    const visibleTabs = tabs.filter(t => !t.optional || showAdvanced)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content !p-0 overflow-hidden flex flex-col w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:rounded-2xl rounded-none" onClick={(e) => e.stopPropagation()}>
                <form action={handleSubmit} className="record-form flex-1 min-h-0 flex flex-col">
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                {initialData ? <Building2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 m-0">{initialData ? 'Update Client Details' : 'New Client Master Record'}</h2>
                                <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">Comprehensive fire safety system database</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-100 bg-white overflow-x-auto scroller-hidden items-center px-4">
                        <div className="flex flex-1">
                            {visibleTabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        type="button"
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-[10px] md:text-xs font-bold transition-all border-b-2 hover:bg-slate-50 ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-400'}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAdvanced(!showAdvanced)
                                if (showAdvanced && activeTab !== 'primary') setActiveTab('primary')
                            }}
                            className={`ml-3 px-2 py-1 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${showAdvanced ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'}`}
                        >
                            {showAdvanced ? 'Hide Advanced' : 'Add Details'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-3 pb-20">
                        {error && <p className="error-message bg-red-50 p-3 rounded-lg border border-red-100 mb-6">{error}</p>}

                        <div className="record-form-inner">
                            {/* Tab 1: Primary Info (Lead) */}
                            <div className={activeTab === 'primary' ? 'block' : 'hidden'}>
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="form-group">
                                            <label>Project Name *</label>
                                            <input name="name" required defaultValue={getInit('name')} placeholder="e.g. Sunrise Heights" />
                                        </div>
                                        <div className="form-group">
                                            <label>Developer Name</label>
                                            <input name="developerName" defaultValue={getInit('developer_name')} placeholder="e.g. Acme Realty" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-2">
                                        <div className="form-group"><label>Wings</label><input name="wings" defaultValue={getInit('wings')} list="numSuggest" onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} /></div>
                                        <div className="form-group"><label>Ground</label><input name="groundFloor" defaultValue={getInit('ground_floor')} list="numSuggest" onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} /></div>
                                        <div className="form-group"><label>Stilt</label><input name="stilt" defaultValue={getInit('stilt')} list="numSuggest" onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} /></div>
                                        <div className="form-group"><label>Basement</label><input name="basement" defaultValue={getInit('basement')} list="numSuggest" onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} /></div>
                                        <div className="form-group"><label>Podium</label><input name="podiumCount" defaultValue={getInit('podium_count')} list="numSuggest" onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} /></div>
                                        <div className="form-group"><label>Floors</label><input name="floorCount" defaultValue={getInit('floor_count')} list="numSuggest" onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="form-group">
                                            <label>Address *</label>
                                            <input name="address" required defaultValue={getInit('address')} placeholder="Bldg/Plot No., Street..." />
                                        </div>
                                        <div className="form-group">
                                            <label>Landmark</label>
                                            <input name="landmark" defaultValue={getInit('landmark')} placeholder="Near..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2">
                                        <div className="form-group">
                                            <label>Area *</label>
                                            <input name="area" required defaultValue={getInit('area')} list="mumbaiAreas" placeholder="Kharghar..." onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} />
                                        </div>
                                        <div className="form-group">
                                            <label>District</label>
                                            <input name="district" defaultValue={getInit('district') || 'Mumbai'} />
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <input name="state" defaultValue={getInit('state') || 'Maharashtra'} />
                                        </div>
                                        <div className="form-group">
                                            <label>Pincode</label>
                                            <input name="pincode" defaultValue={getInit('pincode')} placeholder="400..." />
                                        </div>
                                    </div>

                                    {/* New Essential Fields */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select name="category" defaultValue={getInit('category') || 'Residential'}>
                                                <option value="Residential">Residential</option>
                                                <option value="Commercial">Commercial</option>
                                                <option value="Industrial">Industrial</option>
                                                <option value="Institutional">Institutional</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Priority Level</label>
                                            <select name="priority" defaultValue={getInit('priority') || 'Medium'}>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select name="status" defaultValue={getInit('status') || 'Active'}>
                                                <option value="Active">Active</option>
                                                <option value="Standby">Standby</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                                        <label className="text-secondary font-bold">Contact Representative</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="form-group">
                                                <label>Prefix</label>
                                                <select name="contactPrefix" defaultValue={contactPrefix}>
                                                    <option value="Mr.">Mr.</option>
                                                    <option value="Mrs.">Mrs.</option>
                                                    <option value="Ms.">Ms.</option>
                                                    <option value="Dr.">Dr.</option>
                                                </select>
                                            </div>
                                            <div className="form-group col-span-2">
                                                <label>Full Name</label>
                                                <input name="contactName" defaultValue={contactName} placeholder="Authorized Person" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            <div className="form-group">
                                                <label>Mobile Number *</label>
                                                <input name="phone" required defaultValue={getInit('phone')} maxLength={10} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10); }} />
                                            </div>
                                            <div className="form-group">
                                                <label>Email Address</label>
                                                <input type="email" name="email" defaultValue={getInit('email')} />
                                            </div>
                                            <div className="form-group">
                                                <label>Role / Position</label>
                                                <input name="contactPerson" defaultValue={getInit('contact_person')} placeholder="e.g. Chairman, Secretary" list="roleSuggest" onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab 2: Assets */}
                            <div className={activeTab === 'assets' ? 'block' : 'hidden'}>
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="form-group">
                                            <label>System Type</label>
                                            <select name="systemType" defaultValue={getInit('system_type')}>
                                                <option value="Down Comer">Down Comer</option>
                                                <option value="Hydrant">Hydrant</option>
                                                <option value="Hydrant & Sprinkler">Hydrant & Sprinkler</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <label className="mb-2 block">Smoke Detector Locations</label>
                                        <div className="flex flex-row flex-nowrap items-center justify-between gap-1 overflow-x-auto scroller-hidden">
                                            <label className="flex items-center gap-1.5 !normal-case !text-slate-700 !text-[11px] font-medium cursor-pointer whitespace-nowrap">
                                                <input type="checkbox" name="sdMeterRoom" value="true" defaultChecked={getInitBool('sd_meter_room')} className="w-3.5 h-3.5" /> Meter Rm
                                            </label>
                                            <label className="flex items-center gap-1.5 !normal-case !text-slate-700 !text-[11px] font-medium cursor-pointer whitespace-nowrap">
                                                <input type="checkbox" name="sdLiftMachineRoom" value="true" defaultChecked={getInitBool('sd_lift_machine_room')} className="w-3.5 h-3.5" /> Lift Rm
                                            </label>
                                            <label className="flex items-center gap-1.5 !normal-case !text-slate-700 !text-[11px] font-medium cursor-pointer whitespace-nowrap">
                                                <input type="checkbox" name="sdElectricDuct" value="true" defaultChecked={getInitBool('sd_electric_duct')} className="w-3.5 h-3.5" /> Elec Duct
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                        <div className="grid grid-cols-3 gap-2 items-end">
                                            <div className="col-span-2 form-group">
                                                <label>Hydrant Valve</label>
                                                <select name="hydrantValveType" defaultValue={getInit('hydrant_valve_type')}>
                                                    <option value="Single">Single</option>
                                                    <option value="Double">Double</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Qty</label>
                                                <input type="number" name="hydrantValveCount" defaultValue={getInit('hydrant_valve_count')} list="numSuggest" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Hosreel Drum (Qty)</label>
                                            <input type="number" name="hosreelDrumCount" defaultValue={getInit('hosreel_drum_count')} list="numSuggest" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 items-end">
                                            <div className="col-span-2 form-group">
                                                <label>Courtyard Hydrant</label>
                                                <select name="courtyardHydrantValveType" defaultValue={getInit('courtyard_hydrant_valve_type')}>
                                                    <option value="Single">Single</option>
                                                    <option value="Double">Double</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Qty</label>
                                                <input type="number" name="courtyardHydrantValveCount" defaultValue={getInit('courtyard_hydrant_valve_count')} list="numSuggest" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 items-end">
                                            <div className="col-span-2 form-group">
                                                <label>Hosebox</label>
                                                <select name="hoseboxType" defaultValue={getInit('hosebox_type')}>
                                                    <option value="Single">Single</option>
                                                    <option value="Double">Double</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Qty</label>
                                                <input type="number" name="hoseboxCount" defaultValue={getInit('hosebox_count')} list="numSuggest" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Short Branch Pipe</label>
                                            <input type="number" name="shortBranchPipeCount" defaultValue={getInit('short_branch_pipes')} list="numSuggest" />
                                        </div>
                                        <div className="form-group">
                                            <label>Canvas Hosepipe</label>
                                            <input type="number" name="canvasHosepipeCount" defaultValue={getInit('canvas_hosepipe_count')} list="numSuggest" />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Manual Extinguishers</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="form-group"><label>ABC Qty</label><input type="number" name="fireExtinguisherAbcQty" defaultValue={getInit('fire_extinguisher_abc')} /></div>
                                            <div className="form-group"><label>Co2 Qty</label><input type="number" name="fireExtinguisherCo2Qty" defaultValue={getInit('fire_extinguisher_co2')} /></div>
                                            <div className="form-group"><label>Clean Agent</label><input type="number" name="fireExtinguisherCleanAgentQty" defaultValue={getInit('fire_extinguisher_clean_agent')} /></div>
                                        </div>
                                        <div className="form-group">
                                            <label>Extinguisher Expiry Date</label>
                                            <input type="date" name="extinguisherExpiryDate" defaultValue={getInit('extinguisher_expiry_date')} />
                                        </div>
                                    </div>

                                    {/* Merged Pumps Section */}
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                                            <Droplets className="w-3 h-3" /> Pump Inventory
                                        </h4>
                                        <div className="form-group">
                                            <label>Pump Technology</label>
                                            <div className="flex gap-2 p-1.5 bg-white/50 rounded-xl border border-slate-200/50">
                                                <label className="flex-1 flex items-center justify-center gap-2 p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 cursor-pointer text-[11px] font-bold text-slate-600">
                                                    <input type="radio" name="pumpType" value="Centrifugal" defaultChecked={getInit('pump_type') !== 'Submersible'} /> Centrifugal
                                                </label>
                                                <label className="flex-1 flex items-center justify-center gap-2 p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 cursor-pointer text-[11px] font-bold text-slate-600">
                                                    <input type="radio" name="pumpType" value="Submersible" defaultChecked={getInit('pump_type') === 'Submersible'} /> Submersible
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            <div className="form-group"><label className="!text-[9px]">Hydrant</label><input type="number" name="pumpHydrant" defaultValue={getInit('pump_hydrant')} className="!py-1.5" /></div>
                                            <div className="form-group"><label className="!text-[9px]">Sprinkler</label><input type="number" name="pumpSprinkler" defaultValue={getInit('pump_sprinkler')} className="!py-1.5" /></div>
                                            <div className="form-group"><label className="!text-[9px]">Hydrant Jky</label><input type="number" name="pumpHydrantJockey" defaultValue={getInit('pump_hydrant_jockey')} className="!py-1.5" /></div>
                                            <div className="form-group"><label className="!text-[9px]">Spklr Jky</label><input type="number" name="pumpSprinklerJockey" defaultValue={getInit('pump_sprinkler_jockey')} className="!py-1.5" /></div>
                                            <div className="form-group"><label className="!text-[9px]">Stby Hyd</label><input type="number" name="pumpStandbyHydrant" defaultValue={getInit('pump_standby_hydrant')} className="!py-1.5" /></div>
                                            <div className="form-group"><label className="!text-[9px]">Stby Spk</label><input type="number" name="pumpStandbySprinkler" defaultValue={getInit('pump_standby_sprinkler')} className="!py-1.5" /></div>
                                            <div className="form-group"><label className="!text-[9px]">Stby Jky</label><input type="number" name="pumpStandbyJockey" defaultValue={getInit('pump_standby_jockey')} className="!py-1.5" /></div>
                                            <div className="form-group"><label className="!text-[9px]">Booster</label><input type="number" name="pumpBooster" defaultValue={getInit('pump_booster')} className="!py-1.5" /></div>
                                        </div>
                                    </div>

                                    {/* Merged Coverage Section */}
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                                            <Activity className="w-3 h-3" /> Sprinkler Coverage Matrix
                                        </h4>
                                        <div className="divide-y divide-slate-200/50 bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
                                            {[
                                                { id: 'ssGround', label: 'Ground', col: 'ss_ground' },
                                                { id: 'ssBasement', label: 'Bsmnt', col: 'ss_basement' },
                                                { id: 'ssPodium', label: 'Podium', col: 'ss_podium' },
                                                { id: 'ssLiftLobby', label: 'Lobbies', col: 'ss_lift_lobby' },
                                                { id: 'ssFlat', label: 'Interiors', col: 'ss_flat' },
                                            ].map((row) => (
                                                <div key={row.id} className="flex items-center justify-between p-3">
                                                    <span className="text-[11px] font-bold text-slate-600">{row.label}</span>
                                                    <div className="flex gap-2">
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input type="radio" name={row.id} value="true" defaultChecked={getInitBool(row.col)} className="w-3.5 h-3.5 accent-primary" />
                                                            <span className="text-[10px] font-bold text-slate-500">YES</span>
                                                        </label>
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input type="radio" name={row.id} value="false" defaultChecked={!getInitBool(row.col)} className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-bold text-slate-500">NO</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Moved Alarm System to Bottom */}
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="form-group">
                                            <label>Alarm System Type</label>
                                            <select name="alarmSystem" defaultValue={getInit('alarm_system')}>
                                                <option value="N/A">N/A</option>
                                                <option value="Conventional">Conventional</option>
                                                <option value="PA">PA</option>
                                                <option value="Addressable">Addressable</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financials Tab */}
                            <div className={activeTab === 'financial' ? 'block' : 'hidden'}>
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="form-group">
                                            <label>AMC Start Date</label>
                                            <input type="date" name="amcStartDate" value={amcStart} onChange={(e) => setAmcStart(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>AMC End Date (Auto)</label>
                                            <input type="date" name="amcEndDate" value={amcEnd} readOnly className="bg-slate-50 font-bold text-primary" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="form-group">
                                            <label>Service Plan Type</label>
                                            <select name="servicePlan" value={servicePlan} onChange={(e) => setServicePlan(e.target.value)}>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Quarterly">Quarterly</option>
                                                <option value="Half Yearly">Half Yearly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Plan Duration</label>
                                            <select name="contractDuration" value={contractDuration} onChange={(e) => setContractDuration(e.target.value)}>
                                                <option value="">Select Years</option>
                                                <option value="1">1 Year</option>
                                                <option value="2">2 Years</option>
                                                <option value="3">3 Years</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                        <div className="form-group">
                                            <label className="text-primary">Next Maintenance (Auto)</label>
                                            <input type="date" name="nextServiceDisplay" value={nextService} readOnly className="bg-white/50 font-bold text-primary" />
                                        </div>
                                        <div className="form-group">
                                            <label className="text-primary">Refilling Due (Auto)</label>
                                            <input type="date" name="nextRefillingDisplay" value={nextRefilling} readOnly className="bg-white/50 font-bold text-primary" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 border-t border-slate-100">
                                        <div className="form-group">
                                            <label>Contract Value (Total ₹)</label>
                                            <input type="number" name="contractValue" defaultValue={getInit('contract_value')} />
                                        </div>
                                        <div className="form-group">
                                            <label>Sales Representative</label>
                                            <input name="salesPerson" defaultValue={getInit('sales_person')} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Lead Source</label>
                                        <select name="clientReference" value={referenceType} onChange={(e) => setReferenceType(e.target.value)}>
                                            <option value="WOM">Word of Mouth</option>
                                            <option value="Justdial">Justdial</option>
                                            <option value="Website">Website</option>
                                            <option value="DTD Letter">DTD Letter</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Tab 4: Reports & Compliance */}
                            <div className={activeTab === 'reports' ? 'block' : 'hidden'}>
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">Compliance Status: Maintenance Phase</p>
                                            <p className="text-[10px] text-emerald-600 font-medium">Monitoring quarterly service cycles and mandatory certificates.</p>
                                        </div>
                                    </div>

                                    {/* Quarterly Service Schedule */}
                                    <div className="space-y-2">
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                                            <CalendarCheck className="w-3.5 h-3.5" /> Quarterly Service Schedule (AMC)
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {allSchedules.map((dateStr, idx) => {
                                                const d = new Date(dateStr)
                                                const formatted = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                const isReminderActive = new Date(new Date().setDate(new Date().getDate() + 15)) >= d && new Date() <= d;

                                                return (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase">V{idx + 1}</span>
                                                                <span className="text-[10px] font-bold text-slate-700">SRV</span>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-xs font-bold text-slate-900">{formatted}</p>
                                                                    {isReminderActive && (
                                                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[8px] font-bold border border-amber-100 animate-pulse">
                                                                            <BellRing className="w-2.5 h-2.5" /> REMINDER ACTIVE
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                                    {isHolidayOrSunday(d) ? 'Holiday Adjustment Needed' : 'Scheduled Maintenance Visit'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 items-end">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase pr-1">Upload via</span>
                                                            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                                {/* Camera - capture component */}
                                                                <label className="cursor-pointer p-1.5 hover:bg-white hover:text-primary hover:shadow-sm rounded-md text-slate-500 transition-all" title="Camera">
                                                                    <Camera className="w-3.5 h-3.5" />
                                                                    <input type="file" accept="image/*" capture="environment" className="hidden" />
                                                                </label>
                                                                {/* Gallery - images */}
                                                                <label className="cursor-pointer p-1.5 hover:bg-white hover:text-primary hover:shadow-sm rounded-md text-slate-500 transition-all border-l border-slate-200" title="Gallery">
                                                                    <ImageIcon className="w-3.5 h-3.5" />
                                                                    <input type="file" accept="image/*" className="hidden" />
                                                                </label>
                                                                {/* Files - documents */}
                                                                <label className="cursor-pointer p-1.5 hover:bg-white hover:text-primary hover:shadow-sm rounded-md text-slate-500 transition-all border-l border-slate-200" title="Files">
                                                                    <FolderOpen className="w-3.5 h-3.5" />
                                                                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Mandatory Certificates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Fire Safety Certificates</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'Form B - January Cycle', period: 'Jan - Jun' },
                                                    { label: 'Form B - July Cycle', period: 'Jul - Dec' }
                                                ].map((cert, i) => (
                                                    <div key={i} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-700">{cert.label}</p>
                                                            <p className="text-[9px] text-slate-400 uppercase font-medium">Period: {cert.period}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                                            <label className="cursor-pointer p-1.5 hover:text-primary rounded-md text-slate-400 transition-all" title="Camera">
                                                                <Camera className="w-3.5 h-3.5" />
                                                                <input type="file" accept="image/*" capture="environment" className="hidden" />
                                                            </label>
                                                            <label className="cursor-pointer p-1.5 hover:text-primary rounded-md text-slate-400 transition-all border-l border-slate-100" title="Gallery">
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                                <input type="file" accept="image/*" className="hidden" />
                                                            </label>
                                                            <label className="cursor-pointer p-1.5 hover:text-primary rounded-md text-slate-400 transition-all border-l border-slate-100" title="Files">
                                                                <FolderOpen className="w-3.5 h-3.5" />
                                                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Other Reports</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'Breakdown Reports', count: 0 },
                                                    { label: 'Wear & Tear List', count: 0 }
                                                ].map((report, i) => (
                                                    <div key={i} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-700">{report.label}</p>
                                                            <p className="text-[9px] text-slate-400 uppercase font-medium">{report.count} Documents Linked</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                                            <label className="cursor-pointer p-1.5 hover:text-primary rounded-md text-slate-400 transition-all" title="Camera">
                                                                <Camera className="w-3.5 h-3.5" />
                                                                <input type="file" accept="image/*" capture="environment" className="hidden" />
                                                            </label>
                                                            <label className="cursor-pointer p-1.5 hover:text-primary rounded-md text-slate-400 transition-all border-l border-slate-100" title="Gallery">
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                                <input type="file" accept="image/*" className="hidden" />
                                                            </label>
                                                            <label className="cursor-pointer p-1.5 hover:text-primary rounded-md text-slate-400 transition-all border-l border-slate-100" title="Files">
                                                                <FolderOpen className="w-3.5 h-3.5" />
                                                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-white border-t border-slate-100 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                            Cancel
                        </button>
                        <div className="flex gap-2">
                            {activeTab !== 'primary' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = visibleTabs.findIndex(t => t.id === activeTab)
                                        setActiveTab(visibleTabs[currentIndex - 1].id)
                                    }}
                                    className="hidden md:block px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Back
                                </button>
                            )}
                            {activeTab !== visibleTabs[visibleTabs.length - 1].id && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = visibleTabs.findIndex(t => t.id === activeTab)
                                        setActiveTab(visibleTabs[currentIndex + 1].id)
                                    }}
                                    className="hidden md:block px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Next Tab
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (initialData ? 'Update Record' : 'Save Client')}
                            </button>
                        </div>
                    </div>
                </form>

                <datalist id="mumbaiAreas">
                    <option value="Dahisar" /><option value="Borivali" /><option value="Kandivali" /><option value="Malad" /><option value="Goregaon" /><option value="Andheri" /><option value="Bandra" /><option value="Worli" /><option value="Colaba" /><option value="Dadar" />
                </datalist>
                <datalist id="numSuggest">
                    <option value="0" /><option value="1" /><option value="2" /><option value="3" /><option value="4" /><option value="5" /><option value="10" /><option value="20" />
                </datalist>
                <datalist id="roleSuggest">
                    <option value="Chairman" /><option value="Secretary" /><option value="Treasurer" /><option value="Manager" /><option value="Owner" /><option value="Security Head" /><option value="Admin" />
                </datalist>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 0;
                }
                @media (min-width: 768px) {
                    .modal-overlay { padding: 20px; }
                }
                .modal-content {
                    background: #ffffff;
                    width: 100%; max-width: 900px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .scroller-hidden::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .record-form { display: flex; flex-direction: column; }
                .form-group { display: flex; flex-direction: column; gap: 2px; }
                label { font-size: 8px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2px; }
                input:not([type="radio"]):not([type="checkbox"]), select, textarea {
                    padding: 4px 8px !important; background: #fff !important;
                    border: 1px solid #e2e8f0 !important; border-radius: 6px !important;
                    color: #0f172a !important; font-size: 13px !important; outline: none !important;
                    transition: all 0.2s !important; font-family: inherit !important;
                    width: 100% !important; height: 32px !important; line-height: 1 !important;
                }
                input:focus, select:focus, textarea:focus { 
                    border-color: #e11d48; 
                    background: #ffffff;
                    box-shadow: 0 0 0 2px rgba(225, 29, 72, 0.1);
                }
                .error-message { color: #ef4444; font-size: 13px; font-weight: 600; }
            `}</style>
        </div>
    )
}
