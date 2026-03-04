'use client'

import React, { useState } from 'react'
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Trash2,
    Edit3,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Briefcase
} from 'lucide-react'
import Link from 'next/link'

// Mock Data
const MOCK_SCHEDULES = [
    { id: 1, title: 'Client Meeting - ABC Corp', type: 'Meeting', time: '10:00 AM - 11:30 AM', date: '2026-03-02', location: 'Office Room A', attendees: 3, status: 'Scheduled', priority: 'High' },
    { id: 2, title: 'Site Inspection', type: 'Site Visit', time: '02:00 PM - 04:00 PM', date: '2026-03-02', location: 'Downtown Project Site', attendees: 1, status: 'In Progress', priority: 'Medium' },
    { id: 3, title: 'Monthly Reviews', type: 'Internal', time: '04:30 PM - 05:30 PM', date: '2026-03-02', location: 'Zoom', attendees: 5, status: 'Scheduled', priority: 'Low' },
    { id: 4, title: 'Project Scoping', type: 'Meeting', time: '09:00 AM - 10:30 AM', date: '2026-03-03', location: 'Conference Hall', attendees: 4, status: 'Upcoming', priority: 'High' },
]

const MOCK_CLIENTS = ['ABC Corp', 'Runwal Anthurium', 'Lodha Bellezza', 'Hiranandani Gardens', 'Oberoi Realty', 'Tata Prive']
const MOCK_TOOLS = [
    'Ladder (10ft)', 'Pipe Wrench', 'Hydrant Key', 'Refilling Kit', 'Drill Machine',
    'Welding Machine', 'Grinder Machine', 'Nut Bolt', 'Gasket (3")', 'Gasket (4")',
    'Gasket (6")', 'Pipe GI (3")', 'Pipe GI (4")', 'Pipe GI (6")', 'Hydrant Hose'
]

const TASK_TYPES = [
    { label: 'Extinguisher Refilling', value: 'refilling' },
    { label: 'Extinguisher Installation', value: 'installation' },
    { label: 'Site Inspection', value: 'inspection' },
    { label: 'Breakdown Call', value: 'breakdown' },
    { label: 'Leakage', value: 'leakage', subTypes: ['Hydrant Valve', 'Butterfly Valve', 'Wall Leakage', 'Pipe Joint'] },
    { label: 'Replacement', value: 'replacement' },
    { label: 'Internal Task', value: 'internal' }
]

