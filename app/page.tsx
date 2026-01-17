"use client";

import { Activity, Car, Zap, Map as MapIcon, ShieldCheck, Cpu } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PredictionChart } from "@/components/dashboard/PredictionChart";
import { IncidentFeed } from "@/components/dashboard/IncidentFeed";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-[url('/grid-pattern.svg')] bg-fixed bg-cover">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Traffic Command Center
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            System Operational • AI Optimization Active
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/map">
            <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <MapIcon className="mr-2 h-5 w-5" /> Open Map View
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Junctions"
          value="1,240"
          icon={Zap}
          description="AI Controlled"
          trend="+98.5% Uptime"
          trendUp={true}
        />
        <StatCard
          title="Traffic Density"
          value="High (82%)"
          icon={Car}
          description="Peak Hour Detected"
          trend="+12% vs Avg"
          trendUp={false}
        />
        <StatCard
          title="Signal Optimization"
          value="-45s"
          icon={Activity}
          description="Avg Wait Time Saved"
          trend="High Efficiency"
          trendUp={true}
        />
        <StatCard
          title="System Health"
          value="99.9%"
          icon={Cpu}
          description="All sensors online"
          trend="Stable"
          trendUp={true}
        />
      </div>

      {/* Main Content Area - Bento Grid */}
      <div className="grid gap-4 md:grid-cols-12 lg:grid-rows-2 h-auto lg:h-[700px]">

        {/* Large Chart Area */}
        <div className="md:col-span-8 lg:row-span-2 space-y-4">
          <PredictionChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-320px)]">
            <div className="glass-card rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4">
              <ShieldCheck className="h-16 w-16 text-primary mb-2" />
              <h3 className="text-xl font-bold">Safe Corridors Active</h3>
              <p className="text-muted-foreground text-sm">Emergency vehicle pre-emption is active on 3 routes.</p>
              <Link href="/admin">
                <Button variant="outline" className="w-full">Manage Protocols</Button>
              </Link>
            </div>
            <RecentActivity />
          </div>
        </div>

        {/* Side Panel */}
        <div className="md:col-span-4 lg:row-span-2 space-y-4">
          <IncidentFeed />
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-20 flex flex-col gap-1 hover:border-primary hover:bg-primary/5">
                <Zap className="h-5 w-5" />
                <span>Reset Lights</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 hover:border-destructive hover:bg-destructive/5">
                <Activity className="h-5 w-5" />
                <span>Emergency Mode</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
