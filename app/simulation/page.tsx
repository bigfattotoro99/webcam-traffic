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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types & Constants ---

type Direction = "N" | "S" | "E" | "W";
type LightState = "green" | "yellow" | "red";
type PhaseState =
    // 2-Way Phases
    | "2W_NS_GREEN" | "2W_NS_YELLOW" | "2W_WE_GREEN" | "2W_WE_YELLOW"
    // 1-Way Phases (Sequential 4 Direction)
    | "1W_N_GREEN" | "1W_N_YELLOW" | "1W_S_GREEN" | "1W_S_YELLOW"
    | "1W_W_GREEN" | "1W_W_YELLOW" | "1W_E_GREEN" | "1W_E_YELLOW"
    | "ALL_RED";
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
const INTERSECTION_MIN = CENTER - ROAD_WIDTH / 2;
const INTERSECTION_MAX = CENTER + ROAD_WIDTH / 2;

const VEHICLE_CONFIGS = {
    car: { width: 40, height: 20 },
    truck: { width: 60, height: 28 },
};

export default function SimulationPage() {
    const { settings } = useSettingsStore();

    const [simMode, setSimMode] = useState<"1way" | "2way">("2way");
    const [isPaused, setIsPaused] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [phase, setPhase] = useState<PhaseState>("2W_NS_GREEN");
    const [timer, setTimer] = useState(settings.greenDuration);
    const [cumulativePassed, setCumulativePassed] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vehiclesRef = useRef<Vehicle[]>([]);
    const nextIdRef = useRef(0);
    const requestRef = useRef<number | null>(null);
    const imagesRef = useRef<{ car: HTMLImageElement; truck: HTMLImageElement } | null>(null);

    // Reset when mode changes
    useEffect(() => {
        vehiclesRef.current = [];
        setCumulativePassed(0);
        setPhase(simMode === "2way" ? "2W_NS_GREEN" : "1W_N_GREEN");
        setTimer(settings.greenDuration);
    }, [simMode, settings.greenDuration]);

    // --- Map Phase to Lights ---
    const getLights = useCallback(() => {
        const l: Record<Direction, LightState> = { N: "red", S: "red", E: "red", W: "red" };

        switch (phase) {
            case "2W_NS_GREEN": l.N = "green"; l.S = "green"; break;
            case "2W_NS_YELLOW": l.N = "yellow"; l.S = "yellow"; break;
            case "2W_WE_GREEN": l.W = "green"; l.E = "green"; break;
            case "2W_WE_YELLOW": l.W = "yellow"; l.E = "yellow"; break;

            case "1W_N_GREEN": l.N = "green"; break;
            case "1W_N_YELLOW": l.N = "yellow"; break;
            case "1W_S_GREEN": l.S = "green"; break;
            case "1W_S_YELLOW": l.S = "yellow"; break;
            case "1W_W_GREEN": l.W = "green"; break;
            case "1W_W_YELLOW": l.W = "yellow"; break;
            case "1W_E_GREEN": l.E = "green"; break;
            case "1W_E_YELLOW": l.E = "yellow"; break;
            default: break;
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
        const directions: Direction[] = ["N", "S", "E", "W"];

        directions.forEach((dir) => {
            let lanes = ["1", "2", "3", "4"];
            if (simMode === "2way") {
                lanes = (dir === "N" || dir === "E") ? ["1", "2"] : ["3", "4"];
            }

            lanes.forEach((laneNum) => {
                const laneId = `${dir}${laneNum}`;
                const spawnChance = simMode === "2way" ? settings.spawnRate / 120 : settings.spawnRate / 60;

                if (Math.random() < spawnChance) {
                    const inLane = vehiclesRef.current.filter(v => v.laneId === laneId);

                    let headDist = 1000;
                    if (inLane.length > 0) {
                        if (dir === "N") headDist = Math.min(...inLane.map(v => v.y));
                        else if (dir === "S") headDist = CANVAS_SIZE - Math.max(...inLane.map(v => v.y));
                        else if (dir === "W") headDist = Math.min(...inLane.map(v => v.x));
                        else if (dir === "E") headDist = CANVAS_SIZE - Math.max(...inLane.map(v => v.x));
                    }

                    if (headDist > 120) {
                        const type: VehicleType = Math.random() > 0.8 ? "truck" : "car";
                        const config = VEHICLE_CONFIGS[type];
                        let x = 0, y = 0;
                        if (dir === "N") {
                            x = INTERSECTION_MIN + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                            y = -50;
                        } else if (dir === "S") {
                            x = INTERSECTION_MIN + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                            y = CANVAS_SIZE + 50;
                        } else if (dir === "W") {
                            x = -50;
                            y = INTERSECTION_MIN + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                        } else if (dir === "E") {
                            x = CANVAS_SIZE + 50;
                            y = INTERSECTION_MIN + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
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
    }, [settings, simMode]);

    const updateSimulation = useCallback(() => {
        if (isPaused) return;
        spawnVehicle();
        const lights = getLights();
        vehiclesRef.current = vehiclesRef.current.map(v => {
            let targetSpeed = v.targetSpeed;
            let shouldStop = false;

            // Stop Line Calculation
            let stopLineCoord = 0;
            let isApproaching = false;

            if (simMode === "2way") {
                stopLineCoord = (v.direction === "N" || v.direction === "W") ? INTERSECTION_MIN - 15 : INTERSECTION_MAX + 15;
                isApproaching = (v.direction === "N" && v.y < stopLineCoord) ||
                    (v.direction === "S" && v.y > stopLineCoord) ||
                    (v.direction === "W" && v.x < stopLineCoord) ||
                    (v.direction === "E" && v.x > stopLineCoord);
            } else {
                // In 1-Way mode, each direction has its own entry/exit side
                stopLineCoord = (v.direction === "N" || v.direction === "W") ? INTERSECTION_MIN - 15 : INTERSECTION_MAX + 15;
                isApproaching =
                    (v.direction === "N" && v.y < stopLineCoord) ||
                    (v.direction === "S" && v.y > stopLineCoord) ||
                    (v.direction === "W" && v.x < stopLineCoord) ||
                    (v.direction === "E" && v.x > stopLineCoord);
            }

            const distToLine = Math.abs(v.direction === "N" || v.direction === "S" ? stopLineCoord - v.y : stopLineCoord - v.x) - (v.width / 2);

            if (isApproaching && !v.hasCrossedIntersection) {
                if (lights[v.direction] === "red" && distToLine < 10) shouldStop = true;
                else if (lights[v.direction] === "yellow") {
                    if (distToLine < 0) { /* Crossed */ }
                    else if (distToLine < 60) shouldStop = true;
                }
            }

            // --- Collision Logic ---
            let inFront: Vehicle | null = null;
            let minGapInLane = 1000;

            vehiclesRef.current.forEach(o => {
                if (o.id === v.id || o.laneId !== v.laneId) return;

                let gap = 0;
                if (v.direction === "N") gap = o.y - v.y;
                else if (v.direction === "S") gap = v.y - o.y;
                else if (v.direction === "W") gap = o.x - v.x;
                else if (v.direction === "E") gap = v.x - o.x;

                if (gap > 0 && gap < minGapInLane) {
                    minGapInLane = gap;
                    inFront = o;
                }
            });

            if (inFront) {
                const actualGap = minGapInLane - (v.width / 2 + (inFront as Vehicle).width / 2);
                if (actualGap < settings.minGap) {
                    shouldStop = true;
                    targetSpeed = Math.min(targetSpeed, (inFront as Vehicle).speed);
                } else if (actualGap < settings.minGap + 40) {
                    const brakeFactor = (actualGap - settings.minGap) / 40;
                    targetSpeed = Math.min(targetSpeed, (inFront as Vehicle).speed + (v.targetSpeed - (inFront as Vehicle).speed) * brakeFactor);
                }
            }

            // --- Physics & Movement ---
            if (shouldStop) {
                v.speed = Math.max(0, v.speed - 0.35);
                v.state = "stopped";
            } else {
                if (v.speed < targetSpeed) v.speed = Math.min(targetSpeed, v.speed + 0.15);
                else v.speed = Math.max(targetSpeed, v.speed - 0.25);
                v.state = v.speed > 0.1 ? "moving" : "stopped";
            }

            // Move
            if (v.direction === "N") v.y += v.speed;
            else if (v.direction === "S") v.y -= v.speed;
            else if (v.direction === "W") v.x += v.speed;
            else if (v.direction === "E") v.x -= v.speed;

            if (!v.hasCrossedIntersection) {
                const hasExited =
                    (v.direction === "N" && v.y > INTERSECTION_MAX) ||
                    (v.direction === "S" && v.y < INTERSECTION_MIN) ||
                    (v.direction === "W" && v.x > INTERSECTION_MAX) ||
                    (v.direction === "E" && v.x < INTERSECTION_MIN);

                if (hasExited) {
                    v.hasCrossedIntersection = true;
                    setCumulativePassed(p => p + 1);
                }
            }
            return v;
        }).filter(v =>
            v.x > -100 && v.x < CANVAS_SIZE + 100 &&
            v.y > -100 && v.y < CANVAS_SIZE + 100
        );
    }, [isPaused, spawnVehicle, getLights, settings, simMode]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "#0a0a0c"; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Road Background
        ctx.fillStyle = "#16161a";
        ctx.fillRect(INTERSECTION_MIN, 0, ROAD_WIDTH, CANVAS_SIZE);
        ctx.fillRect(0, INTERSECTION_MIN, CANVAS_SIZE, ROAD_WIDTH);

        // Lane Markers
        for (let i = 1; i < 4; i++) {
            if (i === 2 && simMode === "2way") { // Center divider only for 2way
                ctx.setLineDash([]); ctx.strokeStyle = "rgba(251, 191, 36, 0.3)"; ctx.lineWidth = 2;
            } else {
                ctx.setLineDash([15, 20]); ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; ctx.lineWidth = 1;
            }
            const vx = INTERSECTION_MIN + i * LANE_WIDTH;
            ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx, CANVAS_SIZE); ctx.stroke();
            const vy = INTERSECTION_MIN + i * LANE_WIDTH;
            ctx.beginPath(); ctx.moveTo(0, vy); ctx.lineTo(CANVAS_SIZE, vy); ctx.stroke();
        }

        // Stop Lines
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 4; ctx.setLineDash([]);
        if (simMode === "2way") {
            ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN, INTERSECTION_MIN - 15); ctx.lineTo(CENTER, INTERSECTION_MIN - 15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(CENTER, INTERSECTION_MAX + 15); ctx.lineTo(INTERSECTION_MAX, INTERSECTION_MAX + 15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN - 15, CENTER); ctx.lineTo(INTERSECTION_MIN - 15, INTERSECTION_MAX); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(INTERSECTION_MAX + 15, INTERSECTION_MIN); ctx.lineTo(INTERSECTION_MAX + 15, CENTER); ctx.stroke();
        } else {
            // Sequential 1-Way: draw full stop lines for each entry as it comes
            ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN, INTERSECTION_MIN - 15); ctx.lineTo(INTERSECTION_MAX, INTERSECTION_MIN - 15); ctx.stroke(); // N
            ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN, INTERSECTION_MAX + 15); ctx.lineTo(INTERSECTION_MAX, INTERSECTION_MAX + 15); ctx.stroke(); // S
            ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN - 15, INTERSECTION_MIN); ctx.lineTo(INTERSECTION_MIN - 15, INTERSECTION_MAX); ctx.stroke(); // W
            ctx.beginPath(); ctx.moveTo(INTERSECTION_MAX + 15, INTERSECTION_MIN); ctx.lineTo(INTERSECTION_MAX + 15, INTERSECTION_MAX); ctx.stroke(); // E
        }

        const lights = getLights();
        const drawTrafficLight = (lx: number, ly: number, color: LightState) => {
            ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(lx, ly, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = color === "green" ? "#10b981" : color === "yellow" ? "#f59e0b" : "#ef4444";
            if (color !== "red") { ctx.shadowBlur = 20; ctx.shadowColor = ctx.fillStyle; }
            ctx.beginPath(); ctx.arc(lx, ly, 10, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        };

        if (simMode === "2way") {
            drawTrafficLight(INTERSECTION_MAX + 25, INTERSECTION_MIN - 25, lights.N);
            drawTrafficLight(INTERSECTION_MIN - 25, INTERSECTION_MAX + 25, lights.S);
            drawTrafficLight(INTERSECTION_MIN - 25, INTERSECTION_MIN - 25, lights.W);
            drawTrafficLight(INTERSECTION_MAX + 25, INTERSECTION_MAX + 25, lights.E);
        } else {
            drawTrafficLight(INTERSECTION_MAX + 25, INTERSECTION_MIN - 25, lights.N);
            drawTrafficLight(INTERSECTION_MIN - 25, INTERSECTION_MAX + 25, lights.S);
            drawTrafficLight(INTERSECTION_MIN - 25, INTERSECTION_MIN - 25, lights.W);
            drawTrafficLight(INTERSECTION_MAX + 25, INTERSECTION_MAX + 25, lights.E);
        }

        vehiclesRef.current.forEach(v => {
            ctx.save(); ctx.translate(v.x, v.y);
            let rotation = 0;
            if (v.direction === "N") rotation = Math.PI / 2;
            else if (v.direction === "S") rotation = -Math.PI / 2;
            else if (v.direction === "W") rotation = 0;
            else if (v.direction === "E") rotation = Math.PI;

            ctx.rotate(rotation);
            if (imagesRef.current) ctx.drawImage(imagesRef.current[v.type], -v.width / 2, -v.height / 2, v.width, v.height);
            else { ctx.fillStyle = v.direction === "N" || v.direction === "S" ? "#3b82f6" : "#f59e0b"; ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height); }
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
                        if (simMode === "2way") {
                            if (p === "2W_NS_GREEN") { setTimer(settings.yellowDuration); return "2W_NS_YELLOW"; }
                            if (p === "2W_NS_YELLOW") { setTimer(2); return "ALL_RED"; }
                            if (p === "ALL_RED" || p === "2W_WE_YELLOW") { setTimer(settings.greenDuration); return p === "2W_WE_YELLOW" ? "2W_NS_GREEN" : "2W_WE_GREEN"; }
                            if (p === "2W_WE_GREEN") { setTimer(settings.yellowDuration); return "2W_WE_YELLOW"; }
                            return "2W_NS_GREEN";
                        } else {
                            if (p === "1W_N_GREEN") { setTimer(settings.yellowDuration); return "1W_N_YELLOW"; }
                            if (p === "1W_N_YELLOW") { setTimer(1); return "1W_S_GREEN"; }
                            if (p === "1W_S_GREEN") { setTimer(settings.yellowDuration); return "1W_S_YELLOW"; }
                            if (p === "1W_S_YELLOW") { setTimer(1); return "1W_W_GREEN"; }
                            if (p === "1W_W_GREEN") { setTimer(settings.yellowDuration); return "1W_W_YELLOW"; }
                            if (p === "1W_W_YELLOW") { setTimer(1); return "1W_E_GREEN"; }
                            if (p === "1W_E_GREEN") { setTimer(settings.yellowDuration); return "1W_E_YELLOW"; }
                            setTimer(settings.greenDuration); return "1W_N_GREEN";
                        }
                    });
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused, isManual, settings, simMode]);

    const togglePhase = () => {
        if (!isManual) return;
        if (simMode === "2way") setPhase(p => p.startsWith("2W_NS") ? "2W_WE_GREEN" : "2W_NS_GREEN");
        else {
            setPhase(p => {
                if (p.includes("N")) return "1W_S_GREEN";
                if (p.includes("S")) return "1W_W_GREEN";
                if (p.includes("W")) return "1W_E_GREEN";
                return "1W_N_GREEN";
            });
        }
        setTimer(settings.greenDuration);
    };

    return (
        <ProtectedRoute>
            <div className="fixed inset-0 bg-[#020617] text-white flex flex-col overflow-hidden">
                <Navigation />
                <main className="flex-1 flex overflow-hidden">
                    <aside className="w-80 border-r border-white/5 bg-slate-950 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Simulation Mode</h2>
                            <Tabs value={simMode} onValueChange={(v) => setSimMode(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/5">
                                    <TabsTrigger value="1way" className="text-xs uppercase font-black">1-Way</TabsTrigger>
                                    <TabsTrigger value="2way" className="text-xs uppercase font-black">2-Way</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-amber-500" /> Control</h2>
                            <Badge variant={isManual ? "destructive" : "outline"} className="text-[9px]">{isManual ? "MANUAL" : "AUTO"}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => setIsManual(!isManual)} variant="outline" className={`h-12 ${isManual ? 'bg-amber-500/10 text-amber-500' : ''}`}>{isManual ? <Zap className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />} {isManual ? "Auto" : "Manual"}</Button>
                            <Button onClick={() => setIsPaused(!isPaused)} variant="outline" className="h-12 border-white/10">{isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />} {isPaused ? "Resume" : "Pause"}</Button>
                        </div>
                        <Card className="bg-black/40 border-white/5 p-4 space-y-4">
                            <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-500">{simMode === "1way" ? "1-Way Cycle" : "2-Way Cycle"}</span><div className="flex items-center gap-2 text-sky-400 font-mono text-xs"><Timer className="w-3 h-3" /> {timer}s</div></div>
                            <div className="space-y-2">
                                <Button disabled={!isManual} onClick={togglePhase} className={`w-full justify-start gap-3 h-14 uppercase ${phase.includes("NS") || phase.includes("_N_") || phase.includes("_S_") ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'text-zinc-600 border-white/5'}`} variant="outline">
                                    <div className="flex flex-col">
                                        <div className="text-[8px] font-black">PHASE A</div>
                                        <div className="text-[10px]">{simMode === "2way" ? "NORTH ⇵ SOUTH" : "VERTICAL FLOW"}</div>
                                    </div>
                                </Button>
                                <Button disabled={!isManual} onClick={togglePhase} className={`w-full justify-start gap-3 h-14 uppercase ${phase.includes("WE") || phase.includes("_W_") || phase.includes("_E_") ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'text-zinc-600 border-white/5'}`} variant="outline">
                                    <div className="flex flex-col">
                                        <div className="text-[8px] font-black">PHASE B</div>
                                        <div className="text-[10px]">{simMode === "2way" ? "WEST ⇄ EAST" : "HORIZONTAL FLOW"}</div>
                                    </div>
                                </Button>
                            </div>
                        </Card>
                        <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl space-y-2">
                            <h3 className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Efficiency</h3>
                            <div className="grid grid-cols-2 gap-4"><div><p className="text-[8px] text-zinc-500 uppercase">Mode</p><p className="text-lg font-black">{simMode.toUpperCase()}</p></div><div><p className="text-[8px] text-zinc-500 uppercase">Flow_Rate</p><p className="text-lg font-black">{cumulativePassed}</p></div></div>
                        </div>
                        <Button onClick={() => { vehiclesRef.current = []; setCumulativePassed(0); }} variant="outline" className="mt-auto h-10 border-white/10 text-zinc-500 text-[10px] font-black uppercase tracking-widest"><RefreshCcw className="w-3 h-3 mr-2" /> Reset Engine</Button>
                    </aside>
                    <section className="flex-1 relative bg-[#060608] flex items-center justify-center p-8 overflow-hidden">
                        <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 rounded-2xl overflow-hidden aspect-square h-full max-h-[90vh]">
                            <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full h-full" />
                            <div className="absolute top-6 left-6 pointer-events-none">
                                <Badge className="bg-emerald-500 text-white font-black text-[10px] tracking-widest px-2 animate-pulse mb-2">{simMode.toUpperCase()}_MODE</Badge>
                                <h2 className="text-3xl font-black text-white/5 italic select-none">SMART_GRID_V6.0</h2>
                            </div>
                            <div className="absolute bottom-6 right-6 pointer-events-none text-right font-black text-[10px] text-sky-500/50 uppercase tracking-widest">{phase.replace("_", " ")}</div>
                        </div>
                    </section>
                </main>
            </div>
        </ProtectedRoute>
    );
}
