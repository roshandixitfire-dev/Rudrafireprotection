import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="w-full h-[calc(100vh-64px)] md:h-screen flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50">
            <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-ping opacity-75"></div>
                {/* Main spinner */}
                <div className="bg-white p-4 rounded-full shadow-lg border border-slate-100 relative z-10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-500 tracking-wider uppercase animate-pulse">Loading Module...</p>
        </div>
    )
}
