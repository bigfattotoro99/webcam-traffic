"use client";

import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Play, Pause, RefreshCcw, ShieldAlert,
    Navigation, Timer, Activity, Radio,
    Zap
} from "lucide-react";
import Link from "next/link";

interface Car {
    id: number;
    type: "sedan" | "taxi" | "bus" | "suv";
    color: string;
    direction: "N" | "S" | "E" | "W";
    pos: number;
    speed: number;
    targetSpeed: number;
}

const INTERSECTION_CENTER = 50;
const STOP_LINE_OFFSET = 12;

export default function SimulationPage() {
    const [lights, setLights] = useState({
        N: "red" as "green" | "red",
        S: "red" as "green" | "red",
        E: "green" as "green" | "red",
        W: "green" as "green" | "red",
    });
    const [isManual, setIsManual] = useState(false);
    const [cars, setCars] = useState<Car[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const nextCarId = useRef(0);

    // Simulation Loop
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCars(prevCars => {
                const directions: ("N" | "S" | "E" | "W")[] = ["N", "S", "E", "W"];
                let updatedCars: Car[] = [];

                directions.forEach(dir => {
                    const laneCars = prevCars.filter(c => c.direction === dir).sort((a, b) => b.pos - a.pos);
                    const light = lights[dir];

                    const updatedLane = laneCars.map((car, idx) => {
                        let nextPos = car.pos + car.speed;
                        let newSpeed = car.speed;

                        // Interaction with light
                        const isNearStopLine = car.pos < INTERSECTION_CENTER - STOP_LINE_OFFSET && nextPos >= INTERSECTION_CENTER - STOP_LINE_OFFSET;
                        const shouldStopAtLight = (light === "red") && isNearStopLine;

                        // Interaction with car in front (Simple collision prevention)
                        const carInFront = idx > 0 ? laneCars[idx - 1] : null;
                        const distanceToNext = carInFront ? carInFront.pos - car.pos : 1000;
                        const isTooClose = distanceToNext < 10;

                        if (shouldStopAtLight || isTooClose) {
                            newSpeed = Math.max(0, car.speed - 0.05);
                        } else {
                            newSpeed = Math.min(car.targetSpeed, car.speed + 0.02);
                        }

                        return { ...car, pos: car.pos + newSpeed, speed: newSpeed };
                    }).filter(car => car.pos < 120);

                    updatedCars = [...updatedCars, ...updatedLane];
                });

                // Spawn logic for all 4 directions
                if (Math.random() > 0.95 && updatedCars.length < 32) {
                    const spawnDir = directions[Math.floor(Math.random() * 4)];
                    const laneCount = updatedCars.filter(c => c.direction === spawnDir).length;

                    if (laneCount < 8) {
                        updatedCars.push({
                            id: nextCarId.current++,
                            type: "sedan",
                            color: ["#ef4444", "#3b82f6", "#10b981", "#ffeb3b"][Math.floor(Math.random() * 4)],
                            direction: spawnDir,
                            pos: -10,
                            speed: 0.3,
                            targetSpeed: 0.4 + Math.random() * 0.2,
                        });
                    }
                }

                return updatedCars;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [lights, isPaused]);

    // Auto Mode Logic (Cyclic)
    useEffect(() => {
        if (isManual || isPaused) return;

        const timer = setInterval(() => {
            setLights(prev => {
                if (prev.E === "green") return { N: "green", S: "green", E: "red", W: "red" };
                return { N: "red", S: "red", E: "green", W: "green" };
            });
        }, 6000);

        return () => clearInterval(timer);
    }, [isManual, isPaused]);

    const toggleManual = () => setIsManual(!isManual);

    const handleLightClick = (dir: "N" | "S" | "E" | "W") => {
        if (!isManual) return;

        setLights(prev => {
            const isCurrentlyGreen = prev[dir] === "green";
            const nextColor = isCurrentlyGreen ? "red" : "green";

            const newState = { ...prev, [dir]: nextColor };

            // SAFETY INTERLOCK: Conflicting directions must be Red
            if (nextColor === "green") {
                if (dir === "N" || dir === "S") {
                    newState.E = "red";
                    newState.W = "red";
                } else {
                    newState.N = "red";
                    newState.S = "red";
                }
            }
            return newState;
        });
    };

    return (
        <div className="fixed inset-0 bg-[#020617] text-white flex flex-col overflow-hidden">
            {/* Header Bar */}
            <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl px-8 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <Link href="/map" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <Navigation className="w-5 h-5 text-sky-400 rotate-[-45deg]" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-black tracking-tighter uppercase">Traffic_Control_Center_V3</h1>
                        <p className="text-[10px] text-sky-400/50 font-mono italic">4_WAY_SAFETY_INTERLOCK_ACTIVE</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Operation_Mode</span>
                        <Badge variant={isManual ? "destructive" : "outline"} className="px-3 py-0 h-5 font-mono text-[9px]">
                            {isManual ? "MANUAL_BYPASS" : "AI_OPTIMIZED"}
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleManual}
                        className={`border-white/10 ${isManual ? 'bg-red-500/10 text-red-400 border-red-500/50' : 'hover:bg-white/5'}`}
                    >
                        {isManual ? <ShieldAlert className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                        {isManual ? "Disable Override" : "Enable Override"}
                    </Button>
                </div>
            </header>

            <main className="flex-1 relative flex">
                {/* Manual Control Console */}
                <aside className="w-80 border-r border-white/5 bg-slate-950 p-6 flex flex-col gap-6 z-40 shadow-2xl">
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" /> Directional_Overrides
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            {(["N", "S", "E", "W"] as const).map(dir => (
                                <Card key={dir} className="bg-black/40 border-white/5 p-4 flex flex-col items-center gap-3 hover:border-white/10 transition-colors">
                                    <span className="text-[10px] font-black text-zinc-500 tracking-tighter uppercase">
                                        {dir === 'N' ? 'North' : dir === 'S' ? 'South' : dir === 'E' ? 'East' : 'West'}
                                    </span>
                                    <div className={`h-2 w-full rounded-full transition-all duration-500 ${lights[dir] === 'green' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500/20'}`} />
                                    <Button
                                        disabled={!isManual}
                                        onClick={() => handleLightClick(dir)}
                                        className={`w-full h-10 rounded-lg text-[10px] font-black transition-all duration-300 ${lights[dir] === 'green' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-transparent text-zinc-500 border-white/5'}`}
                                        variant="outline"
                                    >
                                        {lights[dir] === 'green' ? 'OPEN' : 'STOP'}
                                    </Button>
                                </Card>
                            ))}
                        </div>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                            <p className="text-[9px] text-amber-500 font-bold uppercase flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3" /> Collision_Interlock_On
                            </p>
                            <p className="text-[8px] text-zinc-500 leading-tight italic">Conflicting green lights are automatically blocked to maintain zero-accident protocol.</p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Active_Telemetry</span>
                            </div>
                            <div className="space-y-1 font-mono text-[9px] text-zinc-500">
                                <p>TOTAL_OBJS: {cars.length}</p>
                                <p>FLOW_RATE: {(cars.length / 10).toFixed(2)} ops/s</p>
                                <p>SYNC_STATUS: LYNX_OK</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)} className="border-white/10 hover:bg-white/5 font-black uppercase text-[9px]">
                                {isPaused ? <Play className="w-3 h-3 mr-2" /> : <Pause className="w-3 h-3 mr-2" />}
                                {isPaused ? "Resume Simulation" : "Pause Simulation"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCars([])} className="border-white/10 hover:bg-white/5 font-black uppercase text-[9px]">
                                <RefreshCcw className="w-3 h-3 mr-2" /> Reset Traffic
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* High-Fidelity Simulation Viewport */}
                <section className="flex-1 relative bg-[#050505] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <svg viewBox="0 0 100 100" className="w-full h-full max-w-[900px] aspect-square">
                            {/* Ground & Glow */}
                            <defs>
                                <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#050505" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                            <circle cx="50" cy="50" r="50" fill="url(#grad1)" />

                            {/* Road Geometry */}
                            <rect x="0" y="44" width="100" height="12" fill="#121212" />
                            <rect x="44" y="0" width="12" height="100" fill="#121212" />

                            {/* Surface Details */}
                            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" opacity="0.1" />
                            <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" opacity="0.1" />

                            {/* Central Junction */}
                            <rect x="44" y="44" width="12" height="12" fill="#181818" />
                            <rect x="45" y="45" width="10" height="10" stroke="#ffffff11" fill="none" strokeWidth="0.1" />

                            {/* Signal Intersections (Stop Indicators) */}
                            <line x1="43" y1="44" x2="43" y2="56" stroke="#ffffff11" strokeWidth="0.2" />
                            <line x1="57" y1="44" x2="57" y2="56" stroke="#ffffff11" strokeWidth="0.2" />
                            <line x1="44" y1="43" x2="56" y2="43" stroke="#ffffff11" strokeWidth="0.2" />
                            <line x1="44" y1="57" x2="56" y2="57" stroke="#ffffff11" strokeWidth="0.2" />

                            {/* Light Visual Nodes */}
                            <g>
                                {/* West Signal */}
                                <circle cx="41" cy="42" r="1.2" fill={lights.W === 'green' ? '#10b981' : '#ef4444'} className="animate-pulse" />
                                {/* North Signal */}
                                <circle cx="58" cy="42" r="1.2" fill={lights.N === 'green' ? '#10b981' : '#ef4444'} className="animate-pulse" />
                                {/* East Signal */}
                                <circle cx="59" cy="58" r="1.2" fill={lights.E === 'green' ? '#10b981' : '#ef4444'} className="animate-pulse" />
                                {/* South Signal */}
                                <circle cx="42" cy="58" r="1.2" fill={lights.S === 'green' ? '#10b981' : '#ef4444'} className="animate-pulse" />
                            </g>

                            {/* Dynamic Vehicle Rendering */}
                            {cars.map(car => {
                                let rotation = 0;
                                let tx = 0;
                                let ty = 0;

                                switch (car.direction) {
                                    case 'W': rotation = 0; tx = car.pos; ty = 46.5; break;
                                    case 'E': rotation = 180; tx = 100 - car.pos; ty = 50.5; break;
                                    case 'N': rotation = 90; tx = 50.5; ty = car.pos; break;
                                    case 'S': rotation = 270; tx = 46.5; ty = 100 - car.pos; break;
                                }

                                return (
                                    <g key={car.id} style={{ transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg)`, transition: 'transform 30ms linear' }}>
                                        {/* Car Body */}
                                        <rect x="-3" y="-1.5" width="6" height="3" rx="0.4" fill={car.color} />
                                        {/* Windshield */}
                                        <rect x="1" y="-1.2" width="1.5" height="2.4" fill="rgba(255,255,255,0.4)" rx="0.2" />
                                        {/* Headlights */}
                                        <rect x="2.6" y="-1.2" width="0.4" height="0.6" fill="#fff" opacity="0.8" />
                                        <rect x="2.6" y="0.6" width="0.4" height="0.6" fill="#fff" opacity="0.8" />
                                        {/* Active Brake Indicators */}
                                        {car.speed < 0.1 && (
                                            <>
                                                <rect x="-3.2" y="-1.2" width="0.4" height="0.6" fill="#ef4444" className="animate-pulse" />
                                                <rect x="-3.2" y="0.6" width="0.4" height="0.6" fill="#ef4444" className="animate-pulse" />
                                            </>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* Overlay Graphics */}
                    <div className="absolute top-8 left-8 space-y-2">
                        <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 backdrop-blur-md uppercase text-[9px] font-black tracking-widest">
                            Sync_Channel: Active
                        </Badge>
                        <h2 className="text-[32px] font-black tracking-tighter text-white/5 select-none leading-none uppercase">
                            BKK_Grid_Nexus
                        </h2>
                    </div>

                    {/* Floating Metrics HUD */}
                    <div className="absolute bottom-6 right-6 p-4 glass rounded-2xl border border-white/10 flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Load_Factor</span>
                            <div className="flex gap-0.5 mt-1">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className={`h-1.5 w-2 rounded-full ${i < cars.length / 3 ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="h-full w-px bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Live_Clock</span>
                            <span className="text-sm font-mono text-white/80">{new Date().toLocaleTimeString('en-GB', { hour12: false })}</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
