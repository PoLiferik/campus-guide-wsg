import { ApiError, apiRequest } from './apiClient';
import type { RoomDto } from '../types/dto/RoomDto';

function toNumber(value: number | string | undefined): number | null {
    if (value === undefined || value === null) return null;

    const result = Number(value);
    return Number.isFinite(result) ? result : null;
}

async function addRoomToBuildings(
    roomId: number,
    buildingIds: number[]
): Promise<void> {
    for (const buildingId of buildingIds) {
        await apiRequest(
            `/Buildings/add-rooms?buildingId=${buildingId}`,
            {
                method: 'POST',
                body: JSON.stringify([roomId]),
            }
        );
    }
}

async function removeRoomFromBuildings(
    roomId: number,
    buildingIds: number[]
): Promise<void> {
    for (const buildingId of buildingIds) {
        await apiRequest(
            `/Buildings/remove-rooms?buildingId=${buildingId}`,
            {
                method: 'DELETE',
                body: JSON.stringify([roomId]),
            }
        );
    }
}

async function syncRoomBuildings(
    roomId: number,
    currentBuildingIds: number[],
    targetBuildingIds: number[]
): Promise<void> {
    const toRemove = currentBuildingIds.filter(
        (id) => !targetBuildingIds.includes(id)
    );

    const toAdd = targetBuildingIds.filter(
        (id) => !currentBuildingIds.includes(id)
    );

    await removeRoomFromBuildings(roomId, toRemove);
    await addRoomToBuildings(roomId, toAdd);
}

export const roomApi = {
    async getAll(): Promise<RoomDto[]> {
        return (await apiRequest<RoomDto[] | undefined>('/Rooms')) ?? [];
    },

    async getById(id: number): Promise<RoomDto> {
        return apiRequest<RoomDto>(`/Rooms/${id}`);
    },

    async getByNumber(number: string | number): Promise<RoomDto> {
        return apiRequest<RoomDto>(
            `/Rooms/number/${Number(number)}`
        );
    },

    async create(
        number: string,
        buildingIds: number[]
    ): Promise<RoomDto> {
        let room: RoomDto;

        try {
            room = await apiRequest<RoomDto>('/Rooms', {
                method: 'POST',
                body: JSON.stringify({
                    number: Number(number),
                    buildingIds: [],
                }),
            });
        } catch (error) {
            if (!(error instanceof ApiError) || error.status !== 409) {
                throw error;
            }

            room = await this.getByNumber(number);
        }

        const roomId = toNumber(room.id);

        if (roomId === null) {
            throw new Error('INVALID_ROOM_ID');
        }

        const currentBuildingIds = (room.buildingIds ?? [])
            .map(Number)
            .filter(Number.isFinite);

        await syncRoomBuildings(
            roomId,
            currentBuildingIds,
            buildingIds
        );

        return this.getById(roomId);
    },

    async update(
        id: number,
        number: string,
        buildingIds: number[]
    ): Promise<RoomDto> {
        const current = await this.getById(id);

        const currentBuildingIds = (current.buildingIds ?? [])
            .map(Number)
            .filter(Number.isFinite);

        await apiRequest<RoomDto>(`/Rooms/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                id,
                number: Number(number),
                buildingIds: current.buildingIds ?? [],
            }),
        });

        await syncRoomBuildings(
            id,
            currentBuildingIds,
            buildingIds
        );

        return this.getById(id);
    },

    async delete(id: number): Promise<void> {
        await apiRequest<void>(`/Rooms/${id}`, {
            method: 'DELETE',
        });
    },
};