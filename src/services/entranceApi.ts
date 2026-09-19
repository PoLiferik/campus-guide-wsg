import type { Entrance } from '../types/Entrance';
import { entrances } from '../mocks/entrances';

const STORAGE_KEY = 'campus-guide-entrances';

export interface UpdateEntranceStatusRequest {
    isOpen: boolean;
    openFrom: string | null;
    openUntil: string | null;
}

export interface SaveEntranceRequest {
    buildingId: number;
    code: string;

    x: number;
    y: number;

    description: string | null;

    accessibility: Entrance['accessibility'];
    verificationStatus: Entrance['verificationStatus'];

    isOpen: boolean | null;

    openFrom: string | null;
    openUntil: string | null;
}

function readMockEntrances(): Entrance[] {
    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        const initial =
            entrances.map(
                (entrance) => ({
                    ...entrance,
                })
            );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(initial)
        );

        return initial;
    }

    try {
        return JSON.parse(saved) as Entrance[];
    } catch {
        return entrances.map(
            (entrance) => ({
                ...entrance,
            })
        );
    }
}

function saveMockEntrances(
    data: Entrance[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

export const entranceApi = {
    async getAll(): Promise<Entrance[]> {
        await new Promise(
            (resolve) =>
                setTimeout(resolve, 100)
        );

        return readMockEntrances();
    },

    async create(
        request: SaveEntranceRequest
    ): Promise<Entrance> {
        await new Promise(
            (resolve) =>
                setTimeout(resolve, 200)
        );

        const data =
            readMockEntrances();

        const newId =
            data.length === 0
                ? 1
                : Math.max(
                ...data.map(
                    (entrance) =>
                        entrance.id
                )
            ) + 1;

        const created: Entrance = {
            id: newId,

            ...request,

            updatedAt:
                new Date().toISOString(),

            updatedBy:
                'Administrator',
        };

        data.push(created);

        saveMockEntrances(data);

        return created;
    },

    async update(
        entranceId: number,
        request: SaveEntranceRequest
    ): Promise<Entrance> {
        await new Promise(
            (resolve) =>
                setTimeout(resolve, 200)
        );

        const data =
            readMockEntrances();

        const index =
            data.findIndex(
                (entrance) =>
                    entrance.id ===
                    entranceId
            );

        if (index === -1) {
            throw new Error(
                'Entrance not found'
            );
        }

        const updated: Entrance = {
            ...data[index],

            ...request,

            updatedAt:
                new Date().toISOString(),

            updatedBy:
                'Administrator',
        };

        data[index] = updated;

        saveMockEntrances(data);

        return updated;
    },
    async delete(
        entranceId: number
    ): Promise<void> {
        await new Promise(
            (resolve) =>
                setTimeout(resolve, 150)
        );
        const data =
            readMockEntrances();

        const updated =
            data.filter(
                (entrance) =>
                    entrance.id !==
                    entranceId
            );

        saveMockEntrances(updated);
    },
    async updateStatus(
        entranceId: number,
        request: UpdateEntranceStatusRequest
    ): Promise<Entrance> {
        const data =
            readMockEntrances();
        const index =
            data.findIndex(
                (entrance) =>
                    entrance.id ===
                    entranceId
            );
        if (index === -1) {
            throw new Error(
                'Entrance not found'
            );
        }
        const updated: Entrance = {
            ...data[index],

            isOpen:
            request.isOpen,

            openFrom:
            request.openFrom,

            openUntil:
            request.openUntil,

            updatedAt:
                new Date().toISOString(),

            updatedBy:
                'Wykładowca WSG',
        };
        data[index] = updated;
        saveMockEntrances(data);
        return updated;
    },
};