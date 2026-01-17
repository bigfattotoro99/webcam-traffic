"use client";

import { useState, useEffect } from 'react';

export function useTrafficData() {
    const [trafficData, setTrafficData] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource('/api/traffic');

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('Connected to traffic stream');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setTrafficData(data);
            } catch (error) {
                console.error('Error parsing traffic data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            eventSource.close();
            setIsConnected(false);
            // Optional: Logic to reconnect
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return { trafficData, isConnected };
}
