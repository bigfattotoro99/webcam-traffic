"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, Circle } from "lucide-react";

export type ZoneId = "krungthon" | "sukhumvit" | "sathon" | "rama4";

interface Zone {
    id: ZoneId;
    name: string;
    description: string;
    density: number;
    active: boolean;
}

interface ZoneSelectorProps {
    activeZone: ZoneId;
    onZoneChange: (zone: ZoneId) => void;
}

const zones: Zone[] = [
    { id: "krungthon", name: "กรุงธนบุรี", description: "ฝั่งธนบุรี - สะพานตากสิน", density: 88, active: true },
    { id: "sukhumvit", name: "อโศก - สุขุมวิท", description: "ธุรกิจกลางเมือง - จราจรหนาแน่น", density: 98, active: true },
    { id: "sathon", name: "สาทร - สีลม", density: 82, description: "ย่านการเงิน - เร่งด่วนเช้า/เย็น", active: true },
    { id: "rama4", name: "พระราม 4", density: 65, description: "การเชื่อมต่อคลองเตย - สามย่าน", active: true },
];

export function ZoneSelector({ activeZone, onZoneChange }: ZoneSelectorProps) {
    return (
        <Card className="glass border-white/10 p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">เลือกพื้นที่จำลอง</h3>
                <Badge variant="outline" className="text-[8px] h-4 border-emerald-500/30 text-emerald-400">4 โซนหลัก</Badge>
            </div>
            
            <div className="space-y-2">
                {zones.map((zone) => (
                    <div 
                        key={zone.id}
                        onClick={() => onZoneChange(zone.id)}
                        className={`group cursor-pointer relative overflow-hidden p-3 rounded-xl border transition-all duration-300 ${
                            activeZone === zone.id 
                            ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex gap-3">
                                <div className={`mt-0.5 p-1 rounded-md ${activeZone === zone.id ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-500"}`}>
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold transition-colors ${activeZone === zone.id ? "text-white" : "text-zinc-400"}`}>
                                        {zone.name}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-medium">{zone.description}</span>
                                </div>
                            </div>
                            {activeZone === zone.id ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Circle className="h-4 w-4 text-zinc-800" />
                            )}
                        </div>
                        
                        {/* Traffic Density Bar on hover/active */}
                        {(activeZone === zone.id) && (
                            <div className="mt-3 space-y-1 relative z-10">
                                <div className="flex justify-between text-[9px]">
                                    <span className="text-zinc-500 uppercase font-black">ความหนาแน่นปัจจุบัน</span>
                                    <span className={zone.density > 80 ? "text-red-400" : "text-emerald-400"}>{zone.density}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${zone.density > 80 ? "bg-red-500" : "bg-emerald-500"} transition-all duration-700`}
                                        style={{ width: `${zone.density}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        
                        {/* Interactive scanline effect on active item */}
                        {activeZone === zone.id && (
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-scan"></div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="pt-2 border-t border-white/5">
                <p className="text-[9px] text-zinc-500 text-center italic">เลือกพื้นที่เพื่อสลับการจำลองข้อมูลแบบเรียลไทม์</p>
            </div>
        </Card>
    );
}
