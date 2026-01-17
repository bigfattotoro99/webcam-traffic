"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, TrafficCone } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuthStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Redirect if already authenticated
    if (isAuthenticated) {
        router.push("/dashboard");
        return null;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        const success = login(username, password);
        if (success) {
            router.push("/dashboard");
        } else {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4">
                            <TrafficCone className="w-8 h-8 text-sky-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                            Smart Traffic Assistance
                        </h1>
                        <p className="text-sm text-zinc-400">
                            เข้าสู่ระบบเพื่อจัดการจราจรอัจฉริยะ
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                Username / Email
                            </label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-black/30 border-white/10 text-white placeholder:text-zinc-600 focus:border-sky-500/50"
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/30 border-white/10 text-white placeholder:text-zinc-600 focus:border-sky-500/50"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold uppercase tracking-wider h-12"
                        >
                            เข้าสู่ระบบ
                        </Button>
                    </form>

                    {/* Forgot Password Link */}
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                            onClick={() => alert("Password recovery feature coming soon!")}
                        >
                            ลืมรหัสผ่าน?
                        </button>
                    </div>

                    {/* Demo Hint */}
                    <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                        <p className="text-xs text-amber-400/80 text-center">
                            <strong>Demo Mode:</strong> Use any username and password to login
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
