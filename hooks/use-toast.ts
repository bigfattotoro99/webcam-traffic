import { useState, useCallback } from "react";

interface ToastProps {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
        // Simple console log for basic functionality in this environment
        console.log(`[Toast] ${variant.toUpperCase()}: ${title} - ${description}`);

        // In a real app, this would update a global toast state
        // For this project, we'll keep it simple
    }, []);

    return { toast, toasts };
}
