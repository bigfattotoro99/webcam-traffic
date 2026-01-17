import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'congestion' | 'accident' | 'emergency' | 'weather';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (type: NotificationType, title: string, message: string) => void;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],

            addNotification: (type: NotificationType, title: string, message: string) => {
                const notification: Notification = {
                    id: `${Date.now()}-${Math.random()}`,
                    type,
                    title,
                    message,
                    timestamp: Date.now(),
                };

                set((state) => ({
                    notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
                }));
            },

            clearNotifications: () => {
                set({ notifications: [] });
            },
        }),
        {
            name: 'traffic-notifications',
        }
    )
);
