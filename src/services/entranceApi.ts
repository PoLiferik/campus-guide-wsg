import { entrances as mockEntrances } from '../mocks/entrances';

import type {
    Entrance,
    EntranceAccessibility,
    EntranceDirection,
    EntranceVerificationStatus,
} from '../types/Entrance';

const STORAGE_KEY = 'campus-guide-entrances';

export interface SaveEntranceRequest {
    buildingId: number;
    code: string;

    x: number;
    y: number;

    direction: EntranceDirection;

    description: string | null;

    accessibility: EntranceAccessibility;
    verificationStatus: EntranceVerificationStatus;

    isOpen: boolean | null;

    openFrom: string | null;
    openUntil: string | null;
}

export interface UpdateEntranceStatusRequest {
    isOpen: boolean | null;
    openFrom: string | null;
    openUntil: string | null;
}

function readSavedEntrances(): Entrance[] {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved) as Entrance[];
    } catch {
        return [];
    }
}

function readEntrances(): Entrance[] {
    const savedEntrances = readSavedEntrances();

    /*
        WAŻNE:

        Pozycja X/Y oraz kierunek strzałki
        ZAWSZE pochodzą z mocks/entrances.ts.

        localStorage przechowuje tylko dane,
        które mogą zmieniać wykładowca/admin:
        status i godziny.
    */

    return mockEntrances.map((mockEntrance) => {
        const saved = savedEntrances.find(
            (entrance) =>
                entrance.id === mockEntrance.id
        );

        if (!saved) {
            return {
                ...mockEntrance,
            };
        }

        return {
            ...mockEntrance,

            isOpen: saved.isOpen,
            openFrom: saved.openFrom,
            openUntil: saved.openUntil,

            updatedAt:
                saved.updatedAt ??
                mockEntrance.updatedAt ??
                null,

            updatedBy:
                saved.updatedBy ??
                mockEntrance.updatedBy ??
                null,
        };
    });
}

function saveEntrances(
    entrances: Entrance[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entrances)
    );
}

export const entranceApi = {
    async getAll():
        Promise<Entrance[]> {

        return readEntrances();
    },

    async create(
        request: SaveEntranceRequest
    ): Promise<Entrance> {

        const entrances =
            readEntrances();

        const id =
            entrances.length === 0
                ? 1
                : Math.max(
                ...entrances.map(
                    (entrance) =>
                        entrance.id
                )
            ) + 1;

        const created: Entrance = {
            id,

            buildingId:
            request.buildingId,

            code:
                request.code
                    .trim()
                    .toUpperCase(),

            x: request.x,
            y: request.y,

            direction:
            request.direction,

            description:
            request.description,

            accessibility:
            request.accessibility,

            verificationStatus:
            request.verificationStatus,

            isOpen:
            request.isOpen,

            openFrom:
            request.openFrom,

            openUntil:
            request.openUntil,

            updatedAt:
                new Date()
                    .toISOString(),

            updatedBy:
                'Administrator',
        };

        entrances.push(created);

        saveEntrances(
            entrances
        );

        return created;
    },

    async update(
        id: number,
        request: SaveEntranceRequest
    ): Promise<Entrance> {

        const entrances =
            readEntrances();

        const index =
            entrances.findIndex(
                (entrance) =>
                    entrance.id === id
            );

        if (index === -1) {
            throw new Error(
                'ENTRANCE_NOT_FOUND'
            );
        }

        const updated: Entrance = {
            ...entrances[index],

            buildingId:
            request.buildingId,

            code:
                request.code
                    .trim()
                    .toUpperCase(),

            x:
            request.x,

            y:
            request.y,

            direction:
            request.direction,

            description:
            request.description,

            accessibility:
            request.accessibility,

            verificationStatus:
            request.verificationStatus,

            isOpen:
            request.isOpen,

            openFrom:
            request.openFrom,

            openUntil:
            request.openUntil,

            updatedAt:
                new Date()
                    .toISOString(),

            updatedBy:
                'Administrator',
        };

        entrances[index] =
            updated;

        saveEntrances(
            entrances
        );

        return updated;
    },

    async delete(
        id: number
    ): Promise<void> {

        const entrances =
            readEntrances();

        const filtered =
            entrances.filter(
                (entrance) =>
                    entrance.id !== id
            );

        saveEntrances(
            filtered
        );
    },

    async updateStatus(
        id: number,
        request: UpdateEntranceStatusRequest
    ): Promise<Entrance> {

        const entrances =
            readEntrances();

        const index =
            entrances.findIndex(
                (entrance) =>
                    entrance.id === id
            );

        if (index === -1) {
            throw new Error(
                'ENTRANCE_NOT_FOUND'
            );
        }

        const updated: Entrance = {
            ...entrances[index],

            isOpen:
            request.isOpen,

            openFrom:
            request.openFrom,

            openUntil:
            request.openUntil,

            updatedAt:
                new Date()
                    .toISOString(),

            updatedBy:
                'Wykładowca WSG',
        };

        entrances[index] =
            updated;

        saveEntrances(
            entrances
        );

        return updated;
    },
};