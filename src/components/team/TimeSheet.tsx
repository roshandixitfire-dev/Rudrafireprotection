'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle2, AlertCircle, Coffee } from 'lucide-react'

// Mock current user info - in a real app, this comes from auth context
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

interface TimeSheetRecord {
    id: number
    date: string
    punch_in: string
    punch_out: string | null
    total_hours: number | null
    status: string
}

export default function TimeSheet() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isPunchedIn, setIsPunchedIn] = useState(false)
    const [activeRecord, setActiveRecord] = useState<TimeSheetRecord | null>(null)
    const [recentLogs, setRecentLogs] = useState<TimeSheetRecord[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Update real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Simulate fetching today's status
    useEffect(() => {
        // In reality, fetch from Supabase: SELECT * FROM time_sheets WHERE user_id = X AND date = TODAY
        const mockToday = {
            id: 1,
            date: new Date().toISOString().split('T')[0],
            punch_in: '10:00:00',
            punch_out: null,
            total_hours: null,
            status: 'Present'
        }

        // Let's pretend user hasn't punched in yet for testing UI states easily
        // setActiveRecord(mockToday)
        // setIsPunchedIn(true)

        setRecentLogs([
            { id: 2, date: '2026-03-01', punch_in: '09:30:00', punch_out: '18:30:00', total_hours: 9.0, status: 'Present' },
            { id: 3, date: '2026-02-28', punch_in: '09:45:00', punch_out: '18:15:00', total_hours: 8.5, status: 'Present' },
            { id: 4, date: '2026-02-27', punch_in: '10:00:00', punch_out: '14:00:00', total_hours: 4.0, status: 'Half Day' },
        ])
    }, [])

    const handlePunch = () => {
        const timeString = currentTime.toTimeString().split(' ')[0]

        if (isPunchedIn) {
            // Punch Out
            setIsPunchedIn(false)
            if (activeRecord) {
                // Calculate rough hours
                const [inH, inM] = activeRecord.punch_in.split(':').map(Number)
                const [outH, outM] = timeString.split(':').map(Number)
                const totalH = (outH + outM / 60) - (inH + inM / 60)

                const completeRecord = { ...activeRecord, punch_out: timeString, total_hours: parseFloat(totalH.toFixed(2)) }
                setActiveRecord(null)
                setRecentLogs([completeRecord, ...recentLogs])
                // TODO: Save to database
            }
        } else {
            // Punch In
            setIsPunchedIn(true)
            const newRecord = {
                id: Date.now(),
                date: currentTime.toISOString().split('T')[0],
                punch_in: timeString,
                punch_out: null,
                total_hours: null,
                status: 'Present'
            }
            setActiveRecord(newRecord)
            // TODO: Save to database
        }
    }

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '--:--'
        // Assumes HH:MM:SS format
        const [h, m] = timeStr.split(':')
        const date = new Date()
        date.setHours(parseInt(h, 10), parseInt(m, 10))
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Time Sheet
            </h3>

            {/* Compact Attendance Header */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Attendance</p>
                        <h4 className="text-xl font-black text-slate-800">
                            {mounted ? currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' }) : '---'}
                        </h4>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shift Hours</p>
                        <p className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">09:00 AM - 06:00 PM</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePunch}
                        className={`h-full px-8 py-4 rounded-2xl font-black text-sm tracking-widest transition-all transform active:scale-95 shadow-lg flex items-center gap-2 ${isPunchedIn
                            ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                            : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                            }`}
                    >
                        {isPunchedIn ? 'PUNCH OUT' : 'PUNCH IN'}
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Punch In</p>
                    <p className="text-lg font-black text-slate-800">{isPunchedIn && activeRecord ? formatTime(activeRecord.punch_in) : '--:--'}</p>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Punch Out</p>
                    <p className="text-lg font-black text-slate-800">{activeRecord?.punch_out ? formatTime(activeRecord.punch_out) : '--:--'}</p>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Total Time</p>
                    <p className="text-lg font-black text-indigo-700">{activeRecord?.total_hours || '0.0'}h</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-lg font-black text-emerald-700">{isPunchedIn ? 'On Duty' : 'Offline'}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button disabled={!isPunchedIn} className="flex items-center justify-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm border border-amber-100 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <Coffee className="w-4 h-4" /> Take Break
                </button>
                <button className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-colors">
                    Request Leave
                </button>
            </div>

            {/* Recent Logs List */}
            <div className="flex-1 overflow-auto">
                <h4 className="text-sm font-bold text-slate-800 mb-4 px-1">Recent Logs</h4>
                <div className="space-y-3">
                    {recentLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.status === 'Present' ? 'bg-emerald-100 text-emerald-600' :
                                    log.status === 'Half Day' ? 'bg-amber-100 text-amber-600' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{new Date(log.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                    <p className="text-xs font-semibold text-slate-500">{formatTime(log.punch_in)} - {formatTime(log.punch_out)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-1">{log.status}</span>
                                <p className="text-sm font-black text-slate-700">{log.total_hours?.toFixed(1) || '--'} hrs</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
