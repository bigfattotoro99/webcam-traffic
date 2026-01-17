"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check authentication on mount
        if (!isAuthenticated) {
            router.push("/login");
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, router]);

    if (isChecking || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="mt-4 text-sm text-zinc-500">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
