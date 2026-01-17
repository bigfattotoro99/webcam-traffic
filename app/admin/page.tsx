"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Admin Control</h2>
                <p className="text-muted-foreground">Manage AI parameters and system overrides.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Control System</CardTitle>
                        <CardDescription>Configure the autonomous traffic management engine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Master AI Switch</Label>
                                <div className="text-sm text-muted-foreground">Enable or disable full autonomous control.</div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Rain Mode</Label>
                                <div className="text-sm text-muted-foreground">Adjust timings for wet road conditions (slower flow).</div>
                            </div>
                            <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Emergency Corridor Mode</Label>
                                <div className="text-sm text-muted-foreground">Prioritize routes for ambulances/fire trucks automatically.</div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Traffic Light Parameters</CardTitle>
                        <CardDescription>Set manual constraints for light durations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Green Light Duration (s)</Label>
                                <Input type="number" defaultValue="30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Green Light Duration (s)</Label>
                                <Input type="number" defaultValue="120" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Yellow Light Duration (s)</Label>
                                <Input type="number" defaultValue="3" />
                            </div>
                            <div className="space-y-2">
                                <Label>Pedestrian Crossing Time (s)</Label>
                                <Input type="number" defaultValue="15" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button>Save Configuration</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
