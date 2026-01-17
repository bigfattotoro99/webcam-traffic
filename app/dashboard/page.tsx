"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Activity,
    Bell,
    Car,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrafficCone,
} from "lucide-react";
import { useNotificationStore } from "@/lib/store/notifications";

export default function DashboardPage() {
    const { notifications } = useNotificationStore();
    const recentNotifications = notifications.slice(0, 5);

    const stats = [
        {
            title: "System Status",
            value: "Active",
            icon: CheckCircle,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20",
        },
        {
            title: "Total Alerts",
            value: notifications.length.toString(),
            icon: Bell,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/20",
        },
        {
            title: "Active Simulation",
            value: "4-Way",
            icon: TrafficCone,
            color: "text-sky-500",
            bgColor: "bg-sky-500/10",
            borderColor: "border-sky-500/20",
        },
        {
            title: "Efficiency",
            value: "92%",
            icon: TrendingUp,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20",
        },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950">
                <Navigation />

                <main className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Dashboard</h1>
                        <p className="text-sm text-zinc-400">
                            ภาพรวมระบบจัดการจราจรอัจฉริยะ
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card
                                    key={stat.title}
                                    className={`p-6 bg-slate-900/50 border ${stat.borderColor} hover:border-white/10 transition-colors`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
                                            <Icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                            {stat.title}
                                        </p>
                                        <p className={`text-2xl font-black ${stat.color}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <Card className="p-6 bg-slate-900/50 border-white/5">
                        <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-sky-400" />
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/simulation">
                                <Button className="w-full h-16 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 hover:text-sky-300 font-bold uppercase justify-start gap-3">
                                    <Activity className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-xs">เปิดโหมด</div>
                                        <div>Simulation</div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href="/notifications">
                                <Button className="w-full h-16 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300 font-bold uppercase justify-start gap-3">
                                    <Bell className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-xs">ตรวจสอบ</div>
                                        <div>Notifications</div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href="/settings">
                                <Button className="w-full h-16 bg-zinc-500/10 hover:bg-zinc-500/20 border border-zinc-500/20 text-zinc-400 hover:text-zinc-300 font-bold uppercase justify-start gap-3">
                                    <Clock className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="text-xs">ปรับแต่ง</div>
                                        <div>Settings</div>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Recent Alerts */}
                    <Card className="p-6 bg-slate-900/50 border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-400" />
                                Recent Alerts
                            </h2>
                            <Link href="/notifications">
                                <Button variant="ghost" size="sm" className="text-xs text-sky-400 hover:text-sky-300">
                                    View All →
                                </Button>
                            </Link>
                        </div>

                        {recentNotifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                                <p className="text-sm text-zinc-500">No alerts yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${notif.type === 'congestion' ? 'bg-amber-500/10 text-amber-400' :
                                            notif.type === 'accident' ? 'bg-red-500/10 text-red-400' :
                                                notif.type === 'emergency' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-sky-500/10 text-sky-400'
                                            }`}>
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">{notif.title}</p>
                                            <p className="text-xs text-zinc-500">{notif.message}</p>
                                        </div>
                                        <span className="text-xs text-zinc-600 font-mono">
                                            {new Date(notif.timestamp).toLocaleTimeString('th-TH', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </main>
            </div>
        </ProtectedRoute>
    );
}
