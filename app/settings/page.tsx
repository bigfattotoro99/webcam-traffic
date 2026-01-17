"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingsStore, type Settings } from "@/lib/store/settings";
import { Save, RotateCcw, Settings as SettingsIcon, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
    const { settings, updateSettings, resetToDefault } = useSettingsStore();
    const [formData, setFormData] = useState<Settings>(settings);
    const { toast } = useToast();

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (key: keyof Settings, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setFormData(prev => ({ ...prev, [key]: numValue }));
        }
    };

    const handleSave = () => {
        updateSettings(formData);
        toast({
            title: "✅ Settings Saved",
            description: "Your configuration has been updated successfully",
        });
    };

    const handleReset = () => {
        resetToDefault();
        toast({
            title: "🔄 Reset to Default",
            description: "All settings have been restored to default values",
        });
    };

    const settingFields = [
        {
            key: 'greenDuration' as keyof Settings,
            label: 'Green Light Duration',
            description: 'ระยะเวลาไฟเขียว (วินาที)',
            unit: 'seconds',
            min: 10,
            max: 60,
        },
        {
            key: 'redDuration' as keyof Settings,
            label: 'Red Light Duration',
            description: 'ระยะเวลาไฟแดง (วินาที)',
            unit: 'seconds',
            min: 10,
            max: 60,
        },
        {
            key: 'vehicleSpeed' as keyof Settings,
            label: 'Vehicle Speed',
            description: 'ความเร็วรถ (พิกเซล/เฟรม)',
            unit: 'px/frame',
            min: 0.5,
            max: 5,
            step: 0.1,
        },
        {
            key: 'spawnRate' as keyof Settings,
            label: 'Spawn Rate',
            description: 'อัตราการเกิดรถต่อเลน (0-1)',
            unit: 'probability',
            min: 0.1,
            max: 1,
            step: 0.05,
        },
        {
            key: 'minGap' as keyof Settings,
            label: 'Minimum Gap',
            description: 'ระยะห่างขั้นต่ำกันชน (พิกเซล)',
            unit: 'pixels',
            min: 5,
            max: 30,
        },
        {
            key: 'intersectionSize' as keyof Settings,
            label: 'Intersection Size',
            description: 'ขนาดพื้นที่ทางแยก (พิกเซล)',
            unit: 'pixels',
            min: 60,
            max: 120,
        },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950">
                <Navigation />

                <main className="p-6 max-w-5xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Settings</h1>
                        <p className="text-sm text-zinc-400">
                            ตั้งค่าพารามิเตอร์การจำลองการจราจร
                        </p>
                    </div>

                    {/* Settings Form */}
                    <Card className="p-6 bg-slate-900/50 border-white/5">
                        <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-sky-400" />
                            Simulation Parameters
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {settingFields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        {field.label}
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            value={formData[field.key]}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            min={field.min}
                                            max={field.max}
                                            step={field.step || 1}
                                            className="bg-black/30 border-white/10 text-white font-mono"
                                        />
                                        <span className="text-xs text-zinc-600 font-mono whitespace-nowrap min-w-[80px]">
                                            {field.unit}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-600 italic">
                                        {field.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/5">
                            <Button
                                onClick={handleSave}
                                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold uppercase gap-2 h-12"
                            >
                                <Save className="w-4 h-4" />
                                Save Configuration
                            </Button>

                            <Button
                                onClick={handleReset}
                                variant="outline"
                                className="flex-1 border-white/10 text-zinc-400 hover:bg-white/5 font-bold uppercase gap-2 h-12"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset to Default
                            </Button>
                        </div>
                    </Card>

                    {/* Current Configuration Display */}
                    <Card className="p-6 bg-slate-900/50 border-white/5">
                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            Active Configuration
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(settings).map(([key, value]) => (
                                <div key={key} className="p-3 bg-black/20 border border-white/5 rounded-lg">
                                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <p className="text-lg font-mono font-black text-sky-400">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </main>
            </div>
        </ProtectedRoute>
    );
}
