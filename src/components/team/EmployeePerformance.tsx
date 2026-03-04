'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, TrendingUp, Award, AlertTriangle } from 'lucide-react'

// Mock Performance Data
const PERFORMANCE_DATA = [
    { name: 'Mon', completed: 5, target: 6 },
    { name: 'Tue', completed: 7, target: 8 },
    { name: 'Wed', completed: 4, target: 5 },
    { name: 'Thu', completed: 8, target: 7 },
    { name: 'Fri', completed: 6, target: 6 },
]

export default function EmployeePerformance() {
    const totalCompleted = PERFORMANCE_DATA.reduce((acc, curr) => acc + curr.completed, 0)
    const totalTarget = PERFORMANCE_DATA.reduce((acc, curr) => acc + curr.target, 0)
    const completionRate = Math.round((totalCompleted / totalTarget) * 100)

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                My Performance
            </h3>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-2 text-purple-600">
                        <Target className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Target</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{totalTarget}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">Tasks & Visits</div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <Award className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Completion Rate</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800">{completionRate}%</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">{totalCompleted} Completed</div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0 w-full mt-4 flex flex-col">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Tasks Trend (This Week)</h4>
                <div className="flex-1 min-h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={PERFORMANCE_DATA}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            barGap={4}
                            barCategoryGap="25%"
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="completed" name="Completed" fill="#a855f7" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alert / Insight */}
            {completionRate < 80 && (
                <div className="mt-6 bg-amber-50 p-4 rounded-xl flex gap-3 text-amber-800 text-sm border border-amber-100">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                    <div>
                        <p className="font-bold">Falling behind schedule</p>
                        <p className="opacity-90 mt-0.5">You are tracking below your 80% completion target for the week. Review your pending tasks.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
