'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Stat {
    label: string
    value: string
    icon: string
    color: string
}

interface DashboardStatsProps {
    stats: Stat[]
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    const [isStatsOpen, setIsStatsOpen] = useState(true)

    return (
        <div className="mb-8">
            <header
                className="flex justify-between items-center cursor-pointer group mb-4"
                onClick={() => setIsStatsOpen(!isStatsOpen)}
            >
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Dashboard Overview</h1>
                        <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-slate-200 group-hover:text-slate-700 transition-colors">
                            {isStatsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </div>
            </header>

            {isStatsOpen && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-black text-xl" style={{ backgroundColor: s.color }}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">{s.label}</p>
                                <p className="text-xl font-bold text-slate-900 m-0 leading-none mt-1">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
