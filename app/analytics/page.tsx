"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const trafficData = [
    { time: "06:00", density: 40, congestion: 20 },
    { time: "08:00", density: 85, congestion: 70 },
    { time: "10:00", density: 60, congestion: 30 },
    { time: "12:00", density: 55, congestion: 25 },
    { time: "14:00", density: 50, congestion: 20 },
    { time: "16:00", density: 65, congestion: 40 },
    { time: "18:00", density: 95, congestion: 90 },
    { time: "20:00", density: 70, congestion: 50 },
    { time: "22:00", density: 30, congestion: 10 },
];

const roadStatusData = [
    { name: "Clear", count: 120, fill: "#22c55e" },
    { name: "Moderate", count: 80, fill: "#eab308" },
    { name: "Congested", count: 45, fill: "#ef4444" },
];

export default function AnalyticsPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Traffic Analytics</h2>
                <p className="text-muted-foreground">Historical data and predictive analysis.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Traffic Density Trend (24h)</CardTitle>
                        <CardDescription>Average vehicle density across major junctions</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="density" stroke="#8884d8" fillOpacity={1} fill="url(#colorDensity)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Road Status Distribution</CardTitle>
                        <CardDescription>Current status overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={roadStatusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
