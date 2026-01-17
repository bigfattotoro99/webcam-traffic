"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { time: "00:00", density: 30, prediction: 25 },
    { time: "04:00", density: 20, prediction: 20 },
    { time: "08:00", density: 85, prediction: 90 },
    { time: "12:00", density: 65, prediction: 70 },
    { time: "16:00", density: 90, prediction: 85 },
    { time: "20:00", density: 50, prediction: 55 },
    { time: "23:59", density: 35, prediction: 30 },
];

export function PredictionChart() {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="text-secondary-foreground">AI Traffic Prediction (24h)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="time"
                                tick={{ fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="density"
                                stroke="var(--chart-1)"
                                fillOpacity={1}
                                fill="url(#colorDensity)"
                                name="Actual Density"
                            />
                            <Area
                                type="monotone"
                                dataKey="prediction"
                                stroke="var(--chart-2)"
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorPrediction)"
                                name="AI Prediction"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
