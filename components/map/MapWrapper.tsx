"use client";

import { GoogleMap, useJsApiLoader, Polyline, Polygon } from "@react-google-maps/api";
import React, { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { RoadDetailsDialog } from "./RoadDetailsDialog";
import { useTrafficData } from "@/hooks/useTrafficData";
import { WeatherWidget } from "./WeatherWidget";

// Default center (Krung Thon Buri Road)
const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "500px",
    borderRadius: "0.75rem",
};

const defaultCenter = {
    lat: 13.7208,
    lng: 100.5018,
};

// Define coverage area (Krung Thon Buri Area)
const coverageArea = [
    { lat: 13.7150, lng: 100.4900 }, // SW
    { lat: 13.7250, lng: 100.4900 }, // NW
    { lat: 13.7250, lng: 100.5200 }, // NE
    { lat: 13.7150, lng: 100.5200 }, // SE
];

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["geometry", "visualization"];

import { FallbackMap } from "./FallbackMap";
import { ZoneId } from "./ZoneSelector";

const zoneConfigs: Record<ZoneId, { center: { lat: number, lng: number }, coverage: any[] }> = {
    krungthon: {
        center: { lat: 13.7208, lng: 100.5018 },
        coverage: [
            { lat: 13.7150, lng: 100.4900 }, { lat: 13.7250, lng: 100.4900 },
            { lat: 13.7250, lng: 100.5200 }, { lat: 13.7150, lng: 100.5200 },
        ]
    },
    sukhumvit: {
        center: { lat: 13.7367, lng: 100.5612 },
        coverage: [
            { lat: 13.7300, lng: 100.5500 }, { lat: 13.7450, lng: 100.5500 },
            { lat: 13.7450, lng: 100.5750 }, { lat: 13.7300, lng: 100.5750 },
        ]
    },
    sathon: {
        center: { lat: 13.7199, lng: 100.5292 },
        coverage: [
            { lat: 13.7150, lng: 100.5200 }, { lat: 13.7250, lng: 100.5200 },
            { lat: 13.7250, lng: 100.5400 }, { lat: 13.7150, lng: 100.5400 },
        ]
    },
    rama4: {
        center: { lat: 13.7233, lng: 100.5422 },
        coverage: [
            { lat: 13.7180, lng: 100.5350 }, { lat: 13.7280, lng: 100.5350 },
            { lat: 13.7280, lng: 100.5550 }, { lat: 13.7180, lng: 100.5550 },
        ]
    }
};

export function MapWrapper({ currentZone = "krungthon" }: { currentZone?: ZoneId }) {
    const config = zoneConfigs[currentZone];
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    // Check for missing or placeholder key
    const isKeyInvalid = !apiKey || apiKey === "YOUR_API_KEY_HERE";

    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedRoad, setSelectedRoad] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    const handleRoadClick = (road: any) => {
        setSelectedRoad(road);
        setIsDialogOpen(true);
    };

    if (isKeyInvalid) {
        return <FallbackMap zone={currentZone} />;
    }

    if (loadError) {
        return (
            <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted rounded-xl border">
                <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดแผนที่ (Error loading Google Maps)</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted rounded-xl border">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={config.center}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }],
                        }
                    ],
                    disableDefaultUI: false,
                    zoomControl: true,
                }}
            >
                {/* Coverage Area Boundary */}
                <Polygon
                    paths={config.coverage}
                    options={{
                        fillColor: "#3b82f6", // Blue
                        fillOpacity: 0.1,
                        strokeColor: "#3b82f6",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                    }}
                />

                <SimulatedTrafficLayer onRoadClick={handleRoadClick} />
            </GoogleMap>
            <RoadDetailsDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                roadData={selectedRoad}
            />
            <WeatherWidget />
        </>
    );
}

// Internal component for Traffic Overlay
function SimulatedTrafficLayer({ onRoadClick }: { onRoadClick: (road: any) => void }) {
    const { trafficData } = useTrafficData();

    // Initial static data (Krung Thon Buri Simulation)
    const initialRoads = [
        { id: "1", name: "ถ.กรุงธนบุรี (ขาเข้า)", density: 65, status: "รถหนาแน่น", lightStatus: "เขียว", path: [{ lat: 13.7210, lng: 100.4950 }, { lat: 13.7205, lng: 100.5100 }] },
        { id: "2", name: "ถ.กรุงธนบุรี (ขาออก)", density: 25, status: "คล่องตัว", lightStatus: "แดง", path: [{ lat: 13.7195, lng: 100.5100 }, { lat: 13.7200, lng: 100.4950 }] },
        { id: "3", name: "แยกเจริญนคร", density: 80, status: "รถติดขัด", lightStatus: "แดง", path: [{ lat: 13.7205, lng: 100.5100 }, { lat: 13.7150, lng: 100.5100 }] },
    ];

    // Merge static data with live updates
    const roads = initialRoads.map(road => {
        const update = trafficData?.roads?.find((r: any) => r.id === road.id);
        if (update) {
            // Determine color based on new density
            let color = "#22c55e"; // Green
            let status = "Clear";
            if (update.density > 70) {
                color = "#ef4444"; // Red
                status = "Congested";
            } else if (update.density > 40) {
                color = "#eab308"; // Yellow
                status = "Moderate";
            }
            return { ...road, ...update, color, status };
        }
        // Default colors if no update
        let color = "#22c55e";
        if (road.density > 70) color = "#ef4444";
        else if (road.density > 40) color = "#eab308";
        return { ...road, color };
    });

    return (
        <>
            {roads.map((road, idx) => (
                <Polyline
                    key={idx}
                    path={road.path}
                    options={{
                        strokeColor: road.color,
                        strokeOpacity: 0.9,
                        strokeWeight: 10, // Thicker lines
                        clickable: true
                    }}
                    onClick={() => onRoadClick(road)}
                />
            ))}
        </>
    )
}
