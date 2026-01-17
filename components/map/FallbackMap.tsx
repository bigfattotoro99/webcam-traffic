"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wifi, Navigation, Maximize2, Zap } from "lucide-react";
import { CCTVPreview } from "./CCTVPreview";

export function FallbackMap() {
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
                    การส่งผ่านข้อมูลเรียลไทม์ • เชื่อมต่อแล้ว
                </Badge>
                <div className="glass p-5 rounded-2xl border border-white/20 shadow-2xl space-y-2 max-w-[280px]">
                    <h3 className="font-bold text-xl tracking-tight flex items-center gap-2 text-white">
                        <Navigation className="w-5 h-5 text-sky-400" />
                        ศูนย์ควบคุมกรุงเทพฯ
                    </h3>
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] text-sky-300/60 font-mono tracking-widest uppercase">พิกัดศูนย์กลาง</p>
                        <p className="text-sm text-sky-100/90 font-mono">13.7563° N, 100.5018° E</p>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-medium">เวลาปัจจุบันระบบ</span>
                        <span className="text-xs text-emerald-400 font-mono font-bold">{time?.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* 4. FLOATING CCTV PREVIEWS */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-4">
                <CCTVPreview name="SK-01 Asoke" status="online" className="rotate-1 hover:rotate-0 transition-transform duration-500" />
                <CCTVPreview name="ST-02 Sathon" status="online" className="-rotate-1 hover:rotate-0 transition-transform duration-500 delay-75" />
            </div>

            {/* 5. INTERACTIVE 3D SVG ROADS NETWORK */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-1000">
                <svg viewBox="0 0 800 600" className="w-full h-full object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,1)]">
                    <defs>
                        <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(30,41,59,0.1)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                            <stop offset="100%" stopColor="rgba(30,41,59,0.1)" />
                        </linearGradient>
                    </defs>

                    {/* MAIN ROADS NETWORK */}
                    {/* Sukhumvit (Main Horizontal-ish) */}
                    <path d="M -50 250 L 850 250" stroke="url(#roadGrad)" strokeWidth="50" fill="none" opacity="0.3" />
                    {/* Sathon / Rama 4 (Intersections) */}
                    <path d="M 300 -50 L 300 650" stroke="url(#roadGrad)" strokeWidth="40" fill="none" opacity="0.3" />
                    <path d="M 550 -50 L 550 650" stroke="url(#roadGrad)" strokeWidth="40" fill="none" opacity="0.3" />

                    {/* Traffic Flow Paths */}
                    {/* Sukhumvit Inbound (Red - Extreme Congestion) */}
                    <path d="M 850 260 L -50 260" stroke="#ef4444" strokeWidth="6" fill="none" className="blur-[1px] opacity-40 shadow-[0_0_15px_#ef4444]" />
                    {/* Sukhumvit Outbound (Green) */}
                    <path d="M -50 240 L 850 240" stroke="#10b981" strokeWidth="6" fill="none" className="blur-[1px] opacity-40 shadow-[0_0_15px_#10b981]" />

                    {/* Animated Particles (Vehicles) */}
                    {/* Heavy Inbound Sukhumvit */}
                    <g>
                        {[0, 0.4, 1.2, 1.8, 2.5, 3.2, 4.5, 5.8, 7].map((d, i) => (
                            <circle key={`in-${i}`} r="3" fill="#ef4444" className="shadow-[0_0_10px_#ef4444]">
                                <animateMotion dur="20s" repeatCount="indefinite" begin={`${d}s`} path="M 850 260 L -50 260" />
                            </circle>
                        ))}
                    </g>

                    {/* Smooth Outbound */}
                    <g>
                        {[0, 1.5, 3, 4.5].map((d, i) => (
                            <circle key={`out-${i}`} r="2.5" fill="#fff" className="shadow-[0_0_8px_#fff]">
                                <animateMotion dur="5s" repeatCount="indefinite" begin={`${d}s`} path="M -50 240 L 850 240" />
                            </circle>
                        ))}
                    </g>
                </svg>
            </div>

            {/* 6. BOTTOM HUD PANELS (Bangkok Hotspots) */}
            <div className="absolute bottom-6 right-6 z-30 flex items-end gap-4 origin-bottom-right">
                <Card className="glass p-5 w-72 border-white/20 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest leading-none">ดัชนีจราจรกรุงเทพฯ</span>
                        <Badge variant="destructive" className="text-[8px] h-4">วิกฤต</Badge>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: "ถ.สุขุมวิท (อโศก)", density: 98, color: "bg-red-500" },
                            { name: "ถ.สาทรตอนใต้", density: 82, color: "bg-red-500" },
                            { name: "ถ.พระราม 4", density: 74, color: "bg-amber-500" },
                            { name: "สะพานตากสิน", density: 88, color: "bg-red-500" },
                        ].map((road) => (
                            <div key={road.name} className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-medium text-white/50 tracking-wide">
                                    <span>{road.name}</span>
                                    <span className={road.density > 80 ? "text-red-400" : "text-amber-400"}>{road.density}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className={`${road.color} h-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${road.density}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-[8px] text-zinc-500 text-center uppercase tracking-tighter">อัปเดตข้อมูลทุก 60 วินาทีจากกองบังคับการตำรวจจราจร</p>
                </Card>

                <Card className="glass p-4 w-56 border-white/20 shadow-2xl backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">การควบคุมด้วย AI</span>
                        <Zap className="h-3 w-3 text-yellow-400 animate-bounce" />
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mt-1"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-white/90 font-medium">ปรับรอบสัญญาณไฟ</span>
                            <span className="text-[9px] text-emerald-300/60 leading-tight italic">เปิดไฟเขียว Sukhumvit Inbound เพิ่มขึ้น +45วิ เพื่อระบายรถสะสมจากแยกอโศก</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* HUD SCALE / QUALITY INDICATOR */}
            <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-2">
                <div className="glass px-3 py-1.5 rounded-full border-white/10 text-[9px] font-mono text-white/50 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    SATELLITE HDR ACTIVE • LATENCY 12ms
                </div>
            </div>
        </div>
    );
}
