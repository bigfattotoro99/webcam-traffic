import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
    greenDuration: number; // seconds
    redDuration: number; // seconds
    vehicleSpeed: number; // px/frame
    spawnRate: number; // probability per lane per frame (0-1)
    minGap: number; // pixels
    intersectionSize: number; // pixels
}

const DEFAULT_SETTINGS: Settings = {
    greenDuration: 30,
    redDuration: 30,
    vehicleSpeed: 2,
    spawnRate: 0.3,
    minGap: 10,
    intersectionSize: 80,
};

interface SettingsState {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    resetToDefault: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: DEFAULT_SETTINGS,

            updateSettings: (newSettings: Partial<Settings>) => {
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                }));
            },

            resetToDefault: () => {
                set({ settings: DEFAULT_SETTINGS });
            },
        }),
        {
            name: 'traffic-settings',
        }
    )
);
