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
    ArrowUpDown,
    ArrowLeftRight,
    ShieldAlert,
    Activity,
    Timer,
    ExternalLink,
} from "lucide-react";

// --- Types & Constants ---

type Direction = "N" | "S" | "E" | "W";
type Phase = "NS" | "EW";
type VehicleType = "car" | "truck";

interface Vehicle {
    id: string;
    type: VehicleType;
    laneId: string; // e.g., "N1", "N2"
    direction: Direction;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    targetSpeed: number;
    state: "moving" | "stopped";
    hasCrossedIntersection: boolean;
    color?: string; // For fallback rendering
}

const CANVAS_SIZE = 800;
const ROAD_WIDTH = 120; // 60px per lane (2 lanes = 120px)
const LANE_WIDTH = 60;
const CENTER = CANVAS_SIZE / 2;
const STOP_LINE_OFFSET = ROAD_WIDTH / 2 + 10;
const INTERSECTION_MIN = CENTER - ROAD_WIDTH / 2;
const INTERSECTION_MAX = CENTER + ROAD_WIDTH / 2;

// --- Vehicle Assets ---

const VEHICLE_CONFIGS = {
    car: { width: 40, height: 20 },
    truck: { width: 60, height: 28 },
};

export default function SimulationPage() {
    const { settings } = useSettingsStore();

    // --- State ---
    const [isPaused, setIsPaused] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<Phase>("EW");
    const [phaseTimer, setPhaseTimer] = useState(settings.greenDuration);
    const [cumulativePassed, setCumulativePassed] = useState(0);

    // --- Refs ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vehiclesRef = useRef<Vehicle[]>([]);
    const nextIdRef = useRef(0);
    const requestRef = useRef<number>();
    const imagesRef = useRef<{ car: HTMLImageElement; truck: HTMLImageElement } | null>(null);
    const reservationRef = useRef<Set<string>>(new Set()); // Simple reservation by area/lane

    // --- Initialization ---

    useEffect(() => {
        // Load images
        const carImg = new Image();
        carImg.src = "/vehicles/car.png";
        const truckImg = new Image();
        truckImg.src = "/vehicles/truck.png";

        let loaded = 0;
        const onLoaded = () => {
            loaded++;
            if (loaded === 2) {
                imagesRef.current = { car: carImg, truck: truckImg };
            }
        };
        carImg.onload = onLoaded;
        truckImg.onload = onLoaded;

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // --- Simulation Logic ---

    const spawnVehicle = useCallback(() => {
        const directions: Direction[] = ["N", "S", "E", "W"];
        const lanes = ["1", "2"];

        directions.forEach((dir) => {
            lanes.forEach((laneNum) => {
                const laneId = `${dir}${laneNum}`;
                const spawnProb = settings.spawnRate / 60; // Approximate per frame probability

                if (Math.random() < spawnProb) {
                    // Check if spawn area is clear
                    const existingInLane = vehiclesRef.current.filter((v) => v.laneId === laneId);
                    let canSpawn = true;

                    existingInLane.forEach((v) => {
                        let dist = 0;
                        if (dir === "N") dist = v.y;
                        if (dir === "S") dist = CANVAS_SIZE - v.y;
                        if (dir === "E") dist = v.x;
                        if (dir === "W") dist = CANVAS_SIZE - v.x;

                        if (dist < 100) canSpawn = false; // Too close to spawn point
                    });

                    if (canSpawn) {
                        const type: VehicleType = Math.random() > 0.8 ? "truck" : "car";
                        const config = VEHICLE_CONFIGS[type];
                        const id = `v-${nextIdRef.current++}`;

                        let x = 0, y = 0;
                        if (dir === "N") {
                            x = CENTER - ROAD_WIDTH / 2 + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                            y = -50;
                        } else if (dir === "S") {
                            x = CENTER + ROAD_WIDTH / 2 - (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                            y = CANVAS_SIZE + 50;
                        } else if (dir === "E") {
                            x = -50;
                            y = CENTER + ROAD_WIDTH / 2 - (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                        } else if (dir === "W") {
                            x = CANVAS_SIZE + 50;
                            y = CENTER - ROAD_WIDTH / 2 + (parseInt(laneNum) - 0.5) * LANE_WIDTH;
                        }

                        vehiclesRef.current.push({
                            id,
                            type,
                            laneId,
                            direction: dir,
                            x,
                            y,
                            width: config.width,
                            height: config.height,
                            speed: 0,
                            targetSpeed: settings.vehicleSpeed,
                            state: "moving",
                            hasCrossedIntersection: false,
                        });
                    }
                }
            });
        });
    }, [settings]);

    const updateSimulation = useCallback(() => {
        if (isPaused) return;

        // 1. Spawn
        spawnVehicle();

        // 2. Move & Collide
        const nextVehicles: Vehicle[] = [];
        const lights = {
            N: currentPhase === "NS",
            S: currentPhase === "NS",
            E: currentPhase === "EW",
            W: currentPhase === "EW",
        };

        vehiclesRef.current.forEach((v) => {
            let nextX = v.x;
            let nextY = v.y;
            let targetSpeed = v.targetSpeed;
            let shouldStop = false;

            // --- Stop Line Logic ---
            const isApproachingIntersection =
                (v.direction === "N" && v.y < CENTER - STOP_LINE_OFFSET) ||
                (v.direction === "S" && v.y > CENTER + STOP_LINE_OFFSET) ||
                (v.direction === "E" && v.x < CENTER - STOP_LINE_OFFSET) ||
                (v.direction === "W" && v.x > CENTER + STOP_LINE_OFFSET);

            const willCrossStopLine =
                (v.direction === "N" && v.y + v.speed + v.width / 2 >= CENTER - STOP_LINE_OFFSET) ||
                (v.direction === "S" && v.y - v.speed - v.width / 2 <= CENTER + STOP_LINE_OFFSET) ||
                (v.direction === "E" && v.x + v.speed + v.width / 2 >= CENTER - STOP_LINE_OFFSET) ||
                (v.direction === "W" && v.x - v.speed - v.width / 2 <= CENTER + STOP_LINE_OFFSET);

            if (isApproachingIntersection && willCrossStopLine && !v.hasCrossedIntersection) {
                if (!lights[v.direction]) {
                    shouldStop = true;
                }
            }

            // --- Collision Logic (Solid Block) ---
            const sameLaneVehicles = vehiclesRef.current.filter(
                (other) => other.laneId === v.laneId && other.id !== v.id
            );

            sameLaneVehicles.forEach((other) => {
                let dist = 1000;
                if (v.direction === "N") dist = other.y - v.y - (v.width / 2 + other.width / 2);
                if (v.direction === "S") dist = v.y - other.y - (v.width / 2 + other.width / 2);
                if (v.direction === "E") dist = other.x - v.x - (v.width / 2 + other.width / 2);
                if (v.direction === "W") dist = v.x - other.x - (v.width / 2 + other.width / 2);

                if (dist > 0 && dist < settings.minGap + 10) {
                    if (dist < settings.minGap) {
                        shouldStop = true;
                    } else {
                        // Smooth slowdown
                        targetSpeed = Math.min(targetSpeed, (dist / (settings.minGap + 10)) * v.targetSpeed);
                    }
                }
            });

            // --- Intersection Intersection Logic (Strict Box) ---
            // check if inside box
            const inBox =
                v.x > INTERSECTION_MIN && v.x < INTERSECTION_MAX &&
                v.y > INTERSECTION_MIN && v.y < INTERSECTION_MAX;

            if (inBox && !v.hasCrossedIntersection) {
                // Just entered, continue until out
            }

            // Check for exit
            if (!v.hasCrossedIntersection) {
                if (v.direction === "N" && v.y > INTERSECTION_MAX) v.hasCrossedIntersection = true;
                if (v.direction === "S" && v.y < INTERSECTION_MIN) v.hasCrossedIntersection = true;
                if (v.direction === "E" && v.x > INTERSECTION_MAX) v.hasCrossedIntersection = true;
                if (v.direction === "W" && v.x < INTERSECTION_MIN) v.hasCrossedIntersection = true;

                if (v.hasCrossedIntersection) {
                    setCumulativePassed(p => p + 1);
                }
            }

            // Speed adjustment
            if (shouldStop) {
                v.speed = Math.max(0, v.speed - 0.2);
                v.state = "stopped";
            } else {
                if (v.speed < targetSpeed) v.speed = Math.min(targetSpeed, v.speed + 0.1);
                else if (v.speed > targetSpeed) v.speed = Math.max(targetSpeed, v.speed - 0.1);
                v.state = v.speed > 0.1 ? "moving" : "stopped";
            }

            // Position update
            if (v.direction === "N") v.y += v.speed;
            if (v.direction === "S") v.y -= v.speed;
            if (v.direction === "E") v.x += v.speed;
            if (v.direction === "W") v.x -= v.speed;

            // Keep if on screen
            if (v.x > -100 && v.x < CANVAS_SIZE + 100 && v.y > -100 && v.y < CANVAS_SIZE + 100) {
                nextVehicles.push(v);
            }
        });

        vehiclesRef.current = nextVehicles;
    }, [isPaused, currentPhase, spawnVehicle, settings]);

    // --- Rendering ---

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        // 1. Clear
        ctx.fillStyle = "#0a0a0c";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // 2. Draw Road
        ctx.fillStyle = "#1e1e22";
        // Horizontal
        ctx.fillRect(0, CENTER - ROAD_WIDTH / 2, CANVAS_SIZE, ROAD_WIDTH);
        // Vertical
        ctx.fillRect(CENTER - ROAD_WIDTH / 2, 0, ROAD_WIDTH, CANVAS_SIZE);

        // Lane Markers
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        // Horizontal center
        ctx.beginPath();
        ctx.moveTo(0, CENTER); ctx.lineTo(CANVAS_SIZE, CENTER); ctx.stroke();
        // Vertical center
        ctx.beginPath();
        ctx.moveTo(CENTER, 0); ctx.lineTo(CENTER, CANVAS_SIZE); ctx.stroke();

        // Lane divides
        ctx.setLineDash([5, 15]);
        // N
        ctx.beginPath(); ctx.moveTo(CENTER - LANE_WIDTH, 0); ctx.lineTo(CENTER - LANE_WIDTH, INTERSECTION_MIN); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CENTER + LANE_WIDTH, 0); ctx.lineTo(CENTER + LANE_WIDTH, INTERSECTION_MIN); ctx.stroke();
        // S
        ctx.beginPath(); ctx.moveTo(CENTER - LANE_WIDTH, INTERSECTION_MAX); ctx.lineTo(CENTER - LANE_WIDTH, CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CENTER + LANE_WIDTH, INTERSECTION_MAX); ctx.lineTo(CENTER + LANE_WIDTH, CANVAS_SIZE); ctx.stroke();
        // E
        ctx.beginPath(); ctx.moveTo(0, CENTER - LANE_WIDTH); ctx.lineTo(INTERSECTION_MIN, CENTER - LANE_WIDTH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, CENTER + LANE_WIDTH); ctx.lineTo(INTERSECTION_MIN, CENTER + LANE_WIDTH); ctx.stroke();
        // W
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MAX, CENTER - LANE_WIDTH); ctx.lineTo(CANVAS_SIZE, CENTER - LANE_WIDTH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MAX, CENTER + LANE_WIDTH); ctx.lineTo(CANVAS_SIZE, CENTER + LANE_WIDTH); ctx.stroke();

        ctx.setLineDash([]); // Reset

        // Stop Lines
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 4;
        // N (Top)
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN, INTERSECTION_MIN - 10); ctx.lineTo(INTERSECTION_MAX, INTERSECTION_MIN - 10); ctx.stroke();
        // S (Bottom)
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN, INTERSECTION_MAX + 10); ctx.lineTo(INTERSECTION_MAX, INTERSECTION_MAX + 10); ctx.stroke();
        // E (Left)
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MIN - 10, INTERSECTION_MIN); ctx.lineTo(INTERSECTION_MIN - 10, INTERSECTION_MAX); ctx.stroke();
        // W (Right)
        ctx.beginPath(); ctx.moveTo(INTERSECTION_MAX + 10, INTERSECTION_MIN); ctx.lineTo(INTERSECTION_MAX + 10, INTERSECTION_MAX); ctx.stroke();

        // Intersection Box
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fillRect(INTERSECTION_MIN, INTERSECTION_MIN, ROAD_WIDTH, ROAD_WIDTH);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.strokeRect(INTERSECTION_MIN, INTERSECTION_MIN, ROAD_WIDTH, ROAD_WIDTH);

        // 3. Draw Traffic Lights
        const drawLight = (dir: Direction, color: "green" | "red") => {
            let x = 0, y = 0;
            if (dir === "N") { x = INTERSECTION_MAX + 20; y = INTERSECTION_MIN - 20; }
            if (dir === "S") { x = INTERSECTION_MIN - 20; y = INTERSECTION_MAX + 20; }
            if (dir === "E") { x = INTERSECTION_MIN - 20; y = INTERSECTION_MIN - 20; }
            if (dir === "W") { x = INTERSECTION_MAX + 20; y = INTERSECTION_MAX + 20; }

            ctx.fillStyle = "#111";
            ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = color === "green" ? "#10b981" : "#ef4444";
            ctx.shadowBlur = color === "green" ? 15 : 0;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        };

        drawLight("N", currentPhase === "NS" ? "green" : "red");
        drawLight("S", currentPhase === "NS" ? "green" : "red");
        drawLight("E", currentPhase === "EW" ? "green" : "red");
        drawLight("W", currentPhase === "EW" ? "green" : "red");

        // 4. Draw Vehicles
        vehiclesRef.current.forEach((v) => {
            ctx.save();
            ctx.translate(v.x, v.y);

            let rotation = 0;
            if (v.direction === "N") rotation = Math.PI / 2;
            if (v.direction === "S") rotation = -Math.PI / 2;
            if (v.direction === "W") rotation = Math.PI;

            ctx.rotate(rotation);

            if (imagesRef.current) {
                const img = imagesRef.current[v.type];
                ctx.drawImage(img, -v.width / 2, -v.height / 2, v.width, v.height);
            } else {
                // Fallback
                ctx.fillStyle = v.type === "truck" ? "#3b82f6" : "#f59e0b";
                ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height);
            }

            // Brake lights
            if (v.state === "stopped") {
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(-v.width / 2, -v.height / 3, 2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(-v.width / 2, v.height / 3, 2, 0, Math.PI * 2); ctx.fill();
            }

            ctx.restore();
        });
    }, [currentPhase, vehiclesRef]);

    const loop = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            updateSimulation();
            draw(ctx);
        }
        requestRef.current = requestAnimationFrame(loop);
    }, [updateSimulation, draw]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [loop]);

    // --- Phase Control ---

    useEffect(() => {
        if (isPaused || isManual) return;

        const interval = setInterval(() => {
            setPhaseTimer((prev) => {
                if (prev <= 1) {
                    setCurrentPhase((p) => (p === "NS" ? "EW" : "NS"));
                    return settings.greenDuration;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused, isManual, settings.greenDuration]);

    const togglePhase = () => {
        if (!isManual) return;
        setCurrentPhase((p) => (p === "NS" ? "EW" : "NS"));
    };

    const handleReset = () => {
        vehiclesRef.current = [];
        setCumulativePassed(0);
        setPhaseTimer(settings.greenDuration);
    };

    return (
        <ProtectedRoute>
            <div className="fixed inset-0 bg-[#020617] text-white flex flex-col overflow-hidden leading-tight font-sans">
                <Navigation />

                <main className="flex-1 relative flex">
                    {/* Sidebar Controls */}
                    <aside className="w-80 border-r border-white/5 bg-slate-950 p-6 flex flex-col gap-6 z-40 shadow-2xl overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3 text-amber-500" /> Control_Center
                                </h2>
                                <Badge variant={isManual ? "destructive" : "outline"} className="px-3 py-0 h-5 font-mono text-[9px]">
                                    {isManual ? "MANUAL_OVERRIDE" : "AI_OPTIMIZED"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    onClick={() => setIsManual(!isManual)}
                                    variant="outline"
                                    className={`h-12 border-white/10 ${isManual ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-white/5'}`}
                                >
                                    {isManual ? <Zap className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                                    {isManual ? "Auto Mode" : "Manual"}
                                </Button>
                                <Button
                                    onClick={() => setIsPaused(!isPaused)}
                                    variant="outline"
                                    className="h-12 border-white/10 hover:bg-white/5"
                                >
                                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                                    {isPaused ? "Resume" : "Pause"}
                                </Button>
                            </div>

                            <Card className="bg-black/40 border-white/5 p-4 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active_Phase</span>
                                    <div className="flex items-center gap-2">
                                        <Timer className="w-3 h-3 text-sky-400" />
                                        <span className="text-xs font-mono text-sky-400">{!isManual && phaseTimer}s</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Button
                                        disabled={!isManual}
                                        onClick={togglePhase}
                                        className={`w-full h-12 gap-3 transition-all ${currentPhase === 'NS' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-transparent text-zinc-600 border-white/5'}`}
                                        variant="outline"
                                    >
                                        <ArrowUpDown className="w-4 h-4" />
                                        <div className="text-left">
                                            <div className="text-[9px] font-black uppercase">Phase A</div>
                                            <div className="text-[10px]">North & South</div>
                                        </div>
                                    </Button>

                                    <Button
                                        disabled={!isManual}
                                        onClick={togglePhase}
                                        className={`w-full h-12 gap-3 transition-all ${currentPhase === 'EW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-transparent text-zinc-600 border-white/5'}`}
                                        variant="outline"
                                    >
                                        <ArrowLeftRight className="w-4 h-4" />
                                        <div className="text-left">
                                            <div className="text-[9px] font-black uppercase">Phase B</div>
                                            <div className="text-[10px]">East & West</div>
                                        </div>
                                    </Button>
                                </div>
                            </Card>

                            <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl space-y-3">
                                <h3 className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Realtime_Telemetry</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[8px] text-zinc-500 uppercase">Vehicles_In_Grid</p>
                                        <p className="text-lg font-black text-white">{vehiclesRef.current.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-zinc-500 uppercase">Total_Flow</p>
                                        <p className="text-lg font-black text-white">{cumulativePassed}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-3">
                            <Button onClick={handleReset} variant="outline" className="w-full h-10 border-white/10 text-zinc-400 hover:text-white uppercase text-[10px] font-black tracking-widest">
                                <RefreshCcw className="w-3 h-3 mr-2" /> Reset Simulation
                            </Button>
                            <div className="flex items-center gap-2 justify-center py-2 opacity-50">
                                <Badge className="bg-white/10 text-[8px] font-mono">BKK_G_ENG_v4.2</Badge>
                                <Badge className="bg-white/10 text-[8px] font-mono">CANVAS_2D</Badge>
                            </div>
                        </div>
                    </aside>

                    {/* Simulation Viewport */}
                    <section className="flex-1 relative bg-[#0a0a0c] overflow-hidden flex items-center justify-center p-8">
                        <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 rounded-2xl overflow-hidden aspect-square h-full max-h-[90vh]">
                            <canvas
                                ref={canvasRef}
                                width={CANVAS_SIZE}
                                height={CANVAS_SIZE}
                                className="w-full h-full cursor-crosshair"
                            />

                            {/* HUD Overlays */}
                            <div className="absolute top-6 left-6 pointer-events-none">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest px-2 py-0.5 animate-pulse">
                                        Live_Engine
                                    </Badge>
                                    <span className="text-[12px] font-mono text-white/20 tracking-tighter">8_LANE_PHASE_SYNC</span>
                                </div>
                                <h2 className="text-4xl font-black text-white/5 italic select-none leading-none">
                                    SMART_TRAFFIC_ASSISTANCE
                                </h2>
                            </div>

                            <div className="absolute bottom-6 right-6 pointer-events-none text-right">
                                <p className="text-[10px] font-mono text-sky-400/50 uppercase mb-1 tracking-widest">Global_Status</p>
                                <p className="text-sm font-black text-white tracking-widest underline decoration-sky-500/50 underline-offset-4">
                                    {currentPhase === 'NS' ? 'NORTH_SOUTH_OPEN' : 'EAST_WEST_OPEN'}
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </ProtectedRoute>
    );
}
