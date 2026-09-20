export interface MapPoint {
    x: number;
    y: number;
}

export interface Building {
    id: number;
    code: string;
    name: string;
    polygon: MapPoint[];
}