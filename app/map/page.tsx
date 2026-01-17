"use client";

import { MapWrapper } from "@/components/map/MapWrapper";

export default function MapPage() {
    return (
        <div className="h-[calc(100vh-4rem)] p-4 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Live Traffic Map</h2>
                <div className="flex gap-2">
                    {/* Filters/Legend could go here */}
                </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border">
                <MapWrapper />
            </div>
        </div>
    );
}