export default function SchedulePage() {
    const [tasks, setTasks] = useState(MOCK_SCHEDULES)
    const [isAdding, setIsAdding] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDay, setSelectedDay] = useState<string>('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'site' | 'urgent'>('all')
    const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')
    const [statusReasonModal, setStatusReasonModal] = useState<{ id: number, status: string } | null>(null)
    const [activeActionMenu, setActiveActionMenu] = useState<number | null>(null)
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())
    const [editingTask, setEditingTask] = useState<any | null>(null)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filters, setFilters] = useState<{
        types: string[],
        statuses: string[],
        priorities: string[]
    }>({
        types: [],
        statuses: [],
        priorities: []
    })

    // Form states
    const [newTitle, setNewTitle] = useState('')
    const [newType, setNewType] = useState('Meeting')
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')
    const [newLocation, setNewLocation] = useState('')
    const [newAttendees, setNewAttendees] = useState(1)
    const [newPriority, setNewPriority] = useState('Normal')
    const [newTool, setNewTool] = useState('')
    const [selectedType, setSelectedType] = useState<string>('')

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? {
                ...t,
                title: newTitle,
                type: newType,
                date: newDate,
                time: newTime,
                location: newLocation,
                attendees: newAttendees,
                priority: newPriority,
                specialTools: newTool
            } : t))
            setEditingTask(null)
        } else {
            const newTask = {
                id: tasks.length + 1,
                title: newTitle || 'Untitled Task',
                type: newType,
                date: newDate || new Date().toISOString().split('T')[0],
                time: newTime || '09:00 AM',
                location: newLocation || 'Not Specified',
                attendees: newAttendees,
                status: 'Scheduled',
                priority: newPriority,
                specialTools: newTool
            }
            setTasks([newTask, ...tasks])
        }
        setIsAdding(false)
        resetForm()
    }

    const resetForm = () => {
        setNewTitle('')
        setNewType('Meeting')
        setNewDate('')
        setNewTime('')
        setNewLocation('')
        setNewAttendees(1)
        setNewPriority('Normal')
        setNewTool('')
        setSelectedType('')
    }

    const clearAllFilters = () => {
        setFilters({ types: [], statuses: [], priorities: [] })
        setSelectedDay('')
        setActiveFilter('all')
        setSearchTerm('')
    }

    const handleEditClick = (task: any) => {
        setEditingTask(task)
        setNewTitle(task.title)
        setNewType(task.type)
        setNewDate(task.date)
        setNewTime(task.time)
        setNewLocation(task.location)
        setNewAttendees(task.attendees)
        setNewPriority(task.priority)
        setNewTool(task.specialTools || '')
        setSelectedType(TASK_TYPES.find(t => t.label === task.type)?.value || '')
        setIsAdding(true)
        setActiveActionMenu(null)
    }

    const handleDeleteTask = (id: number) => {
        if (confirm('Are you sure you want to delete this task?')) {
            setTasks(tasks.filter(t => t.id !== id))
            setActiveActionMenu(null)
        }
    }

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedTasks)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedTasks(newExpanded)
    }

    const getWeekDates = () => {
        const now = new Date()
        const day = now.getDay()
        const diff = now.getDate() - day
        const sunday = new Date(now.setDate(diff))

        return days.map((_, i) => {
            const d = new Date(sunday)
            d.setDate(sunday.getDate() + i)
            return {
                name: days[i],
                date: d.getDate(),
                fullDate: d.toISOString().split('T')[0]
            }
        })
    }

    const weekDates = getWeekDates()

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.location.toLowerCase().includes(searchTerm.toLowerCase())

        // Robust date parsing to avoid timezone shifts
        const [year, month, day] = task.date.split('-').map(Number)
        const taskDate = new Date(year, month - 1, day)
        const taskDayName = days[taskDate.getDay()]

        const matchesDay = selectedDay ? taskDayName === selectedDay : true

        const todayStr = new Date().toISOString().split('T')[0]
        const matchesFilter =
            activeFilter === 'today' ? task.date === todayStr :
                activeFilter === 'site' ? task.type === 'Site Visit' :
                    activeFilter === 'urgent' ? task.priority === 'High' || task.priority === 'Critical' :
                        true

        const matchesAdvancedFilters =
            (filters.types.length === 0 || filters.types.includes(task.type)) &&
            (filters.statuses.length === 0 || filters.statuses.includes(task.status)) &&
            (filters.priorities.length === 0 || filters.priorities.includes(task.priority))

        return matchesSearch && matchesDay && matchesFilter && matchesAdvancedFilters
    }).sort((a, b) => {
        const todayStr = new Date().toISOString().split('T')[0]
        if (a.date === todayStr && b.date !== todayStr) return -1
        if (b.date === todayStr && a.date !== todayStr) return 1
        if ((a.priority === 'High' || a.priority === 'Critical') && (b.priority !== 'High' && b.priority !== 'Critical')) return -1
        return 0
    })

    const getMonthDays = () => {
        const now = new Date()
        const month = now.getMonth()
        const year = now.getFullYear()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const monthDays = []
        // Padding for previous month
        for (let i = 0; i < firstDay; i++) monthDays.push(null)
        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
            monthDays.push({
                day: i,
                dateStr,
                tasks: tasks.filter(t => t.date === dateStr)
            })
        }
        return monthDays
    }

    const stats = {
        today: tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).length,
        site: tasks.filter(t => t.type === 'Site Visit').length,
        urgent: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length
    }

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Link href="/dashboard/team" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HRMS / Team</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Task Scheduling</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Task Schedule</h1>
                        <p className="text-sm text-slate-500 mt-1">Plan, manage, and track team movements and meetings.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'timeline' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Calendar
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            resetForm()
                            setEditingTask(null)
                            setIsAdding(true)
                        }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Task Schedule
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => {
                        setActiveFilter(activeFilter === 'today' ? 'all' : 'today')
                        setSelectedDay('') // Reset day when clicking stats
                    }}
                    className={`bg-white p-5 rounded-3xl border transition-all text-left group ${activeFilter === 'today' ? 'ring-2 ring-indigo-500 border-transparent shadow-md' : 'border-slate-100 hover:border-indigo-200 shadow-sm'}`}
                >
                    <div className="flex items-center gap-3 mb-2 text-indigo-500">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Today's Tasks</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800">{String(stats.today).padStart(2, '0')}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Click to focus</div>
                </button>

                <button
                    onClick={() => {
                        setActiveFilter(activeFilter === 'site' ? 'all' : 'site')
                        setSelectedDay('') // Reset day when clicking stats
                    }}
                    className={`bg-white p-5 rounded-3xl border transition-all text-left group ${activeFilter === 'site' ? 'ring-2 ring-emerald-500 border-transparent shadow-md' : 'border-slate-100 hover:border-emerald-200 shadow-sm'}`}
                >
                    <div className="flex items-center gap-3 mb-2 text-emerald-500">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Site Visits</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800">{String(stats.site).padStart(2, '0')}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Across various locations</div>
                </button>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-200 transition-all">
                    <div className="flex items-center gap-3 mb-2 text-amber-500">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Time</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800">2.5h</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Efficiency tracking</div>
                </div>

                <button
                    onClick={() => {
                        setActiveFilter(activeFilter === 'urgent' ? 'all' : 'urgent')
                        setSelectedDay('') // Reset day when clicking stats
                    }}
                    className={`bg-white p-5 rounded-3xl border transition-all text-left group ${activeFilter === 'urgent' ? 'ring-2 ring-primary border-transparent shadow-md' : 'border-slate-100 hover:border-primary/20 shadow-sm'}`}
                >
                    <div className="flex items-center gap-3 mb-2 text-primary">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Urgent</span>
                    </div>
                    <div className="text-2xl font-black text-slate-800">{String(stats.urgent).padStart(2, '0')}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Immediate attention</div>
                </button>
            </div>

            {/* Day and Tab Navigation */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 w-full md:w-auto">
                        <button
                            onClick={() => setSelectedDay('')}
                            className={`flex-1 md:w-20 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${selectedDay === ''
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            All
                        </button>
                        {weekDates.map((wd: { name: string, date: number, fullDate: string }) => (
                            <button
                                key={wd.name}
                                onClick={() => {
                                    setSelectedDay(wd.name)
                                    setActiveFilter('all')
                                }}
                                className={`flex-1 md:w-24 py-2 px-3 rounded-xl transition-all border ${selectedDay === wd.name
                                    ? 'bg-white text-primary shadow-sm border-slate-200 ring-1 ring-primary/5'
                                    : 'text-slate-500 hover:text-slate-700 border-transparent hover:bg-slate-50'
                                    }`}
                            >
                                <div className="text-[9px] font-black uppercase tracking-tighter opacity-50">{wd.name}</div>
                                <div className="text-sm font-black tracking-tight">{String(wd.date).padStart(2, '0')}</div>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Search schedules..."
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${isFilterOpen || filters.types.length > 0 || filters.statuses.length > 0 || filters.priorities.length > 0
                                    ? 'bg-primary/5 text-primary border-primary/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Filter {(filters.types.length + filters.statuses.length + filters.priorities.length) > 0 && `(${filters.types.length + filters.statuses.length + filters.priorities.length})`}
                            </button>

                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                                    <div className="absolute right-0 top-12 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="space-y-6">
                                            <div>
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Task Category</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Meeting', 'Site Visit', 'Internal'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => {
                                                                const newTypes = filters.types.includes(type)
                                                                    ? filters.types.filter(t => t !== type)
                                                                    : [...filters.types, type]
                                                                setFilters({ ...filters, types: newTypes })
                                                            }}
                                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${filters.types.includes(type)
                                                                ? 'bg-primary text-white'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Scheduled', 'In Progress', 'Completed', 'Delayed'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => {
                                                                const newStatuses = filters.statuses.includes(status)
                                                                    ? filters.statuses.filter(s => s !== status)
                                                                    : [...filters.statuses, status]
                                                                setFilters({ ...filters, statuses: newStatuses })
                                                            }}
                                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${filters.statuses.includes(status)
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Priority</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Low', 'Medium', 'High', 'Critical'].map(prio => (
                                                        <button
                                                            key={prio}
                                                            onClick={() => {
                                                                const newPriorities = filters.priorities.includes(prio)
                                                                    ? filters.priorities.filter(p => p !== prio)
                                                                    : [...filters.priorities, prio]
                                                                setFilters({ ...filters, priorities: newPriorities })
                                                            }}
                                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${filters.priorities.includes(prio)
                                                                ? 'bg-rose-500 text-white'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {prio}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-50 flex gap-3">
                                                <button
                                                    onClick={() => setFilters({ types: [], statuses: [], priorities: [] })}
                                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={() => setIsFilterOpen(false)}
                                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'timeline' ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Task Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Team & Tools</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Schedule</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                                    <React.Fragment key={task.id}>
                                        <tr className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => toggleExpand(task.id)}
                                                        className={`p-1 rounded-lg hover:bg-slate-200 transition-all ${expandedTasks.has(task.id) ? 'rotate-180 text-primary' : 'text-slate-400'}`}
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border ${task.type === 'Meeting' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' :
                                                        task.type === 'Site Visit' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                            'bg-emerald-50 text-emerald-500 border-emerald-100'
                                                        }`}>
                                                        {task.type === 'Meeting' ? '🤝' : task.type === 'Site Visit' ? '🏗️' : '💼'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{task.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.type}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                                <MapPin className="w-3 h-3" />
                                                                {task.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                        <Users className="w-3.5 h-3.5 text-primary/60" />
                                                        <span>{task.attendees} Member(s)</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-[10px] font-bold ${task.priority === 'High' || task.priority === 'Critical' ? 'text-primary' : 'text-slate-400'}`}>
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        <span>{(task as any).specialTools || (task.priority === 'High' || task.priority === 'Critical' ? 'Special Tools Req.' : 'Standard Kit')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        {new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {task.time}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <select
                                                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest appearance-none cursor-pointer border-none focus:ring-0 ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                        task.status === 'In Progress' ? 'bg-amber-50 text-amber-600' :
                                                            task.status === 'Delayed' ? 'bg-rose-50 text-rose-600' :
                                                                'bg-slate-100 text-slate-600'
                                                        }`}
                                                    value={task.status}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value
                                                        if (['Delayed', 'Cancelled', 'Postponed'].includes(newStatus)) {
                                                            setStatusReasonModal({ id: task.id, status: newStatus })
                                                        } else {
                                                            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
                                                        }
                                                    }}
                                                >
                                                    <option value="Scheduled">Scheduled</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Delayed">Delayed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Postponed">Postponed</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-5 text-right relative">
                                                <button
                                                    onClick={() => setActiveActionMenu(activeActionMenu === task.id ? null : task.id)}
                                                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {activeActionMenu === task.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveActionMenu(null)}
                                                        ></div>
                                                        <div className="absolute right-6 top-14 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                            <button
                                                                onClick={() => handleEditClick(task)}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                                            >
                                                                <Edit3 className="w-4 h-4 text-indigo-500" />
                                                                Modify Schedule
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTask(task.id)}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Remove Task
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                        {expandedTasks.has(task.id) && (
                                            <tr className="bg-slate-50/30">
                                                <td colSpan={5} className="px-6 py-8 border-b border-slate-100">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Notes</h5>
                                                                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 italic">
                                                                    {task.title} at {task.location}. Task is currently {task.status.toLowerCase()}.
                                                                    Please ensure all safety protocols are followed and team has necessary clearance.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resource Allocation</h5>
                                                                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Count</span>
                                                                        <span className="text-xs font-black text-slate-700">{task.attendees} Members</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Tools</span>
                                                                        <span className="text-xs font-black text-primary">{(task as any).specialTools || 'Standard Kit'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule Verification</h5>
                                                                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                                        <CheckCircle2 className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Slot</div>
                                                                        <div className="text-xs font-bold text-slate-500 mt-0.5">{task.time}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <Filter className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-400">No tasks found for the current filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
                    <div className="grid grid-cols-7 border-b border-slate-100 mb-4 pb-4">
                        {days.map(d => (
                            <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        {getMonthDays().map((d, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    if (d) {
                                        const date = new Date(d.dateStr)
                                        setSelectedDay(days[date.getDay()])
                                        setViewMode('timeline')
                                    }
                                }}
                                className={`min-h-[120px] p-4 rounded-3xl border transition-all ${!d ? 'bg-slate-50/30 border-transparent opacity-30' :
                                    d.dateStr === new Date().toISOString().split('T')[0]
                                        ? 'bg-primary/5 border-primary/20 shadow-inner'
                                        : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-xl hover:border-primary/20 cursor-pointer group'}`}
                            >
                                {d && (
                                    <>
                                        <div className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">{d.day}</div>
                                        <div className="mt-2 space-y-1">
                                            {d.tasks.map(t => (
                                                <div key={t.id} className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[9px] font-bold truncate ${t.type === 'Meeting' ? 'bg-indigo-50 text-indigo-600' :
                                                    t.type === 'Site Visit' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    <span className="shrink-0">{t.type === 'Meeting' ? '🤝' : t.type === 'Site Visit' ? '🏗️' : '💼'}</span>
                                                    <span className="truncate">{t.title}</span>
                                                </div>
                                            ))}
                                            {d.tasks.length === 0 && <div className="text-[10px] text-slate-300 font-medium italic mt-4 opacity-0 group-hover:opacity-100 transition-opacity">No tasks</div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team Summary Section */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 px-2">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Team Summary</h3>
                    <div className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live View</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/60 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 bg-indigo-100/50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">Available</span>
                        </div>
                        <h4 className="font-black text-slate-900 mb-1">Rohan Dixit</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senior Technician • Site A</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/60 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 bg-emerald-100/50 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">On Site</span>
                        </div>
                        <h4 className="font-black text-slate-900 mb-1">Deepak Patel</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Engineer • Runwal Project</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/60 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 bg-amber-100/50 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest">In Transit</span>
                        </div>
                        <h4 className="font-black text-slate-900 mb-1">Suraj Mehta</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Staff • 02 Tasks Left Today</p>
                    </div>
                </div>
            </div>

            {/* Add Schedule Modal Overlay */}
            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-inner shadow-primary/5">
                                {editingTask ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingTask ? 'Modify Task Schedule' : 'Add Task Schedule'}</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium italic">{editingTask ? 'Adjust details for this team mobilization.' : 'Enter details for team mobilization.'}</p>
                        </div>

                        <form onSubmit={handleAddTask} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title / Brief</label>
                                    <input
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g. Refilling Walkthrough at Site B"
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site / Client Select</label>
                                    <input
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        list="clients"
                                        placeholder="Type client/site name..."
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                                    />
                                    <datalist id="clients">
                                        {MOCK_CLIENTS.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Category</label>
                                    <select
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 appearance-none"
                                        onChange={(e) => {
                                            setSelectedType(e.target.value)
                                            setNewType(TASK_TYPES.find(t => t.value === e.target.value)?.label || 'Other')
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>

                                {selectedType === 'leakage' && (
                                    <div className="space-y-1.5 animate-in slide-in-from-left-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leakage Sub-type</label>
                                        <select className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 appearance-none">
                                            {TASK_TYPES.find(t => t.value === 'leakage')?.subTypes?.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                                    <select
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 appearance-none"
                                    >
                                        <option>Normal</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical / Emergency</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution Date</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Range</label>
                                    <input
                                        list="times"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        placeholder="09:00 AM - 11:00 AM"
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                                    />
                                    <datalist id="times">
                                        <option value="09:00 AM - 11:00 AM" />
                                        <option value="11:00 AM - 01:00 PM" />
                                        <option value="02:00 PM - 04:00 PM" />
                                        <option value="04:00 PM - 06:00 PM" />
                                    </datalist>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Required</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newAttendees}
                                        onChange={(e) => setNewAttendees(Number(e.target.value))}
                                        placeholder="Number of persons"
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Tool Req.</label>
                                    <input
                                        list="tools"
                                        value={newTool}
                                        onChange={(e) => setNewTool(e.target.value)}
                                        placeholder="e.g. Drill Machine..."
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                                    />
                                    <datalist id="tools">
                                        {MOCK_TOOLS.map(t => <option key={t} value={t} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-4 py-4 rounded-2xl text-xs font-black text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all active:scale-95 uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-4 rounded-2xl text-xs font-black text-white bg-primary hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-widest"
                                >
                                    {editingTask ? 'Apply Changes' : 'Set Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Reason Modal */}
            {statusReasonModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${statusReasonModal.status === 'Delayed' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                                }`}>
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">Log {statusReasonModal.status} Reason</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Please provide a reason for the schedule adjustment.</p>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                rows={4}
                                placeholder="State the reason here..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-800"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStatusReasonModal(null)}
                                    className="flex-1 py-3.5 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => {
                                        setTasks(tasks.map(t => t.id === statusReasonModal.id ? { ...t, status: statusReasonModal.status } : t))
                                        setStatusReasonModal(null)
                                    }}
                                    className="flex-1 py-3.5 rounded-xl text-xs font-black text-white bg-primary shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    Confirm Change
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
