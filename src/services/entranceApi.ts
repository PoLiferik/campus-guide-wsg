import { entrances } from '../mocks/entrances';
import type { Entrance } from '../types/Entrance';

const STORAGE_KEY = 'campus-guide-entrance-statuses';

interface EntranceStoredStatus {
    id: number;
    isOpen: boolean | null;
    openFrom: string | null;
    openUntil: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
}

export interface EntranceStatusUpdate {
    isOpen: boolean | null;
    openFrom?: string | null;
    openUntil?: string | null;
    updatedBy?: string | null;
}

function getStoredStatuses(): EntranceStoredStatus[] {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    try {
        return JSON.parse(saved) as EntranceStoredStatus[];
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
}

function saveStoredStatuses(statuses: EntranceStoredStatus[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}

function applyStoredStatuses(): Entrance[] {
    const statuses = getStoredStatuses();

    return entrances.map((entrance) => {
        const stored = statuses.find((item) => item.id === entrance.id);

        if (!stored) return { ...entrance };

        return {
            ...entrance,
            isOpen: stored.isOpen,
            openFrom: stored.openFrom,
            openUntil: stored.openUntil,
            updatedAt: stored.updatedAt,
            updatedBy: stored.updatedBy,
        };
    });
}

async function updateEntrance(
    id: number,
    update: EntranceStatusUpdate
): Promise<Entrance> {
    const entrance = entrances.find((item) => item.id === id);

    if (!entrance) {
        throw new Error('Nie znaleziono wejścia.');
    }

    const statuses = getStoredStatuses();

    const status: EntranceStoredStatus = {
        id,
        isOpen: update.isOpen,
        openFrom: update.openFrom ?? null,
        openUntil: update.openUntil ?? null,
        updatedAt: new Date().toISOString(),
        updatedBy: update.updatedBy ?? null,
    };

    const index = statuses.findIndex((item) => item.id === id);

    if (index >= 0) {
        statuses[index] = status;
    } else {
        statuses.push(status);
    }

    saveStoredStatuses(statuses);

    return {
        ...entrance,
        ...status,
    };
}

export const entranceApi = {
    async getAll(): Promise<Entrance[]> {
        return applyStoredStatuses();
    },

    async getByBuilding(buildingId: number): Promise<Entrance[]> {
        return applyStoredStatuses().filter(
            (entrance) => entrance.buildingId === buildingId
        );
    },

    async getById(id: number): Promise<Entrance> {
        const entrance = applyStoredStatuses().find(
            (item) => item.id === id
        );

        if (!entrance) {
            throw new Error('Nie znaleziono wejścia.');
        }

        return entrance;
    },

    async updateStatus(
        id: number,
        updateOrIsOpen: EntranceStatusUpdate | boolean | null,
        openFrom?: string | null,
        openUntil?: string | null,
        updatedBy?: string | null
    ): Promise<Entrance> {
        if (
            typeof updateOrIsOpen === 'object' &&
            updateOrIsOpen !== null
        ) {
            return updateEntrance(id, updateOrIsOpen);
        }

        return updateEntrance(id, {
            isOpen: updateOrIsOpen,
            openFrom: openFrom ?? null,
            openUntil: openUntil ?? null,
            updatedBy: updatedBy ?? null,
        });
    },

    async resetDemoStatuses(): Promise<void> {
        localStorage.removeItem(STORAGE_KEY);
    },
};