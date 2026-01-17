"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wifi, Navigation, Maximize2, Zap } from "lucide-react";
import { CCTVPreview } from "./CCTVPreview";
import { ZoneId } from "./ZoneSelector";

export function FallbackMap({ zone = "krungthon" }: { zone?: ZoneId }) {
    // Simulated Time
    const [time, setTime] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <div className="relative w-full h-full min-h-[650px] bg-slate-950 overflow-hidden rounded-xl border border-white/10 shadow-3xl group">
            {/* 1. SATELLITE BASE LAYER */}
            <div className="absolute inset-0 grayscale contrast-125 brightness-50 opacity-40 transition-all duration-700 group-hover:brightness-75 group-hover:grayscale-0">
                <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=3266&auto=format&fit=crop"
                    alt="Satellite View"
                    className="w-full h-full object-cover scale-110"
                />
            </div>

            {/* 2. OVERLAY GRID & SCANLINES */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_3px,3px_100%] opacity-20 pointer-events-none"></div>

            {/* 3. MAP UI CONTROLS (Floating) */}
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-3">
                <Badge variant="outline" className="w-fit bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md px-3 py-1">
                    <Wifi className="w-3 h-3 mr-2 animate-pulse" />
                    🛰️ SATELLITE_UPLINK_LIVE ({zone.toUpperCase()})
                </Badge>
                <div className="glass p-5 rounded-2xl border border-white/20 shadow-2xl space-y-2 max-w-[280px]">
                    <h3 className="font-bold text-xl tracking-tight flex items-center gap-2 text-white">
                        <Navigation className="w-5 h-5 text-sky-400" />
                        {zone === 'krungthon' ? 'แยกกรุงธนบุรี' :
                            zone === 'sukhumvit' ? 'อโศก - สุขุมวิท' :
                                zone === 'sathon' ? 'สาทร - สีลม' : 'พระราม 4'}
                    </h3>
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] text-sky-300/60 font-mono tracking-widest uppercase text-xs">พิกัดจำลองโซน</p>
                        <p className="text-sm text-sky-100/90 font-mono uppercase italic">{zone}_CORE_DATA_NODE</p>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-medium">เวลาปัจจุบันระบบ</span>
                        <span className="text-xs text-emerald-400 font-mono font-bold">{time?.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* 4. CLEAN SVG ROADS */}
            <div className="absolute inset-0 flex items-center justify-center p-20 pointer-events-none">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                    {/* Roads */}
                    <g stroke="#1e293b" strokeWidth="36" fill="none" strokeLinecap="round" opacity="0.4">
                        {zone === 'krungthon' || zone === 'sukhumvit' ? (
                            <><path d="M 100 300 L 700 300" /><path d="M 400 100 L 400 500" /></>
                        ) : (
                            <><path d="M 150 150 L 650 450" /><path d="M 150 450 L 650 150" /></>
                        )}
                    </g>
                    {/* Traffic */}
                    <g fill="none" strokeWidth="4" strokeLinecap="round">
                        {zone === 'krungthon' && (
                            <><path d="M 100 285 L 700 285" stroke="#10b981" /><path d="M 700 315 L 100 315" stroke="#ef4444" strokeWidth="6" />
                                {[0, 1, 2, 3].map(d => <circle key={d} r="2.5" fill="#fff"><animateMotion dur="4s" repeatCount="indefinite" begin={`${d}s`} path="M 100 285 L 700 285" /></circle>)}</>
                        )}
                        {zone === 'sukhumvit' && (
                            <><path d="M 100 300 L 700 300" stroke="#ef4444" strokeWidth="8" />
                                {[0, 0.5, 1, 1.5, 2, 2.5].map(d => <circle key={d} r="4" fill="#ef4444"><animateMotion dur="12s" repeatCount="indefinite" begin={`${d}s`} path="M 700 300 L 100 300" /></circle>)}</>
                        )}
                        {zone === 'sathon' && (
                            <><path d="M 150 150 L 650 450" stroke="#fbbf24" strokeWidth="6" />
                                {[0, 2, 4].map(d => <circle key={d} r="4" fill="#fff"><animateMotion dur="6s" repeatCount="indefinite" begin={`${d}s`} path="M 150 150 L 650 450" /></circle>)}</>
                        )}
                        {zone === 'rama4' && (
                            <><path d="M 150 450 L 650 150" stroke="#10b981" strokeWidth="6" />
                                {[0, 1.5, 3].map(d => <circle key={d} r="4" fill="#fff"><animateMotion dur="5s" repeatCount="indefinite" begin={`${d}s`} path="M 150 450 L 650 150" /></circle>)}</>
                        )}
                    </g>
                </svg>
            </div>

            {/* STATUS HUD */}
            <div className="absolute bottom-10 left-10 z-30 flex items-center gap-3">
                <div className="glass px-4 py-2 rounded-2xl border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-3 shadow-2xl">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                    SYSTEM_STABLE • LATENCY: 12ms • AI_OPTIMIZED • {zone.toUpperCase()}_NODE
                </div>
            </div>

            {/* FLOATING CCTV Small */}
            <div className="absolute top-6 right-6 z-30">
                <CCTVPreview name={`CAM-${zone.toUpperCase()}-01`} status="online" />
            </div>
        </div>
    );
}
