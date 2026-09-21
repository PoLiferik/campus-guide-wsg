import { apiRequest } from './apiClient';
import { buildings as mapBuildings } from '../mocks/buildings';
import type { BuildingDto } from '../types/dto/BuildingDto';
import type { RoomDto } from '../types/dto/RoomDto';
import type { SearchResponse, SearchResult } from '../types/Search';
import type { RoomDetails } from '../types/Room';

function toNumber(value: number | string | undefined): number | null {
    if (value === undefined || value === null) return null;
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
}

function normalizeRoomNumber(value: number | string | undefined): string | null {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    if (!text) return null;
    return text.padStart(3, '0');
}

function getBuildingCode(building: BuildingDto | undefined): string {
    return building?.name?.trim().toUpperCase() ?? '';
}

function getFloor(roomNumber: string): number {
    const value = Number(roomNumber);
    if (value >= 200) return 2;
    if (value >= 100) return 1;
    return 0;
}

function getFloorLabel(floor: number): string {
    if (floor === 0) return 'Parter';
    return `${floor} piętro`;
}

function findLocalBuildingById(id: number) {
    return mapBuildings.find((building) => building.id === id);
}

function findLocalBuildingByCode(code: string) {
    return mapBuildings.find(
        (building) => building.code.trim().toUpperCase() === code.trim().toUpperCase()
    );
}

async function getBuildings(): Promise<BuildingDto[]> {
    return (await apiRequest<BuildingDto[] | undefined>('/Buildings')) ?? [];
}

async function getRooms(): Promise<RoomDto[]> {
    return (await apiRequest<RoomDto[] | undefined>('/Rooms')) ?? [];
}

function roomBelongsToBuilding(room: RoomDto, building: BuildingDto): boolean {
    const roomId = toNumber(room.id);
    const buildingId = toNumber(building.id);

    if (roomId === null || buildingId === null) return false;

    const buildingHasRoom = (building.roomIds ?? []).some(
        (id) => Number(id) === roomId
    );

    const roomHasBuilding = (room.buildingIds ?? []).some(
        (id) => Number(id) === buildingId
    );

    return buildingHasRoom || roomHasBuilding;
}

function findBuildingsForRoom(room: RoomDto, buildings: BuildingDto[]): BuildingDto[] {
    return buildings.filter((building) => roomBelongsToBuilding(room, building));
}

function roomToSearchResult(room: RoomDto, apiBuilding: BuildingDto): SearchResult | null {
    const roomId = toNumber(room.id);
    const number = normalizeRoomNumber(room.number);
    const buildingCode = getBuildingCode(apiBuilding);

    if (roomId === null || !number || !buildingCode) return null;

    const localBuilding = findLocalBuildingByCode(buildingCode);
    if (!localBuilding) return null;

    const floor = getFloor(number);

    return {
        type: 'room',
        id: roomId,
        buildingId: localBuilding.id,
        buildingCode: localBuilding.code,
        number,
        floor,
        floorLabel: getFloorLabel(floor),
        isDemo: false,
    };
}

function parseSearchQuery(query: string) {
    let value = query.trim().toUpperCase();
    value = value.replace(/^BUDYNEK\s*/i, '');

    const roomMatch = value.match(/^([A-Z]{1,2})[\s-]*(\d{1,3})$/);

    if (roomMatch) {
        return {
            buildingCode: roomMatch[1],
            roomNumber: roomMatch[2].padStart(3, '0'),
        };
    }

    if (/^[A-Z]{1,2}$/.test(value)) {
        return {
            buildingCode: value,
            roomNumber: null,
        };
    }

    if (/^\d{1,3}$/.test(value)) {
        return {
            buildingCode: null,
            roomNumber: value.padStart(3, '0'),
        };
    }

    return {
        buildingCode: null,
        roomNumber: null,
    };
}

