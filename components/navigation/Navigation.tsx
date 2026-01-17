"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard,
    Activity,
    Bell,
    Settings,
    LogOut,
    Traffic,
    User,
} from "lucide-react";

const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Simulation", path: "/simulation", icon: Activity },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Settings", path: "/settings", icon: Settings },
];

export function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <nav className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50">
            {/* Brand */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <Traffic className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                    <h1 className="text-sm font-black text-white uppercase tracking-tight">
                        Smart Traffic Assistance
                    </h1>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                        Traffic Management System
                    </p>
                </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link key={item.path} href={item.path}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`gap-2 ${isActive
                                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {item.name}
                                </span>
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-300">
                        {user?.username || "User"}
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 border-white/10 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Logout</span>
                </Button>
            </div>
        </nav>
    );
}
