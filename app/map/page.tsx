"use client";

import { useState } from "react";
import { MapWrapper } from "@/components/map/MapWrapper";
import { AICameraFeed } from "@/components/dashboard/AICameraFeed";
import { ZoneSelector, ZoneId } from "@/components/map/ZoneSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Info, Activity, Globe } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
    const [activeZone, setActiveZone] = useState<ZoneId>("krungthon");

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0c] text-white">
            {/* COMPACT MAP HEADER */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Globe className="h-4 w-4 text-sky-400 animate-pulse" />
                            LIVE TRAFFIC INTELLIGENCE
                        </h2>
                        <p className="text-[9px] text-zinc-500 font-mono tracking-[0.2em] uppercase">SYSTEM ID: BKK-CORE-SIM-091</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">พื้นที่แสดงผล</span>
                        <span className="text-sm font-black text-emerald-500 uppercase italic">
                            {activeZone === 'krungthon' ? 'แยกกรุงธนบุรี' :
                                activeZone === 'sukhumvit' ? 'อโศก - สุขุมวิท' :
                                    activeZone === 'sathon' ? 'สาทร - สีลม' : 'พระราม 4'}
                        </span>
                    </div>
                    <Button variant="outline" size="sm" className="glass border-white/5 rounded-xl h-8 text-[10px] font-bold px-3">
                        <Info className="h-3 w-3 mr-2 text-sky-400" /> คู่มือการจำลอง
                    </Button>
                </div>
            </header>

            {/* THREE COLUMN COMMAND INTERFACE */}
            <main className="flex-1 flex overflow-hidden p-2 gap-2">

                {/* LEFT: SELECTION PANEL */}
                <aside className="w-80 flex flex-col gap-2 shrink-0">
                    <ZoneSelector activeZone={activeZone} onZoneChange={setActiveZone} />
                    <div className="glass flex-1 rounded-2xl border-white/5 p-4 flex flex-col gap-4 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="h-3 w-3 text-sky-400" />
                            NETWORK STATUS
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Node 011-A', val: 'Connected', col: 'text-emerald-500' },
                                { label: 'AI Processor', val: 'Active', col: 'text-emerald-500' },
                                { label: 'Satellite Uplink', val: '98%', col: 'text-sky-400' },
                                { label: 'Simulation FPS', val: '60.0', col: 'text-amber-400' }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[11px] text-zinc-400 font-medium">{s.label}</span>
                                    <span className={`text-[11px] font-mono font-bold ${s.col}`}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MIDDLE: EXPANDED MAP */}
                <section className="flex-1 rounded-3xl border border-white/10 overflow-hidden shadow-3xl bg-black/40 relative">
                    <MapWrapper currentZone={activeZone} key={activeZone} />
                    {/* Floating HUD on Map */}
                    <div className="absolute top-4 right-4 pointer-events-none">
                        <Badge className="bg-black/60 backdrop-blur-xl border-white/10 text-emerald-400 font-mono text-[10px] p-2 px-3 shadow-2xl">
                            SIMULATION_MODE: REALTIME_DENSE_AI_OPTIMIZED
                        </Badge>
                    </div>
                </section>

                {/* RIGHT: AI CONSOLE */}
                <aside className="w-96 flex flex-col gap-2 shrink-0">
                    <AICameraFeed zone={activeZone} />

                    {/* DATA TERMINAL LOG */}
                    <div className="flex-1 glass rounded-2xl border-white/5 p-4 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Raw Data Streams</h3>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <div className="flex-1 font-mono text-[9px] text-emerald-500/80 leading-relaxed overflow-y-auto space-y-1 bg-black/30 p-2 rounded-lg border border-white/5">
                            <p className="text-zinc-600">[{new Date().toLocaleTimeString()}] INITIATING CONVERSION...</p>
                            <p>[OK] RAW_BUFFER_MAPPED</p>
                            <p>[0x4F2] VEHICLE_TX_PINK -&gt; CONF: 0.982</p>
                            <p>[0x4F2] POS: [12.4, 55.1]</p>
                            <p className="text-sky-400">METADATA_STRIDE: 512_BYTES</p>
                            <p>[0x4F3] VEHICLE_BUS_BKK -&gt; CONF: 0.941</p>
                            <p>[0x4F3] POS: [34.8, 52.3]</p>
                            <p className="animate-pulse">_PROCESSING PIXELS...</p>
                            <p className="text-zinc-600 mt-2">--- FLOW UPDATE ---</p>
                            <p>TRAFFIC_DENSITY: 0.88</p>
                            <p>WAIT_TIME_EST: 145s</p>
                            <p className="text-amber-500">AI_ACTION: SIGNAL_EXT_GREEN_30S</p>
                        </div>
                    </div>
                </aside>

            </main>
        </div>
    );
}
