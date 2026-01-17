"use client";

import { CloudRain, CloudSun, Wind, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function WeatherWidget() {
    return (
        <Card className="glass-card absolute bottom-6 right-6 w-72 z-10 pointer-events-none">
            {/* pointer-events-none on Card but auto on Content if interaction needed, 
                but for a pure display widget on map, passing clicks through might be desired 
                unless we want it clickable. Let's keep it simple. */}
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Bangkok, TH</p>
                        <h3 className="text-2xl font-bold">28°C</h3>
                    </div>
                    <CloudRain className="h-10 w-10 text-blue-400" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                        <Wind className="h-3 w-3 text-muted-foreground" />
                        <span>12 km/h</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <Droplets className="h-3 w-3 text-muted-foreground" />
                        <span>82% Hum</span>
                    </div>
                </div>
                <div className="mt-1 pt-2 border-t border-border/50">
                    <p className="text-xs text-amber-500 font-medium">Warning: Light Rain affecting visibility.</p>
                </div>
            </CardContent>
        </Card>
    );
}
