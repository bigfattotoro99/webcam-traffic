"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Car, Zap, Wifi, Navigation } from "lucide-react";

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
        <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
            {/* Background Texture - Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* Map UI Overlay (Top Left) */}
            <div className="absolute top-4 left-4 z-20 space-y-2">
                <Badge variant="outline" className="bg-black/50 backdrop-blur text-green-400 border-green-500/50 animate-pulse">
                    <Wifi className="w-3 h-3 mr-1" /> LIVE DATA FEED
                </Badge>
                <div className="bg-black/60 backdrop-blur p-3 rounded-lg border border-slate-700 text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-blue-400" />
                        Krung Thon Buri Intersection
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">LAT: 13.7208 • LNG: 100.5018</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{time?.toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Map Content - Centered SVG */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 800 600" className="w-full h-full object-cover">
                    <defs>
                        {/* Glow Filters */}
                        <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* --- ROADS (Static Lines) --- */}

                    {/* Main Road: Krung Thon Buri (Horizontal) */}
                    <path d="M -50 300 L 850 300" stroke="#1e293b" strokeWidth="60" fill="none" />
                    {/* Intersection: Charoen Nakhon (Vertical) */}
                    <path d="M 400 -50 L 400 650" stroke="#1e293b" strokeWidth="50" fill="none" />

                    {/* --- TRAFFIC FLOW LINES (Colored) --- */}

                    {/* Lane 1: West to East (Green - Flowing) */}
                    <path id="lane1" d="M -50 285 L 850 285" stroke="#22c55e" strokeWidth="4" fill="none" opacity="0.6" filter="url(#glow-green)" />

                    {/* Lane 2: East to West (Red - Congested) */}
                    <path id="lane2" d="M 850 315 L -50 315" stroke="#ef4444" strokeWidth="4" fill="none" opacity="0.6" filter="url(#glow-red)" />

                    {/* Lane 3: North to South */}
                    <path id="lane3" d="M 385 -50 L 385 650" stroke="#fbbf24" strokeWidth="4" fill="none" opacity="0.5" />

                    {/* Lane 4: South to North */}
                    <path id="lane4" d="M 415 650 L 415 -50" stroke="#fbbf24" strokeWidth="4" fill="none" opacity="0.5" />


                    {/* --- SIMULATED CARS (Animated Circles) --- */}

                    {/* Flowing Traffic Group (Lane 1) */}
                    <g>
                        <circle r="4" fill="#fff" className="animate-car-flow-fast">
                            <animateMotion dur="4s" repeatCount="indefinite" path="M -50 285 L 850 285" />
                        </circle>
                        <circle r="4" fill="#fff" className="animate-car-flow-fast" style={{ animationDelay: '1s' }}>
                            <animateMotion dur="4s" repeatCount="indefinite" begin="1s" path="M -50 285 L 850 285" />
                        </circle>
                        <circle r="4" fill="#fff" className="animate-car-flow-fast" style={{ animationDelay: '2.5s' }}>
                            <animateMotion dur="4s" repeatCount="indefinite" begin="2.5s" path="M -50 285 L 850 285" />
                        </circle>
                    </g>

                    {/* Congested Traffic Group (Lane 2 - Slower) */}
                    <g>
                        <circle r="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1">
                            <animateMotion dur="12s" repeatCount="indefinite" path="M 850 315 L -50 315" />
                        </circle>
                        <circle r="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1">
                            <animateMotion dur="12s" repeatCount="indefinite" begin="0.8s" path="M 850 315 L -50 315" />
                        </circle>
                        <circle r="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1">
                            <animateMotion dur="12s" repeatCount="indefinite" begin="1.5s" path="M 850 315 L -50 315" />
                        </circle>
                        <circle r="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1">
                            <animateMotion dur="12s" repeatCount="indefinite" begin="3s" path="M 850 315 L -50 315" />
                        </circle>
                        <circle r="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1">
                            <animateMotion dur="12s" repeatCount="indefinite" begin="4.2s" path="M 850 315 L -50 315" />
                        </circle>
                    </g>

                    {/* Turning Cars (Curve) */}
                    <g>
                        <circle r="4" fill="#fbbf24">
                            <animateMotion dur="6s" repeatCount="indefinite" begin="2s" path="M -50 285 L 350 285 Q 385 285 385 350 L 385 650" />
                        </circle>
                    </g>

                </svg>
            </div>

            {/* Status Indicators (Bottom Right) */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 scale-90 origin-bottom-right">
                <Card className="glass-card p-3 w-48 border-zinc-700 bg-zinc-900/80">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-zinc-400">TRAFFIC DENSITY</span>
                        <span className="text-xs font-bold text-red-500">CRITICAL</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full w-[85%] animate-pulse"></div>
                    </div>
                </Card>
                <Card className="glass-card p-3 w-48 border-zinc-700 bg-zinc-900/80">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-zinc-400">AI CONTROL</span>
                        <Zap className="h-3 w-3 text-yellow-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
                        <span className="text-xs text-white">Optimizing Signal...</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
