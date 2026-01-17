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

    // Traffic Light States
    const [horizontalState, setHorizontalState] = useState<"green" | "yellow" | "red">("green");
    const [verticalState, setVerticalState] = useState<"green" | "yellow" | "red">("red");
    const [horizontalTimer, setHorizontalTimer] = useState(30);
    const [verticalTimer, setVerticalTimer] = useState(35); // Horizontal Green(30) + Yellow(5)

    useEffect(() => {
        setMounted(true);
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Traffic Light Logic
        const lightTicker = setInterval(() => {
            setHorizontalTimer(h => {
                if (h <= 1) {
                    if (horizontalState === "green") {
                        setHorizontalState("yellow");
                        return 5;
                    } else if (horizontalState === "yellow") {
                        setHorizontalState("red");
                        return 40;
                    } else {
                        setHorizontalState("green");
                        return 30;
                    }
                }
                return h - 1;
            });

            setVerticalTimer(v => {
                if (v <= 1) {
                    if (verticalState === "green") {
                        setVerticalState("yellow");
                        return 5;
                    } else if (verticalState === "yellow") {
                        setVerticalState("red");
                        return 40;
                    } else {
                        setVerticalState("green");
                        return 30;
                    }
                }
                return v - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(lightTicker);
        };
    }, [horizontalState, verticalState]);

    if (!mounted) return null; // Prevent hydration mismatch

    return (
        <div className="relative w-full h-full min-h-[650px] bg-slate-950 overflow-hidden rounded-xl border border-white/10 shadow-3xl group">
            {/* SATELLITE BASE - High Detail Urban */}
            <div className="absolute inset-0 grayscale contrast-125 brightness-[0.25] opacity-60">
                <img
                    src="https://images.unsplash.com/photo-1542361345-89e58247f2d1?q=80&w=3270&auto=format&fit=crop"
                    alt="Satellite Urban"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* GOOGLE MAPS STYLE GRID */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* HEADER UI */}
            <div className="absolute top-6 left-6 z-30 space-y-3">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/50 backdrop-blur-md">
                    <Wifi className="w-3 h-3 mr-2 animate-pulse" /> SATELLITE_UPLINK_LIVE
                </Badge>
                <div className="glass p-5 rounded-2xl border border-white/20 shadow-2xl space-y-2">
                    <h3 className="font-bold text-xl tracking-tight flex items-center gap-2 text-white">
                        <Navigation className="w-5 h-5 text-sky-400" />
                        {zone === 'krungthon' ? 'แยกกรุงธนบุรี' :
                            zone === 'sukhumvit' ? 'อโศก - สุขุมวิท' :
                                zone === 'sathon' ? 'สาทร - สีลม' : 'พระราม 4'}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] text-sky-300/60 font-mono uppercase">Node Synchronization Active</p>
                    </div>
                </div>
            </div>

            {/* INTERSECTION SVG WITH LIGHTS */}
            <div className="absolute inset-0 flex items-center justify-center p-20 pointer-events-none">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                    {/* Roads - Darkened Asphalt Style */}
                    <g stroke="#1e293b" strokeWidth="42" fill="none" strokeLinecap="round" opacity="0.6">
                        {zone === 'krungthon' || zone === 'sukhumvit' ? (
                            <><path d="M 100 300 L 700 300" /><path d="M 400 100 L 400 500" /></>
                        ) : (
                            <><path d="M 150 150 L 650 450" /><path d="M 150 450 L 650 150" /></>
                        )}
                    </g>
                    {/* Lane Lines */}
                    <g stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10 10" fill="none">
                        {zone === 'krungthon' || zone === 'sukhumvit' ? (
                            <><path d="M 100 300 L 700 300" /><path d="M 400 100 L 400 500" /></>
                        ) : (
                            <><path d="M 150 150 L 650 450" /><path d="M 150 450 L 650 150" /></>
                        )}
                    </g>

                    {/* TRAFFIC FLOW - Speed synced with lights */}
                    <g fill="none" strokeWidth="4" strokeLinecap="round">
                        {zone === 'krungthon' && (
                            <>
                                <path d="M 100 285 L 700 285" stroke={horizontalState === 'red' ? '#ef4444' : horizontalState === 'yellow' ? '#f59e0b' : '#10b981'} opacity="0.6" />
                                {horizontalState !== 'red' && [0, 1, 2, 3].map(d => (
                                    <circle key={`h-${d}`} r="3" fill="#fff" className="shadow-[0_0_8px_#fff]">
                                        <animateMotion dur={horizontalState === 'yellow' ? '8s' : '4s'} repeatCount="indefinite" begin={`${d}s`} path="M 100 285 L 700 285" />
                                    </circle>
                                ))}
                                <path d="M 415 100 L 415 500" stroke={verticalState === 'red' ? '#ef4444' : verticalState === 'yellow' ? '#f59e0b' : '#10b981'} opacity="0.6" />
                                {verticalState !== 'red' && [0, 1.5, 3].map(d => (
                                    <circle key={`v-${d}`} r="3" fill="#fff" className="shadow-[0_0_8px_#fff]">
                                        <animateMotion dur={verticalState === 'yellow' ? '12s' : '6s'} repeatCount="indefinite" begin={`${d}s`} path="M 415 100 L 415 500" />
                                    </circle>
                                ))}
                            </>
                        )}
                        {zone === 'sukhumvit' && (
                            <>
                                <path d="M 100 300 L 700 300" stroke={horizontalState === 'red' ? '#991b1b' : '#ef4444'} strokeWidth="8" opacity="0.8" />
                                {horizontalState !== 'red' && [0, 0.4, 0.8, 1.2, 1.6, 2].map(d => (
                                    <circle key={`sh-${d}`} r="4" fill="#ef4444"><animateMotion dur="12s" repeatCount="indefinite" begin={`${d}s`} path="M 700 300 L 100 300" /></circle>
                                ))}
                            </>
                        )}
                        {zone === 'sathon' && (
                            <>
                                <path d="M 150 150 L 650 450" stroke={horizontalState === 'red' ? '#92400e' : '#fbbf24'} strokeWidth="6" opacity="0.6" />
                                {horizontalState !== 'red' && [0, 2, 4].map(d => (
                                    <circle key={`sd-${d}`} r="4" fill="#fff"><animateMotion dur="6s" repeatCount="indefinite" begin={`${d}s`} path="M 150 150 L 650 450" /></circle>
                                ))}
                            </>
                        )}
                        {zone === 'rama4' && (
                            <>
                                <path d="M 150 450 L 650 150" stroke={verticalState === 'red' ? '#065f46' : '#10b981'} strokeWidth="6" opacity="0.6" />
                                {verticalState !== 'red' && [0, 1.5, 3].map(d => (
                                    <circle key={`rv-${d}`} r="4" fill="#fff"><animateMotion dur="5s" repeatCount="indefinite" begin={`${d}s`} path="M 150 450 L 650 150" /></circle>
                                ))}
                            </>
                        )}
                    </g>
                </svg>
            </div>

            {/* COUNTDOWN HUD - Digital Style */}
            <div className="absolute inset-0 pointer-events-none z-40">
                {/* Top Timer (Vertical) */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className={`glass px-4 py-1.5 rounded-xl border-white/10 flex flex-col items-center ${verticalState === 'green' ? 'text-emerald-400' : verticalState === 'yellow' ? 'text-yellow-400' : 'text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}>
                        <div className="flex gap-1 mb-1">
                            <div className={`h-2 w-2 rounded-full ${verticalState === 'red' ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`}></div>
                            <div className={`h-2 w-2 rounded-full ${verticalState === 'yellow' ? 'bg-yellow-500' : 'bg-zinc-800'}`}></div>
                            <div className={`h-2 w-2 rounded-full ${verticalState === 'green' ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
                        </div>
                        <span className="text-[14px] font-mono font-black tracking-tighter">{verticalTimer}s</span>
                    </div>
                </div>

                {/* Bottom Timer (Horizontal) */}
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className={`glass px-4 py-1.5 rounded-xl border-white/10 flex flex-col items-center ${horizontalState === 'green' ? 'text-emerald-400' : horizontalState === 'yellow' ? 'text-yellow-400' : 'text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}>
                        <span className="text-[14px] font-mono font-black tracking-tighter">{horizontalTimer}s</span>
                        <div className="flex gap-1 mt-1">
                            <div className={`h-2 w-2 rounded-full ${horizontalState === 'green' ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
                            <div className={`h-2 w-2 rounded-full ${horizontalState === 'yellow' ? 'bg-yellow-500' : 'bg-zinc-800'}`}></div>
                            <div className={`h-2 w-2 rounded-full ${horizontalState === 'red' ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATUS HUD */}
            <div className="absolute bottom-10 left-10 z-30 flex items-center gap-3">
                <div className="glass px-4 py-2 rounded-2xl border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-3 shadow-2xl backdrop-blur-xl">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                    AI_SIGNAL_CONTROL: ACTIVE • SYNC_OK
                </div>
            </div>

            {/* FLOATING CCTV Small */}
            <div className="absolute top-6 right-6 z-30">
                <CCTVPreview name={`CAM-${zone.toUpperCase()}-01`} status="online" />
            </div>
        </div>
    );
}