export const campusApi = {
    async search(query: string): Promise<SearchResponse> {
        const parsed = parseSearchQuery(query);

        if (!parsed.buildingCode && !parsed.roomNumber) {
            return {
                items: [],
                page: 1,
                pageSize: 0,
                total: 0,
            };
        }

        const [apiBuildings, apiRooms] = await Promise.all([
            getBuildings(),
            getRooms(),
        ]);

        const results: SearchResult[] = [];

        if (parsed.buildingCode && !parsed.roomNumber) {
            const apiBuilding = apiBuildings.find(
                (building) => getBuildingCode(building) === parsed.buildingCode
            );

            const localBuilding = findLocalBuildingByCode(parsed.buildingCode);

            if (apiBuilding && localBuilding) {
                results.push({
                    type: 'building',
                    id: localBuilding.id,
                    buildingId: localBuilding.id,
                    buildingCode: localBuilding.code,
                });
            }
        }

        if (parsed.roomNumber) {
            for (const room of apiRooms) {
                if (normalizeRoomNumber(room.number) !== parsed.roomNumber) continue;

                const relatedBuildings = findBuildingsForRoom(room, apiBuildings);

                for (const apiBuilding of relatedBuildings) {
                    const buildingCode = getBuildingCode(apiBuilding);

                    if (parsed.buildingCode && buildingCode !== parsed.buildingCode) continue;

                    const result = roomToSearchResult(room, apiBuilding);
                    if (result) results.push(result);
                }
            }
        }

        return {
            items: results,
            page: 1,
            pageSize: results.length,
            total: results.length,
        };
    },

    async getRoomsByBuilding(localBuildingId: number): Promise<SearchResult[]> {
        const localBuilding = findLocalBuildingById(localBuildingId);
        if (!localBuilding) return [];

        const [apiBuildings, apiRooms] = await Promise.all([
            getBuildings(),
            getRooms(),
        ]);

        const apiBuilding = apiBuildings.find(
            (building) => getBuildingCode(building) === localBuilding.code.toUpperCase()
        );

        if (!apiBuilding) return [];

        const backendBuildingId = toNumber(apiBuilding.id);
        if (backendBuildingId === null) return [];

        const roomIds = new Set(
            (apiBuilding.roomIds ?? [])
                .map(Number)
                .filter(Number.isFinite)
        );

        return apiRooms
            .filter((room) => {
                const roomId = toNumber(room.id);

                if (roomId !== null && roomIds.has(roomId)) {
                    return true;
                }

                return (room.buildingIds ?? []).some(
                    (id) => Number(id) === backendBuildingId
                );
            })
            .map((room) => roomToSearchResult(room, apiBuilding))
            .filter((room): room is SearchResult => room !== null)
            .sort((a, b) => (a.number ?? '').localeCompare(b.number ?? ''));
    },

    async getRoom(roomId: number, localBuildingId?: number): Promise<RoomDetails> {
        const [room, apiBuildings] = await Promise.all([
            apiRequest<RoomDto>(`/Rooms/${roomId}`),
            getBuildings(),
        ]);

        const number = normalizeRoomNumber(room.number);

        if (!number) {
            throw new Error('Nieprawidłowy numer sali.');
        }

        let apiBuilding: BuildingDto | undefined;

        if (localBuildingId !== undefined) {
            const localBuilding = findLocalBuildingById(localBuildingId);

            apiBuilding = apiBuildings.find(
                (building) =>
                    getBuildingCode(building) === localBuilding?.code.toUpperCase()
            );

            if (apiBuilding && !roomBelongsToBuilding(room, apiBuilding)) {
                apiBuilding = undefined;
            }
        }

        if (!apiBuilding) {
            apiBuilding = findBuildingsForRoom(room, apiBuildings)[0];
        }

        if (!apiBuilding) {
            throw new Error('Sala nie jest przypisana do żadnego budynku.');
        }

        const buildingCode = getBuildingCode(apiBuilding);
        const localBuilding = findLocalBuildingByCode(buildingCode);

        if (!localBuilding) {
            throw new Error(`Budynek ${buildingCode} nie istnieje na mapie.`);
        }

        const floor = getFloor(number);

        return {
            id: roomId,
            number,
            floor,
            floorLabel: getFloorLabel(floor),
            building: {
                id: localBuilding.id,
                code: localBuilding.code,
            },
            directions: null,
            isDemo: false,
            entrances: [],
            recommendedEntranceId: null,
        };
    },
};