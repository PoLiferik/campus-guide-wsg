import type { Entrance } from './Entrance';

export interface RoomDetails {
    id: number;

    number: string;

    floor: number;
    floorLabel: string;

    building: {
        id: number;
        code: string;
    };

    directions: string | null;

    isDemo: boolean;

    entrances: Entrance[];

    recommendedEntranceId: number | null;
}