"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, User, Car as CarIcon, Video, ShieldCheck } from "lucide-react";

interface DetectedObject {
    id: number;
    type: "car" | "person" | "taxi" | "bus";
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    color?: string;
}

export function AICameraFeed() {
    const [objects, setObjects] = useState<DetectedObject[]>([]);
    const [counts, setCounts] = useState({ cars: 0, people: 0 });

    useEffect(() => {
        // Simulation loop
        const interval = setInterval(() => {
            const newObjects: DetectedObject[] = [];
            const objCount = Math.floor(Math.random() * 6) + 3;

            for (let i = 0; i < objCount; i++) {
                const rand = Math.random();
                let type: "car" | "person" | "taxi" | "bus" = "car";
                let color = undefined;

                if (rand > 0.8) type = "person";
                else if (rand > 0.6) {
                    type = "taxi";
                    color = Math.random() > 0.5 ? "#ff69b4" : "#22c55e"; // Pink or Green Taxi
                } else if (rand > 0.55) {
                    type = "bus";
                }

                newObjects.push({
                    id: Math.random(),
                    type,
                    color,
                    x: Math.random() * 85,
                    y: Math.random() * 55 + 25,
                    width: type === "bus" ? 22 : (type === "car" || type === "taxi" ? 14 : 4),
                    height: type === "bus" ? 8 : (type === "car" || type === "taxi" ? 8 : 10),
                    confidence: Math.round(Math.random() * 10 + 88),
                });
            }

            setObjects(newObjects);
            setCounts(prev => ({
                cars: prev.cars + (Math.random() > 0.6 ? 1 : 0),
                people: prev.people + (Math.random() > 0.8 ? 1 : 0),
            }));

        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="glass-card shadow-3xl border-white/5 overflow-hidden group">
            <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                <CardTitle className="flex justify-between items-center text-sm font-bold tracking-widest text-zinc-400 uppercase">
                    <span className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-emerald-500 animate-pulse" />
                        AI วิเคราะห์กระแสจราจร
                    </span>
                    <Badge variant="outline" className="font-mono text-[9px] border-emerald-500/30 text-emerald-400">
                        8K • 60 FPS • LIVE
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative">
                <div className="relative aspect-video bg-[#050505] overflow-hidden">
                    {/* Realistic Background - Road Surface */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542361345-89e58247f2d1?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-150 opacity-30"></div>

                    {/* Motion Blur Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

                    {/* HUD: ZONE Box matching user screenshot */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-black/90 text-white text-base font-bold px-6 py-2 rounded-xl border border-white/20 shadow-2xl backdrop-blur-xl tracking-wide uppercase">
                            ZONE: Krung Thon Buri 01
                        </div>
                    </div>

                    {/* Detected Objects Overlays */}
                    {objects.map((obj) => (
                        <div
                            key={obj.id}
                            className={`absolute transition-all duration-1000 ease-in-out flex flex-col items-center justify-center`}
                            style={{
                                left: `${obj.x}%`,
                                top: `${obj.y}%`,
                                width: `${obj.width}%`,
                                height: `${obj.height}%`,
                            }}
                        >
                            {/* Realistic Car Body / Placeholder */}
                            <div
                                className={`w-full h-full rounded-sm border-[1.5px] shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-colors duration-500`}
                                style={{
                                    borderColor: obj.type === 'person' ? '#38bdf8' : (obj.color || '#10b981'),
                                    backgroundColor: obj.type === 'person' ? 'rgba(56,189,248,0.1)' : (obj.color ? `${obj.color}15` : 'rgba(16,185,129,0.1)'),
                                }}
                            >
                                {/* Detection Badge - Matching screenshot */}
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <Badge
                                        className="rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-lg border-0 flex items-center gap-1.5"
                                        style={{ backgroundColor: obj.type === 'person' ? '#38bdf8' : (obj.color || '#10b981'), color: '#000' }}
                                    >
                                        {obj.type === 'person' ? <User className="h-3 w-3" /> : (obj.type === 'bus' ? <ShieldCheck className="h-3 w-3" /> : <CarIcon className="h-3 w-3" />)}
                                        {obj.confidence}%
                                    </Badge>
                                </div>

                                {/* Corner markers */}
                                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2" style={{ borderColor: obj.type === 'person' ? '#38bdf8' : (obj.color || '#10b981') }}></div>
                                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2" style={{ borderColor: obj.type === 'person' ? '#38bdf8' : (obj.color || '#10b981') }}></div>
                                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2" style={{ borderColor: obj.type === 'person' ? '#38bdf8' : (obj.color || '#10b981') }}></div>
                                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2" style={{ borderColor: obj.type === 'person' ? '#38bdf8' : (obj.color || '#10b981') }}></div>
                            </div>
                        </div>
                    ))}

                    {/* Scanline & HUD Distort */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,4px_100%] opacity-10"></div>
                </div>

                {/* Info Bar */}
                <div className="flex bg-black/40 border-t border-white/5 p-4 justify-between items-center backdrop-blur-md">
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-none mb-1">สะสมยานพาหนะ</span>
                            <span className="text-xl font-black text-white font-mono leading-none">{(1240 + counts.cars).toLocaleString()}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10 self-center"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-none mb-1">สะสมคนเดินเท้า</span>
                            <span className="text-xl font-black text-white font-mono leading-none">{(340 + counts.people).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] text-emerald-500/80 font-bold block mb-1">AI CLOUD PROCESSING</span>
                        <div className="flex gap-0.5 justify-end">
                            {[1, 1, 1, 1, 0.5].map((op, i) => (
                                <div key={i} className="w-1.5 h-3 bg-emerald-500" style={{ opacity: op }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
