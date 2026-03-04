'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, Activity, CalendarDays } from 'lucide-react'

interface CRMAnalyticsProps {
    leads: any[]
    clients: any[]
}

export default function CRMAnalytics({ leads, clients }: CRMAnalyticsProps) {
    // Basic calculations
    const totalLeads = leads.length
    const totalWon = leads.filter(l => l.stage?.toLowerCase() === 'win').length
    const totalLost = leads.filter(l => l.stage?.toLowerCase() === 'lost').length
    const winRate = totalLeads > 0 ? Math.round((totalWon / totalLeads) * 100) : 0

    // Data for charts
    const stageData = [
        { name: 'New', value: leads.filter(l => !l.stage || l.stage.toLowerCase() === 'new').length },
        { name: 'Contacted', value: leads.filter(l => l.stage?.toLowerCase() === 'contacted').length },
        { name: 'Quoted', value: leads.filter(l => l.stage?.toLowerCase() === 'quoted').length },
        { name: 'Won', value: totalWon },
        { name: 'Lost', value: totalLost },
    ]

    const categoryData = [
        { name: 'Hot', value: leads.filter(l => l.category?.toLowerCase() === 'hot').length },
        { name: 'Warm', value: leads.filter(l => l.category?.toLowerCase() === 'warm').length },
        { name: 'Cold', value: leads.filter(l => l.category?.toLowerCase() === 'cold').length },
    ]

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f43f5e']
    const CAT_COLORS = ['#ef4444', '#f97316', '#64748b']

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
                        <h3 className="text-2xl font-black text-slate-800">{totalLeads}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Win Rate</p>
                        <h3 className="text-2xl font-black text-slate-800">{winRate}%</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Clients</p>
                        <h3 className="text-2xl font-black text-slate-800">{clients.filter(c => c.status?.toLowerCase() === 'active').length}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow-ups</p>
                        <h3 className="text-2xl font-black text-slate-800">{leads.filter(l => !!l.follow_up).length}</h3>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Sales Pipeline Stages
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {stageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" /> Lead Categories
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CAT_COLORS[index % CAT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
