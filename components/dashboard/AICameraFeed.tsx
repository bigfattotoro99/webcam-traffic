"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, User, Car as CarIcon, Video, ShieldCheck } from "lucide-react";
import { ZoneId } from "../map/ZoneSelector";

interface DetectedObject {
    id: number;
    type: "car" | "person" | "taxi" | "bus";
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    color?: string;
    speed?: number;
}

export function AICameraFeed({ zone = "krungthon" }: { zone?: ZoneId }) {
    const [objects, setObjects] = useState<DetectedObject[]>([]);
    const [counts, setCounts] = useState({ vehicles: 0, people: 0 });
    const [logs, setLogs] = useState<string[]>(["INIT 0x0... SYSTEM_READY"]);

    useEffect(() => {
        let lastId = 0;
        const generateObject = () => {
            const rand = Math.random();
            let type: "car" | "person" | "taxi" | "bus" = "car";
            let color = undefined;

            if (rand > 0.8) type = "person";
            else if (rand > 0.6) {
                type = "taxi";
                color = Math.random() > 0.5 ? "#ffeb3b" : "#4caf50"; // Thai Taxi colors
            } else if (rand > 0.55) {
                type = "bus";
                color = "#ff9800";
            }

            const confidence = Math.round(Math.random() * 8 + 91);
            const direction = Math.random() > 0.5 ? 1 : -1;
            const speed = (Math.random() * 0.3 + 0.15) * direction;

            return {
                id: ++lastId,
                type,
                color,
                x: direction > 0 ? -20 : 110,
                y: type === 'person' ? Math.random() * 20 + 65 : Math.random() * 30 + 30, // People on sidewalks
                width: type === "bus" ? 18 : (type === "car" || type === "taxi" ? 12 : 3),
                height: type === "bus" ? 8 : (type === "car" || type === "taxi" ? 7 : 7),
                confidence,
                speed,
            };
        };

        let activeObjects: DetectedObject[] = [];

        const interval = setInterval(() => {
            activeObjects = activeObjects
                .map(obj => ({ ...obj, x: obj.x + (obj.speed || 0) }))
                .filter(obj => obj.x > -30 && obj.x < 130);

            if (activeObjects.length < 6 && Math.random() > 0.94) {
                const newObj = generateObject();
                activeObjects.push(newObj);

                setLogs(prev => [
                    `[${new Date().toLocaleTimeString()}] DETECT: ${newObj.type.toUpperCase()} | SPD: ${(Math.abs(newObj.speed || 0) * 100).toFixed(1)}kph | DIR: ${newObj.speed && newObj.speed > 0 ? 'EAST' : 'WEST'}`,
                    ...prev
                ].slice(0, 8));

                setCounts(prev => ({
                    vehicles: prev.vehicles + (newObj.type !== 'person' ? 1 : 0),
                    people: prev.people + (newObj.type === 'person' ? 1 : 0),
                }));
            }

            setObjects([...activeObjects]);
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="glass-card shadow-3xl border-white/5 overflow-hidden group h-full flex flex-col">
            <CardHeader className="pb-3 bg-white/5 border-b border-white/5 shrink-0">
                <CardTitle className="flex justify-between items-center text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    <span className="flex items-center gap-2">
                        <Video className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                        AI วิเคราะห์กระแสจราจร
                    </span>
                    <Badge variant="outline" className="font-mono text-[8px] border-emerald-500/30 text-emerald-400 py-0 h-5">
                        8K • 60 FPS • ANALYZING
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative flex-1 flex flex-col">
                <div className="relative aspect-video bg-[#050505] overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542361345-89e58247f2d1?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-150 opacity-20"></div>

                    {/* HUD Overlay */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
                        <div className="bg-emerald-500/10 backdrop-blur-md text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2 shadow-lg">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            NODE: {zone.toUpperCase()}_01
                        </div>
                    </div>

                    {/* Detected Objects */}
                    {objects.map((obj) => (
                        <div
                            key={obj.id}
                            className="absolute z-10 pointer-events-none transition-all duration-75"
                            style={{
                                left: `${obj.x}%`,
                                top: `${obj.y}%`,
                                width: `${obj.width}%`,
                                height: `${obj.height}%`,
                                transform: `rotate(${obj.speed && obj.speed < 0 ? 180 : 0}deg)`,
                            }}
                        >
                            {/* Visual Representation */}
                            <div className="relative w-full h-full">
                                {obj.type === 'person' ? (
                                    <div className="w-full h-full flex items-center justify-center animate-bounce duration-700">
                                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
                                        <div className="absolute -bottom-1 w-2 h-0.5 bg-sky-400/20 blur-sm" />
                                    </div>
                                ) : (
                                    <div
                                        className="w-full h-full rounded-[4px] relative border border-white/20 shadow-xl"
                                        style={{ backgroundColor: obj.color || '#333' }}
                                    >
                                        {/* Windshield */}
                                        <div className="absolute top-1 left-1 right-1 h-[20%] bg-white/20 rounded-sm" />
                                        {/* Headlights */}
                                        <div className="absolute top-0 -right-0.5 w-1 h-1 bg-yellow-200/40 rounded-full" />
                                        <div className="absolute bottom-0 -right-0.5 w-1 h-1 bg-yellow-200/40 rounded-full" />
                                    </div>
                                )}

                                {/* Detection Label */}
                                <div
                                    className="absolute -top-5 left-0 px-1 py-0.5 rounded-sm text-[6px] font-black uppercase text-black"
                                    style={{
                                        backgroundColor: obj.type === 'person' ? '#38bdf8' : (obj.color || '#10b981'),
                                        transform: `rotate(${obj.speed && obj.speed < 0 ? -180 : 0}deg)`
                                    }}
                                >
                                    {obj.type} {obj.confidence}%
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,4px_100%] opacity-10"></div>
                </div>

                {/* Real-time Logs */}
                <div className="flex-1 bg-black/80 font-mono text-[8px] p-2 text-emerald-500/50 overflow-hidden relative border-t border-white/5 min-h-[80px]">
                    <div className="flex flex-col-reverse gap-0.5">
                        {logs.map((log, i) => (
                            <p key={i} className={i === 0 ? "text-emerald-400 font-bold" : ""}>{log}</p>
                        ))}
                    </div>
                </div>

                {/* Counter Bar */}
                <div className="flex bg-black/40 border-t border-white/5 p-4 justify-between items-center shrink-0">
                    <div className="flex gap-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <CarIcon className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Vehicles</span>
                                <span className="text-xl font-black text-white font-mono leading-none">{(842 + counts.vehicles).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
                                <User className="w-4 h-4 text-sky-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Pedestrians</span>
                                <span className="text-xl font-black text-white font-mono leading-none">{(312 + counts.people).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
