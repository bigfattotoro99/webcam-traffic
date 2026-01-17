"use client";

import { Activity, Car, Zap, Map as MapIcon } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/map">
            <Button>
              <MapIcon className="mr-2 h-4 w-4" /> View Live Map
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Traffic Lights"
          value="1,240"
          icon={Zap}
          description="Controlled by AI"
          trend="+4.5%"
          trendUp={true}
        />
        <StatCard
          title="Avg. Traffic Density"
          value="68%"
          icon={Car}
          description="High congestion expected"
          trend="+12%"
          trendUp={false}
        />
        <StatCard
          title="Avg. Waiting Time"
          value="45s"
          icon={Activity}
          description="Decreased by AI optimization"
          trend="-15%"
          trendUp={true}
        />
        <StatCard
          title="Monitored Junctions"
          value="320"
          icon={MapIcon}
          description="Across 5 provinces"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-muted/20 border rounded-xl p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <MapIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Live Traffic Density Map</h3>
            <p className="text-sm text-muted-foreground mb-4">View real-time traffic data overlaid on Google Maps</p>
            <Link href="/map">
              <Button variant="outline">Open Full Map</Button>
            </Link>
          </div>
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
