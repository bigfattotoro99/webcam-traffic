"use client";

import { Card } from "@/components/ui/card";
import { Camera, Maximize2 } from "lucide-react";

interface CCTVPreviewProps {
    name: string;
    status: "online" | "offline";
    className?: string;
}

export function CCTVPreview({ name, status, className }: CCTVPreviewProps) {
    return (
        <Card className={`glass overflow-hidden w-48 shadow-2xl border-white/20 ${className}`}>
            <div className="bg-black relative aspect-video group">
                {/* Simulated Video Static/Noise or Mock Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542361345-89e58247f2d1?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-60"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>

                {/* Scanline effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_2px,3px_100%] opacity-50"></div>

                {/* Overlay Text */}
                <div className="absolute top-1 left-1 flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[8px] font-mono text-white/80">CAM: {name}</span>
                </div>
                <div className="absolute bottom-1 right-1">
                    <Maximize2 className="h-3 w-3 text-white/40 hover:text-white cursor-pointer" />
                </div>
            </div>
            <div className="px-2 py-1 bg-black/40 flex items-center justify-between">
                <span className="text-[10px] font-medium text-white/90">LIVE FEED</span>
                <span className="text-[8px] font-mono text-zinc-500 tracking-tighter">1920x1080 @ 60FPS</span>
            </div>
        </Card>
    );
}
