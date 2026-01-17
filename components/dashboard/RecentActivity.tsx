import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, CloudLightning } from "lucide-react";

const activities = [
    {
        id: 1,
        type: "congestion",
        message: "High traffic density detected at Sukhumvit Rd.",
        time: "2 mins ago",
        icon: AlertTriangle,
        color: "text-red-500"
    },
    {
        id: 2,
        type: "clear",
        message: "Traffic cleared at Rama IV Junction",
        time: "5 mins ago",
        icon: CheckCircle2,
        color: "text-green-500"
    },
    {
        id: 3,
        type: "ai",
        message: "AI adjusted green light duration to 60s at Asoke",
        time: "10 mins ago",
        icon: CloudLightning,
        color: "text-blue-500"
    }
];

export function RecentActivity() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center">
                                <activity.icon className={`h-9 w-9 p-2 rounded-full bg-slate-100 ${activity.color} mr-4`} />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{activity.message}</p>
                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
