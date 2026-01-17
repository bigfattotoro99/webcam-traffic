"use client";

import { Activity, Car, Zap, Map as MapIcon, ShieldCheck, Cpu, Bell, Settings } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PredictionChart } from "@/components/dashboard/PredictionChart";
import { IncidentFeed } from "@/components/dashboard/IncidentFeed";
import { AICameraFeed } from "@/components/dashboard/AICameraFeed";
import { TrafficLightMonitor } from "@/components/dashboard/TrafficLightMonitor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen bg-[#0a0a0c] bg-[url('/grid-pattern.svg')] bg-fixed bg-cover selection:bg-emerald-500/30 text-white">

      {/* PROFESSIONAL COMMAND HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Cpu className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                Smart City <span className="text-emerald-500">Traffic Controller</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-[0.3em] uppercase">Centralized Al Management System • v2.4.0-Pro</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="flex -space-x-2 px-2 border-r border-white/10 mr-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0a0a0c] bg-zinc-800 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="text-zinc-400 group relative">
              <Bell className="w-5 h-5 group-hover:text-emerald-400" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-[#0a0a0c]"></span>
            </Button>
            <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white"><Settings className="w-5 h-5" /></Button>
            <Link href="/map">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <MapIcon className="mr-2 h-4 w-4" /> เริ่มต้นการจำลอง
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KRITICAL STATS HUD */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-left">
        <StatCard title="จุดคัดกรอง AI" value="1,240" icon={Zap} description="ระบบประมวลผลปกติ" trend="+99.9%" trendUp={true} />
        <StatCard title="ความหนาแน่นเฉลี่ย" value="72%" icon={Car} description="พื้นที่กรุงเทพชั้นใน" trend="+4%" trendUp={false} />
        <StatCard title="ประสิทธิภาพ AI" value="94.2%" icon={Activity} description="ความแม่นยำการทำนาย" trend="+1.2%" trendUp={true} />
        <StatCard title="เวลาตอบสนอง" value="45ms" icon={Cpu} description="ความหน่วงเครือข่าย" trend="Low" trendUp={true} />
      </div>

      {/* MAIN OPERATIONS GRID */}
      <div className="grid gap-6 md:grid-cols-12">

        {/* LEFT COMPONENT: ANALYTICS & CAMERA */}
        <div className="md:col-span-8 space-y-6">
          <div className="glass-card rounded-3xl p-6 border-white/5 shadow-3xl bg-[#0e0e11]/80 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                วิเคราะห์พฤติกรรมการจราจร (เรียลไทม์)
              </h3>
              <Badge variant="outline" className="font-mono text-[10px] text-emerald-500 border-emerald-500/30">AI PREDICTION: HIGH ACCURACY</Badge>
            </div>
            <PredictionChart />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AICameraFeed />
            <RecentActivity />
          </div>
        </div>

        {/* RIGHT COMPONENT: LOGS & MONITORING */}
        <div className="md:col-span-4 space-y-6">
          <TrafficLightMonitor />
          <IncidentFeed />

          {/* QUICK SYSTEM ACTIONS */}
          <div className="glass-card rounded-3xl p-6 border-white/10 bg-[#0e0e11]/90 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 text-left">การควบคุมระบบส่วนกลาง</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl border-white/5 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-zinc-400 hover:text-emerald-400">
                <Zap className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">รีเซ็ต AI</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-zinc-400 hover:text-red-400">
                <Activity className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">โหมดฉุกเฉิน</span>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
