"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, ZapOff } from "lucide-react";

const junctions = [
    { id: 1, name: "แยกกรุงธนบุรี", status: "green", timer: 45, mode: "AI" },
    { id: 2, name: "แยกเจริญนคร", status: "red", timer: 12, mode: "AI" },
    { id: 3, name: "แยกตากสิน", status: "red", timer: 58, mode: "Fixed" },
    { id: 4, name: "ทางด่วนขั้นที่ 1", status: "green", timer: 120, mode: "AI" },
];

export function TrafficLightMonitor() {
    return (
        <Card className="glass border-white/10 p-4 space-y-4 shadow-2xl">
            <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-4">สถานะสัญญาณไฟจราจร</h3>
            <div className="space-y-3">
                {junctions.map((j) => (
                    <div key={j.id} className="group relative flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
                        {/* Status bar (Left) */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${j.status === 'green' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                        
                        <div className="flex flex-col gap-1 ml-2">
                            <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{j.name}</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[8px] h-4 bg-black/40 border-white/10 ${j.mode === 'AI' ? 'text-sky-400' : 'text-zinc-500'}`}>
                                    {j.mode === 'AI' ? <Timer className="w-2 h-2 mr-1 animate-spin-slow" /> : <ZapOff className="w-2 h-2 mr-1" />}
                                    {j.mode} OPTIMIZED
                                </Badge>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            <span className={`text-xl font-mono font-bold ${j.status === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {j.timer}s
                            </span>
                            <span className="text-[9px] font-medium text-zinc-500">NEXT: {j.status === 'green' ? 'RED' : 'GREEN'}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pt-2">
                <p className="text-[9px] text-zinc-500 text-center italic">ระบบอัปเดตอัตโนมัติทุก 1 วินาที</p>
            </div>
        </Card>
    );
}
