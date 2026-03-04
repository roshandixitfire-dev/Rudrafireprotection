'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import Link from 'next/link'

// Mock Data
const MOCK_SCHEDULES = [
    { id: 1, title: 'Client Meeting - ABC Corp', type: 'Meeting', time: '10:00 AM - 11:30 AM', location: 'Office Room A', attendees: 3 },
    { id: 2, title: 'Site Inspection', type: 'Site Visit', time: '02:00 PM - 04:00 PM', location: 'Downtown Project Site', attendees: 1 },
    { id: 3, title: 'Monthly Reviews', type: 'Internal', time: '04:30 PM - 05:30 PM', location: 'Zoom', attendees: 5 },
]

export default function EmployeeSchedule() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [mounted, setMounted] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [schedules, setSchedules] = useState(MOCK_SCHEDULES)

    useEffect(() => setMounted(true), [])

    const nextDay = () => {
        const d = new Date(currentDate)
        d.setDate(d.getDate() + 1)
        setCurrentDate(d)
    }

    const prevDay = () => {
        const d = new Date(currentDate)
        d.setDate(d.getDate() - 1)
        setCurrentDate(d)
    }

    const isToday = currentDate.toDateString() === new Date().toDateString()

    const handleAddSchedule = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const newItem = {
            id: Date.now(),
            title: formData.get('title') as string,
            type: formData.get('type') as string,
            time: formData.get('time') as string,
            location: formData.get('location') as string,
            attendees: 1
        }
        setSchedules([newItem, ...schedules])
        setIsAdding(false)
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <Link href="/dashboard/team/schedule" className="group flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        My Schedule
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5" />
                </Link>

                <button
                    onClick={() => setIsAdding(true)}
                    className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-500 flex items-center justify-center transition-all text-blue-600 hover:text-white shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Add Schedule Modal / Overlay */}
            {isAdding && (
                <div className="absolute inset-0 bg-white/95 z-50 rounded-3xl p-6 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-black text-slate-800 uppercase tracking-tight">Add New Schedule</h4>
                        <button onClick={() => setIsAdding(false)} className="text-xs font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest">Close</button>
                    </div>
                    <form onSubmit={handleAddSchedule} className="space-y-4">
                        <input name="title" required placeholder="Event Title" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        <div className="grid grid-cols-2 gap-3">
                            <select name="type" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option>Meeting</option>
                                <option>Site Visit</option>
                                <option>Internal</option>
                            </select>
                            <input name="time" required placeholder="10:00 AM - 11:30 AM" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <input name="location" required placeholder="Location / Zoom Link" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest">Create Event</button>
                    </form>
                </div>
            )}

            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-6">
                <button onClick={prevDay} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-800">
                        {mounted ? (isToday ? 'Today' : currentDate.toLocaleDateString([], { weekday: 'long' })) : '---'}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {mounted ? currentDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                    </p>
                </div>
                <button onClick={nextDay} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Timeline View */}
            <div className="flex-1 overflow-y-auto pr-2 relative">
                {/* Timeline Line */}
                <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-100 rounded-full z-0" />

                <div className="space-y-6 relative z-10">
                    {schedules.map((schedule, i) => {
                        const isMeeting = schedule.type === 'Meeting'
                        const isSite = schedule.type === 'Site Visit'

                        return (
                            <div key={schedule.id} className="flex gap-4 group">
                                <div className="w-16 flex-shrink-0 text-right pt-2.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">{schedule.time.split(' - ')[0]}</span>
                                </div>

                                <div className="relative flex-1">
                                    {/* Timeline Node */}
                                    <div className={`absolute -left-[25px] top-2.5 w-3 h-3 rounded-full border-2 border-white ring-4 ring-white shadow-sm transition-transform group-hover:scale-125 ${isMeeting ? 'bg-indigo-500' :
                                        isSite ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} />

                                    {/* Event Card */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-bold text-slate-800 leading-tight">{schedule.title}</h4>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isMeeting ? 'bg-indigo-50 text-indigo-600' :
                                                isSite ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {schedule.type}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {schedule.time}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {schedule.location}
                                            </div>
                                            {schedule.attendees > 1 && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {schedule.attendees} People
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Example of empty state when no schedules */}
                    {/* <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Briefcase className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-700">No events scheduled</p>
                        <p className="text-xs text-slate-500 mt-1">Take a break or find a new task.</p>
                    </div> */}
                </div>
            </div>
        </div>
    )
}
