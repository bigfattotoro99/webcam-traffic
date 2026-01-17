"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/lib/store/settings";
import {
    Play,
    Pause,
    RefreshCcw,
    Zap,
    ArrowDown,
    ArrowRight,
    ShieldAlert,
    Activity,
    Timer,
} from "lucide-react";

// --- Types & Constants ---

type Direction = "N" | "E"; // Only North (to South) and East (to East) for One-Way
type LightState = "green" | "yellow" | "red";
type PhaseState = "N_GREEN" | "N_YELLOW" | "ALL_RED_1" | "E_GREEN" | "E_YELLOW" | "ALL_RED_2";
type VehicleType = "car" | "truck";

interface Vehicle {
    id: string;
    type: VehicleType;
    laneId: string;
    direction: Direction;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    targetSpeed: number;
    state: "moving" | "stopped";
    hasCrossedIntersection: boolean;
}

const CANVAS_SIZE = 800;
const LANE_WIDTH = 50;
const ROAD_WIDTH = LANE_WIDTH * 4; // 200px
const CENTER = CANVAS_SIZE / 2;
const STOP_LINE_OFFSET = ROAD_WIDTH / 2 + 15;
const INTERSECTION_MIN = CENTER - ROAD_WIDTH / 2;
const INTERSECTION_MAX = CENTER + ROAD_WIDTH / 2;

const VEHICLE_CONFIGS = {
    car: { width: 40, height: 20 },
    truck: { width: 60, height: 28 },
};

