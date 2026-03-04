'use client'

import { useState } from 'react'
import { Users, Search, Building2, MapPin, Briefcase, Mail, Phone, DollarSign, ExternalLink } from 'lucide-react'

interface Employee {
    id: number
    name: string
    designation: string
    salary: string
    allottedSites: string[]
    email: string
    phone: string
}

export default function EmployeeMaster() {
    const [employees] = useState<Employee[]>([
        {
            id: 1,
            name: 'Roshan Dixit',
            designation: 'Managing Director',
            salary: '₹1,50,000',
            allottedSites: ['Main Office', 'Downtown Project'],
            email: 'roshandixitfire@gmail.com',
            phone: '+91 98765 43210'
        },
        {
            id: 2,
            name: 'Staff Member',
            designation: 'Senior Engineer',
            salary: '₹65,000',
            allottedSites: ['East Site', 'South Industrial Zone'],
            email: 'employee@rudraweb.com',
            phone: '+91 91234 56789'
        }
    ])

    const [searchTerm, setSearchTerm] = useState('')

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Employee Master
                </h3>

                <div className="relative group min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="search"
                        placeholder="Search employees..."
                        className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto space-y-4 pr-2">
                {filteredEmployees.map(emp => (
                    <div key={emp.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all group">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">
                                    {emp.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{emp.name}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.designation}</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary</span>
                                <span className="text-lg font-black text-slate-800">{emp.salary}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Briefcase className="w-3 h-3" /> Allotted Sites
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {emp.allottedSites.map((site, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600">
                                            {site}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Mail className="w-3 h-3" /> Email Address
                                </div>
                                <p className="text-xs font-semibold text-slate-700">{emp.email}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Phone className="w-3 h-3" /> Phone Number
                                </div>
                                <p className="text-xs font-semibold text-slate-700">{emp.phone}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 uppercase tracking-widest">
                                Full Profile <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
