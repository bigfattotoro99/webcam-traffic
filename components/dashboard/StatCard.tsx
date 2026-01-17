import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
    trend?: string;
    trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, trend, trendUp }: StatCardProps) {
    return (
        <Card className={`glass-card overflow-hidden relative transition-all hover:scale-[1.02] hover:shadow-2xl ${trendUp === true ? "border-l-4 border-l-green-500" :
                trendUp === false ? "border-l-4 border-l-red-500" :
                    "border-l-4 border-l-primary"
            }`}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Icon className="h-24 w-24 transform rotate-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
                <div className={`p-2 rounded-full ${trendUp === true ? "bg-green-500/20 text-green-500" :
                        trendUp === false ? "bg-red-500/20 text-red-500" :
                            "bg-primary/20 text-primary"
                    }`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description} {trend && <span className={`font-medium ml-1 ${trendUp ? "text-green-500" : "text-red-500"}`}>{trend}</span>}
                </p>
            </CardContent>
        </Card>
    );
}