export default function SimulationPage() {
    const { settings } = useSettingsStore();

    const [isPaused, setIsPaused] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [phase, setPhase] = useState<PhaseState>("N_GREEN");
    const [timer, setTimer] = useState(settings.greenDuration);
    const [cumulativePassed, setCumulativePassed] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vehiclesRef = useRef<Vehicle[]>([]);
    const nextIdRef = useRef(0);
    const requestRef = useRef<number | null>(null);
    const imagesRef = useRef<{ car: HTMLImageElement; truck: HTMLImageElement } | null>(null);

    // --- Map Phase to Lights ---
    const getLights = useCallback(() => {
        const l: Record<Direction, LightState> = { N: "red", E: "red" };
        switch (phase) {
            case "N_GREEN": l.N = "green"; break;
            case "N_YELLOW": l.N = "yellow"; break;
            case "E_GREEN": l.E = "green"; break;
            case "E_YELLOW": l.E = "yellow"; break;
            default: break; // ALL_RED
        }
        return l;
    }, [phase]);

    // --- Initialization ---
    useEffect(() => {
        const carImg = new Image(); carImg.src = "/vehicles/car.png";
        const truckImg = new Image(); truckImg.src = "/vehicles/truck.png";
        let loaded = 0;
        const onLoaded = () => { if (++loaded === 2) imagesRef.current = { car: carImg, truck: truckImg }; };
        carImg.onload = onLoaded; truckImg.onload = onLoaded;
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, []);

    // --- Simulation Update ---
    const spawnVehicle = useCallback(() => {
        ["N", "E"].forEach((dir) => {
            ["1", "2", "3", "4"].forEach((laneNum) => {
                const laneId = `${dir}${laneNum}`;
                if (Math.random() < settings.spawnRate / 60) {
                    const inLane = vehiclesRef.current.filter(v => v.laneId === laneId);
                    const headDist = inLane.length > 0 ? (dir === "N" ? Math.min(...inLane.map(v => v.y)) : Math.min(...inLane.map(v => v.x))) : 1000;

                    if (headDist > 100) { // Safety spawn distance
                        const type: VehicleType = Math.random() > 0.8 ? "truck" : "car";
                        const config = VEHICLE_CONFIGS[type];
                        let x = 0, y = 0;
                        if (dir === "N") {
                            x = CENTER - ROAD_WIDTH / 2 + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                            y = -50;
                        } else if (dir === "E") {
                            x = -50;
                            y = CENTER - ROAD_WIDTH / 2 + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                        }
                        vehiclesRef.current.push({
                            id: `v-${nextIdRef.current++}`, type, laneId, direction: dir as Direction, x, y,
                            width: config.width, height: config.height, speed: 0, targetSpeed: settings.vehicleSpeed,
                            state: "moving", hasCrossedIntersection: false
                        });
                    }
                }
            });
        });
    }, [settings]);

    const updateSimulation = useCallback(() => {
        if (isPaused) return;
        spawnVehicle();
        const lights = getLights();
        vehiclesRef.current = vehiclesRef.current.map(v => {
            let targetSpeed = v.targetSpeed;
            let shouldStop = false;

            const stopLine = INTERSECTION_MIN - 15;
            const isApproaching = (v.direction === "N" && v.y < stopLine) || (v.direction === "E" && v.x < stopLine);
            const distToLine = v.direction === "N" ? stopLine - (v.y + v.width / 2) : stopLine - (v.x + v.width / 2);

            if (isApproaching && !v.hasCrossedIntersection) {
                if (lights[v.direction] === "red" && distToLine < 5) shouldStop = true;
                else if (lights[v.direction] === "yellow") {
                    if (distToLine < 0) { /* Go through */ }
                    else if (distToLine < 60) shouldStop = true;
                }
            }

            // Collision
            const inFront = vehiclesRef.current.find(o => o.laneId === v.laneId && (v.direction === "N" ? o.y > v.y : o.x > v.x) && Math.abs(v.direction === "N" ? o.y - v.y : o.x - v.x) < 180);
            if (inFront) {
                const gap = v.direction === "N" ? inFront.y - v.y : inFront.x - v.x;
                const actualGap = gap - (v.width / 2 + inFront.width / 2);
                if (actualGap < settings.minGap) shouldStop = true;
                else if (actualGap < settings.minGap + 30) targetSpeed = Math.min(targetSpeed, (actualGap / (settings.minGap + 30)) * v.targetSpeed);
            }

            if (shouldStop) { v.speed = Math.max(0, v.speed - 0.2); v.state = "stopped"; }
            else { v.speed = v.speed < targetSpeed ? Math.min(targetSpeed, v.speed + 0.08) : Math.max(targetSpeed, v.speed - 0.15); v.state = v.speed > 0.1 ? "moving" : "stopped"; }

            if (v.direction === "N") v.y += v.speed; else if (v.direction === "E") v.x += v.speed;

            if (!v.hasCrossedIntersection) {
                if ((v.direction === "N" && v.y > INTERSECTION_MAX) || (v.direction === "E" && v.x > INTERSECTION_MAX)) {
                    v.hasCrossedIntersection = true; setCumulativePassed(p => p + 1);
                }
            }
            return v;
        }).filter(v => v.x < CANVAS_SIZE + 100 && v.y < CANVAS_SIZE + 100);
    }, [isPaused, spawnVehicle, getLights, settings]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "#0a0a0c"; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Road Background
        ctx.fillStyle = "#16161a";
        ctx.fillRect(CENTER - ROAD_WIDTH / 2, 0, ROAD_WIDTH, CANVAS_SIZE); // North to South
        ctx.fillRect(0, CENTER - ROAD_WIDTH / 2, CANVAS_SIZE, ROAD_WIDTH); // West to East

        // Lane Markers
        ctx.setLineDash([15, 20]); ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"; ctx.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
            // Vertical lanes
            const vx = INTERSECTION_MIN + i * LANE_WIDTH;
            ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx, CANVAS_SIZE); ctx.stroke();
            // Horizontal lanes
            const vy = INTERSECTION_MIN + i * LANE_WIDTH;
            ctx.beginPath(); ctx.moveTo(0, vy); ctx.lineTo(CANVAS_SIZE, vy); ctx.stroke();
        }

        // Road Borders
        ctx.setLineDash([]); ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"; ctx.lineWidth = 2;
        ctx.strokeRect(CENTER - ROAD_WIDTH / 2, 0, ROAD_WIDTH, CANVAS_SIZE);
        ctx.strokeRect(0, CENTER - ROAD_WIDTH / 2, CANVAS_SIZE, ROAD_WIDTH);

        // Stop Lines
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 4;
        // N (Top)
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN, INTERSECTION_MIN - 15); ctx.lineTo(INTERSECTION_MAX, INTERSECTION_MIN - 15); ctx.stroke();
        // E (Left)
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN - 15, INTERSECTION_MIN); ctx.lineTo(INTERSECTION_MIN - 15, INTERSECTION_MAX); ctx.stroke();

        const lights = getLights();
        // North Light (Top Right of intersection)
        const drawTrafficLight = (lx: number, ly: number, color: LightState) => {
            ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(lx, ly, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = color === "green" ? "#10b981" : color === "yellow" ? "#f59e0b" : "#ef4444";
            if (color !== "red") { ctx.shadowBlur = 20; ctx.shadowColor = ctx.fillStyle; }
            ctx.beginPath(); ctx.arc(lx, ly, 10, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        };

        drawTrafficLight(INTERSECTION_MAX + 25, INTERSECTION_MIN - 25, lights.N); // N
        drawTrafficLight(INTERSECTION_MIN - 25, INTERSECTION_MAX + 25, lights.E); // E

        // Directional Arrows on road
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        for (let i = 0; i < 4; i++) {
            const lx = INTERSECTION_MIN + (i + 0.5) * LANE_WIDTH;
            const ly = INTERSECTION_MIN + (i + 0.5) * LANE_WIDTH;
            // North Arrows
            ctx.fillText("↓", lx - 4, 100); ctx.fillText("↓", lx - 4, 700);
            // East Arrows
            ctx.fillText("→", 100, ly + 4); ctx.fillText("→", 700, ly + 4);
        }

        vehiclesRef.current.forEach(v => {
            ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(v.direction === "N" ? Math.PI / 2 : 0);
            if (imagesRef.current) ctx.drawImage(imagesRef.current[v.type], -v.width / 2, -v.height / 2, v.width, v.height);
            else { ctx.fillStyle = v.type === "truck" ? "#3b82f6" : "#f59e0b"; ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height); }
            if (v.state === "stopped") { ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(-v.width / 2, -v.height / 3, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-v.width / 2, v.height / 3, 3, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
        });
    }, [getLights]);

    useEffect(() => {
        const loop = () => { const ctx = canvasRef.current?.getContext("2d"); if (ctx) { updateSimulation(); draw(ctx); } requestRef.current = requestAnimationFrame(loop); };
        requestRef.current = requestAnimationFrame(loop); return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [updateSimulation, draw]);

    // --- Phase Timer ---
    useEffect(() => {
        if (isPaused || isManual) return;
        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    setPhase(p => {
                        if (p === "N_GREEN") { setTimer(settings.yellowDuration); return "N_YELLOW"; }
                        if (p === "N_YELLOW") { setTimer(1); return "ALL_RED_1"; }
                        if (p === "ALL_RED_1") { setTimer(settings.greenDuration); return "E_GREEN"; }
                        if (p === "E_GREEN") { setTimer(settings.yellowDuration); return "E_YELLOW"; }
                        if (p === "E_YELLOW") { setTimer(1); return "ALL_RED_2"; }
                        setTimer(settings.greenDuration); return "N_GREEN";
                    });
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused, isManual, settings]);

    const togglePhase = () => {
        if (!isManual) return;
        setPhase(p => p.startsWith("N") ? "E_GREEN" : "N_GREEN");
        setTimer(settings.greenDuration);
    };

    return (
        <ProtectedRoute>
            <div className="fixed inset-0 bg-[#020617] text-white flex flex-col overflow-hidden">
                <Navigation />
                <main className="flex-1 flex overflow-hidden">
                    <aside className="w-80 border-r border-white/5 bg-slate-950 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-amber-500" /> Control</h2>
                            <Badge variant={isManual ? "destructive" : "outline"} className="text-[9px]">{isManual ? "MANUAL" : "AUTO"}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => setIsManual(!isManual)} variant="outline" className={`h-12 ${isManual ? 'bg-amber-500/10 text-amber-500' : ''}`}>{isManual ? <Zap className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />} {isManual ? "Auto" : "Manual"}</Button>
                            <Button onClick={() => setIsPaused(!isPaused)} variant="outline" className="h-12 border-white/10">{isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />} {isPaused ? "Resume" : "Pause"}</Button>
                        </div>
                        <Card className="bg-black/40 border-white/5 p-4 space-y-4">
                            <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-500">One-Way Cycle</span><div className="flex items-center gap-2 text-sky-400 font-mono text-xs"><Timer className="w-3 h-3" /> {timer}s</div></div>
                            <div className="space-y-2">
                                <Button disabled={!isManual} onClick={togglePhase} className={`w-full justify-start gap-3 h-14 uppercase ${phase.startsWith("N") ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'text-zinc-600 border-white/5'}`} variant="outline"><ArrowDown className="w-4 h-4" /> <div><div className="text-[8px] font-black">ONE-WAY A</div><div className="text-[10px]">NORTH ➔ SOUTH</div></div></Button>
                                <Button disabled={!isManual} onClick={togglePhase} className={`w-full justify-start gap-3 h-14 uppercase ${phase.startsWith("E") ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'text-zinc-600 border-white/5'}`} variant="outline"><ArrowRight className="w-4 h-4" /> <div><div className="text-[8px] font-black">ONE-WAY B</div><div className="text-[10px]">WEST ➔ EAST</div></div></Button>
                            </div>
                        </Card>
                        <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl space-y-2">
                            <h3 className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Efficiency</h3>
                            <div className="grid grid-cols-2 gap-4"><div><p className="text-[8px] text-zinc-500 uppercase">Active_Lanes</p><p className="text-lg font-black">8_LANES</p></div><div><p className="text-[8px] text-zinc-500 uppercase">Flow_Rate</p><p className="text-lg font-black">{cumulativePassed}</p></div></div>
                        </div>
                        <Button onClick={() => { vehiclesRef.current = []; setCumulativePassed(0); }} variant="outline" className="mt-auto h-10 border-white/10 text-zinc-500 text-[10px] font-black uppercase tracking-widest"><RefreshCcw className="w-3 h-3 mr-2" /> Reset Engine</Button>
                    </aside>
                    <section className="flex-1 relative bg-[#060608] flex items-center justify-center p-8 overflow-hidden">
                        <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 rounded-2xl overflow-hidden aspect-square h-full max-h-[90vh]">
                            <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full h-full" />
                            <div className="absolute top-6 left-6 pointer-events-none"><Badge className="bg-amber-500 text-black font-black text-[10px] tracking-widest px-2 animate-pulse mb-2">ONE_WAY_ACTIVE</Badge><h2 className="text-3xl font-black text-white/5 italic select-none">SMART_GRID_V4.0</h2></div>
                            <div className="absolute bottom-6 right-6 pointer-events-none text-right font-black text-[10px] text-sky-500/50 uppercase tracking-widest">{phase.replace("_", " ")}</div>
                        </div>
                    </section>
                </main>
            </div>
        </ProtectedRoute>
    );
}
