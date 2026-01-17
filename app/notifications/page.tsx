"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore, type NotificationType } from "@/lib/store/notifications";
import {
    AlertTriangle,
    Car,
    Ambulance,
    Cloud,
    Trash2,
    Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const alertTypes = [
    {
        type: 'congestion' as NotificationType,
        title: 'การจราจรติดขัด (Congestion)',
        icon: Car,
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
        message: 'Traffic congestion detected on main route',
        description: 'แจ้งเตือนเมื่อมีการจราจรติดขัดสะสมสูง',
    },
    {
        type: 'accident' as NotificationType,
        title: 'อุบัติเหตุ (Accident)',
        icon: AlertTriangle,
        color: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
        message: 'Accident reported - emergency response required',
        description: 'แจ้งเหตุอุบัติเหตุบนท้องถนน',
    },
    {
        type: 'emergency' as NotificationType,
        title: 'รถฉุกเฉิน (Emergency Vehicle)',
        icon: Ambulance,
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
        message: 'Emergency vehicle approaching - priority clearance',
        description: 'รถฉุกเฉินกำลังผ่าน (รถพยาบาล, ดับเพลิง)',
    },
    {
        type: 'weather' as NotificationType,
        title: 'สภาพอากาศ (Weather Impact)',
        icon: Cloud,
        color: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20',
        message: 'Adverse weather conditions affecting traffic flow',
        description: 'สภาพอากาศกระทบการจราจร (ฝน, หมอก)',
    },
];

export default function NotificationsPage() {
    const { notifications, addNotification, clearNotifications } = useNotificationStore();
    const { toast } = useToast();

    const handleAlert = (type: NotificationType, title: string, message: string) => {
        addNotification(type, title, message);

        toast({
            title: `🚨 ${title}`,
            description: message,
            variant: type === 'accident' ? 'destructive' : 'default',
        });
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950">
                <Navigation />

                <main className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">Notifications</h1>
                            <p className="text-sm text-zinc-400">
                                ระบบแจ้งเตือนและจัดการเหตุการณ์จราจร
                            </p>
                        </div>

                        {notifications.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearNotifications}
                                className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    {/* Alert Trigger Buttons */}
                    <Card className="p-6 bg-slate-900/50 border-white/5">
                        <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-sky-400" />
                            Trigger Alert
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {alertTypes.map((alert) => {
                                const Icon = alert.icon;
                                return (
                                    <Button
                                        key={alert.type}
                                        onClick={() => handleAlert(alert.type, alert.title, alert.message)}
                                        className={`h-auto flex-col items-start gap-3 p-4 border ${alert.color}`}
                                        variant="outline"
                                    >
                                        <Icon className="w-6 h-6" />
                                        <div className="text-left">
                                            <div className="font-black text-sm mb-1">{alert.title}</div>
                                            <div className="text-xs opacity-70 font-normal">
                                                {alert.description}
                                            </div>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Event History */}
                    <Card className="p-6 bg-slate-900/50 border-white/5">
                        <h2 className="text-lg font-black text-white mb-4">Event Log</h2>

                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-500 mb-2">No events logged yet</p>
                                <p className="text-sm text-zinc-600">
                                    Click an alert button above to create an event
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {notifications.map((notif, idx) => {
                                    const alertConfig = alertTypes.find(a => a.type === notif.type);
                                    const Icon = alertConfig?.icon || AlertTriangle;

                                    return (
                                        <div
                                            key={notif.id}
                                            className="flex items-start gap-4 p-4 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                                        >
                                            <div className={`p-3 rounded-lg border ${notif.type === 'congestion' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    notif.type === 'accident' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        notif.type === 'emergency' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                                }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className="font-bold text-white">{notif.title}</h3>
                                                    <Badge variant="outline" className="text-xs font-mono text-zinc-500 border-zinc-700">
                                                        #{notifications.length - idx}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-zinc-400 mb-2">{notif.message}</p>
                                                <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                    <span className="font-mono">
                                                        {new Date(notif.timestamp).toLocaleDateString('th-TH')}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-mono">
                                                        {new Date(notif.timestamp).toLocaleTimeString('th-TH')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </main>
            </div>
        </ProtectedRoute>
    );
}
