"use client";

import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Play, Pause, RefreshCcw, ShieldAlert,
    Navigation, Timer, Activity, Radio,
    Zap, ArrowUpDown, ArrowLeftRight
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
const CAR_LENGTH = 7;
const MIN_GAP = 2; // Fixed gap between cars

export default function SimulationPage() {
    const [lights, setLights] = useState({
        N: "red" as "green" | "red",
        S: "red" as "green" | "red",
        E: "green" as "green" | "red",
        W: "green" as "green" | "red",
    });
    const [currentPhase, setCurrentPhase] = useState<"NS" | "EW">("EW");
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

                        // RIGID COLLISION DETECTION (Treat as blocks)
                        const carInFront = idx > 0 ? laneCars[idx - 1] : null;
                        const distanceToNext = carInFront ? carInFront.pos - car.pos : 1000;

                        // If the car in front exists, it must be at least CAR_LENGTH + MIN_GAP ahead
                        const isTooClose = distanceToNext < (CAR_LENGTH + MIN_GAP);

                        if (shouldStopAtLight || isTooClose) {
                            // Rapid deceleration but smooth stopping
                            newSpeed = Math.max(0, car.speed - 0.1);
                        } else {
                            // Accelerate to target speed
                            newSpeed = Math.min(car.targetSpeed, car.speed + 0.05);
                        }

                        // Boundary check for car in front again during movement
                        const realNextPos = car.pos + newSpeed;
                        if (carInFront && realNextPos > carInFront.pos - (CAR_LENGTH + MIN_GAP)) {
                            newSpeed = 0; // Absolute stop if about to intersect
                        }

                        return { ...car, pos: car.pos + newSpeed, speed: newSpeed };
                    }).filter(car => car.pos < 120);

                    updatedCars = [...updatedCars, ...updatedLane];
                });

                // Spawn logic for all 4 directions
                if (Math.random() > 0.94 && updatedCars.length < 32) {
                    const spawnDir = directions[Math.floor(Math.random() * 4)];
                    const laneCount = updatedCars.filter(c => c.direction === spawnDir).length;

                    // Check if spawn point is clear
                    const firstInLane = updatedCars.filter(c => c.direction === spawnDir).sort((a, b) => a.pos - b.pos)[0];
                    const isSpawnClear = !firstInLane || firstInLane.pos > (CAR_LENGTH + MIN_GAP);

                    if (laneCount < 8 && isSpawnClear) {
                        updatedCars.push({
                            id: nextCarId.current++,
                            type: "sedan",
                            color: ["#ef4444", "#3b82f6", "#10b981", "#ffeb3b"][Math.floor(Math.random() * 4)],
                            direction: spawnDir,
                            pos: -5,
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

    // Synchronized Cycle Logic
    useEffect(() => {
        if (isManual || isPaused) return;

        const timer = setInterval(() => {
            togglePhase();
        }, 7000);

        return () => clearInterval(timer);
    }, [isManual, isPaused, currentPhase]);

    const togglePhase = () => {
        setCurrentPhase(prev => {
            const next = prev === "NS" ? "EW" : "NS";
            if (next === "NS") {
                setLights({ N: "green", S: "green", E: "red", W: "red" });
            } else {
                setLights({ N: "red", S: "red", E: "green", W: "green" });
            }
            return next;
        });
    };

    const toggleManual = () => setIsManual(!isManual);

    return (
        <div className="fixed inset-0 bg-[#020617] text-white flex flex-col overflow-hidden leading-tight">
            {/* Header Bar */}
            <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl px-8 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <Link href="/map" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <Navigation className="w-5 h-5 text-sky-400 rotate-[-45deg]" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-black tracking-tighter uppercase">Traffic_Core_S4_Precision</h1>
                        <p className="text-[10px] text-sky-400/50 font-mono italic">PHASE_SYNC_ACTIVE | BLOCK_COLLISION_V1</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Operation_Mode</span>
                        <Badge variant={isManual ? "destructive" : "outline"} className="px-3 py-0 h-5 font-mono text-[9px]">
                            {isManual ? "MANUAL_BYPASS" : "AI_SYNC_LOCKED"}
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleManual}
                        className={`border-white/10 ${isManual ? 'bg-red-500/10 text-red-400 border-red-500/50' : 'hover:bg-white/5'}`}
                    >
                        {isManual ? <ShieldAlert className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                        {isManual ? "Exit Manual Mode" : "Manual Override"}
                    </Button>
                </div>
            </header>

            <main className="flex-1 relative flex">
                {/* Manual Control Console */}
                <aside className="w-80 border-r border-white/5 bg-slate-950 p-6 flex flex-col gap-6 z-40 shadow-2xl">
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                            <Timer className="w-3 h-3 text-sky-400" /> Phase_Synchronization
                        </h2>

                        <div className="space-y-3">
                            <Card className={`p-4 border transition-all cursor-pointer ${currentPhase === 'NS' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-black/40 border-white/5'}`}
                                onClick={() => isManual && setCurrentPhase("NS") || isManual && setLights({ N: "green", S: "green", E: "red", W: "red" })}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phase A: North-South</span>
                                    <ArrowUpDown className={`w-4 h-4 ${currentPhase === 'NS' ? 'text-emerald-500' : 'text-zinc-700'}`} />
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={lights.N === 'green' ? 'default' : 'outline'} className={lights.N === 'green' ? 'bg-emerald-500 text-black font-black' : 'text-zinc-600'}>NORTH</Badge>
                                    <Badge variant={lights.S === 'green' ? 'default' : 'outline'} className={lights.S === 'green' ? 'bg-emerald-500 text-black font-black' : 'text-zinc-600'}>SOUTH</Badge>
                                </div>
                            </Card>

                            <Card className={`p-4 border transition-all cursor-pointer ${currentPhase === 'EW' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-black/40 border-white/5'}`}
                                onClick={() => isManual && setCurrentPhase("EW") || isManual && setLights({ N: "red", S: "red", E: "green", W: "green" })}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phase B: East-West</span>
                                    <ArrowLeftRight className={`w-4 h-4 ${currentPhase === 'EW' ? 'text-emerald-500' : 'text-zinc-700'}`} />
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant={lights.E === 'green' ? 'default' : 'outline'} className={lights.E === 'green' ? 'bg-emerald-500 text-black font-black' : 'text-zinc-600'}>EAST</Badge>
                                    <Badge variant={lights.W === 'green' ? 'default' : 'outline'} className={lights.W === 'green' ? 'bg-emerald-500 text-black font-black' : 'text-zinc-600'}>WEST</Badge>
                                </div>
                            </Card>

                            <Button
                                disabled={!isManual}
                                onClick={togglePhase}
                                className="w-full h-12 bg-sky-500/20 text-sky-400 border-sky-500/50 hover:bg-sky-500/30 font-black uppercase text-xs"
                                variant="outline"
                            >
                                <Zap className="w-4 h-4 mr-2" /> Manually Toggle Phase
                            </Button>
                        </div>

                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                            <p className="text-[9px] text-emerald-500 font-bold uppercase flex items-center gap-2">
                                <Zap className="w-3 h-3 animate-pulse" /> Precision_Block_Active
                            </p>
                            <p className="text-[8px] text-zinc-500 leading-tight italic">Vehicles are now treated as solid blocks. Zero overlap between object boundaries is enforced.</p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)} className="border-white/10 hover:bg-white/5 font-black uppercase text-[9px]">
                                {isPaused ? <Play className="w-3 h-3 mr-2" /> : <Pause className="w-3 h-3 mr-2" />}
                                {isPaused ? "Resume Simulation" : "Pause Simulation"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCars([])} className="border-white/10 hover:bg-white/5 font-black uppercase text-[9px]">
                                <RefreshCcw className="w-3 h-3 mr-2" /> Reset Environment
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

                            {/* Signal Indicators */}
                            <g>
                                <line x1="43" y1="44" x2="43" y2="56" stroke={lights.W === 'green' ? '#10b981' : '#ef4444'} strokeWidth="1" />
                                <line x1="57" y1="44" x2="57" y2="56" stroke={lights.E === 'green' ? '#10b981' : '#ef4444'} strokeWidth="1" />
                                <line x1="44" y1="43" x2="56" y2="43" stroke={lights.N === 'green' ? '#10b981' : '#ef4444'} strokeWidth="1" />
                                <line x1="44" y1="57" x2="56" y2="57" stroke={lights.S === 'green' ? '#10b981' : '#ef4444'} strokeWidth="1" />
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
                                        {/* Shadow */}
                                        <rect x="-3" y="-1.5" width="7" height="3" rx="0.4" fill="black" opacity="0.3" transform="translate(0.5, 0.5)" />
                                        {/* Car Body */}
                                        <rect x="-3" y="-1.5" width="7" height="3" rx="0.4" fill={car.color} />
                                        {/* Windshield */}
                                        <rect x="1.5" y="-1.2" width="2" height="2.4" fill="rgba(255,255,255,0.4)" rx="0.2" />
                                        {/* Top Detail */}
                                        <rect x="-1" y="-1" width="2" height="2" fill="rgba(0,0,0,0.1)" rx="0.1" />
                                        {/* Headlights */}
                                        <rect x="3.4" y="-1.2" width="0.6" height="0.6" fill="#fff" opacity="0.8" />
                                        <rect x="3.4" y="0.6" width="0.6" height="0.6" fill="#fff" opacity="0.8" />
                                        {/* Active Brake Indicators */}
                                        {car.speed < 0.1 && (
                                            <>
                                                <rect x="-3.2" y="-1.2" width="0.6" height="0.6" fill="#ef4444" className="animate-pulse shadow-[0_0_10px_red]" />
                                                <rect x="-3.2" y="0.6" width="0.6" height="0.6" fill="#ef4444" className="animate-pulse shadow-[0_0_10px_red]" />
                                            </>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* Overlay Graphics */}
                    <div className="absolute top-8 left-8 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 backdrop-blur-md uppercase text-[9px] font-black tracking-widest">
                                Solid_Block_Engine_v1.2
                            </Badge>
                        </div>
                        <h2 className="text-[32px] font-black tracking-tighter text-white/5 select-none leading-none uppercase italic">
                            GRID_PAIR_SIMULATOR
                        </h2>
                    </div>

                    {/* Status HUD */}
                    <div className="absolute top-8 right-8 flex gap-4">
                        <div className="glass p-3 px-5 rounded-2xl border border-white/5 flex flex-col items-center">
                            <span className="text-[8px] font-black text-zinc-500 uppercase">Current_Phase</span>
                            <span className="text-sm font-black text-sky-400 font-mono tracking-widest">{currentPhase === 'NS' ? 'PHASE_A' : 'PHASE_B'}</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
