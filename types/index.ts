export type RoadStatus = 'clear' | 'moderate' | 'congested';
export type TrafficLightStatus = 'green' | 'yellow' | 'red';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Road {
  id: string;
  name: string;
  status: RoadStatus;
  density: number; // 0-100
  lightStatus: TrafficLightStatus;
  path: Coordinate[];
  greenLightDuration: number; // seconds
  redLightDuration: number; // seconds
}

export interface TrafficStats {
  timestamp: string;
  totalCars: number;
  averageSpeed: number;
  locations: Record<string, Road>;
}
