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
    const number = Number(roomNumber);
    if (!Number.isFinite(number)) return 0;

    return Math.floor(number / 100);
}

function getFloorLabel(floor: number): string {
    return floor === 0 ? 'Parter' : `${floor} piętro`;
}

function findLocalBuildingByCode(code: string) {
    return mapBuildings.find(
        (building) => building.code.trim().toUpperCase() === code.trim().toUpperCase()
    );
}

function findLocalBuildingById(id: number) {
    return mapBuildings.find((building) => building.id === id);
}

async function getBuildings(): Promise<BuildingDto[]> {
    return (await apiRequest<BuildingDto[] | undefined>('/Buildings')) ?? [];
}

async function getRooms(): Promise<RoomDto[]> {
    return (await apiRequest<RoomDto[] | undefined>('/Rooms')) ?? [];
}

function parseSearchQuery(query: string) {
    let value = query.trim().toUpperCase();
    value = value.replace(/^BUDYNEK\s*/i, '');

    const buildingRoomMatch = value.match(/^([A-Z]{1,2})[\s-]*(\d{1,3})$/);

    if (buildingRoomMatch) {
        return {
            buildingCode: buildingRoomMatch[1],
            roomNumber: buildingRoomMatch[2].padStart(3, '0'),
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

function roomToSearchResult(
    room: RoomDto,
    apiBuilding: BuildingDto
): SearchResult | null {
    const roomId = toNumber(room.id);
    const roomNumber = normalizeRoomNumber(room.number);
    const buildingCode = getBuildingCode(apiBuilding);

    if (roomId === null || !roomNumber || !buildingCode) return null;

    const localBuilding = findLocalBuildingByCode(buildingCode);
    if (!localBuilding) return null;

    const floor = getFloor(roomNumber);

    return {
        type: 'room',
        id: roomId,
        buildingId: localBuilding.id,
        buildingCode: localBuilding.code,
        number: roomNumber,
        floor,
        floorLabel: getFloorLabel(floor),
        isDemo: false,
    };
}

function findApiBuildingForRoom(room: RoomDto, buildings: BuildingDto[]) {
    const buildingId = toNumber(room.buildingId);

    if (buildingId === null) return undefined;

    return buildings.find((building) => toNumber(building.id) === buildingId);
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

                const apiBuilding = findApiBuildingForRoom(room, apiBuildings);
                if (!apiBuilding) continue;

                const buildingCode = getBuildingCode(apiBuilding);

                if (parsed.buildingCode && buildingCode !== parsed.buildingCode) {
                    continue;
                }

                const result = roomToSearchResult(room, apiBuilding);

                if (result) results.push(result);
            }
        }

        return {
            items: results,
            page: 1,
            pageSize: results.length,
            total: results.length,
        };
    },

    async getRoomsByBuilding(buildingId: number): Promise<SearchResult[]> {
        const localBuilding = findLocalBuildingById(buildingId);
        if (!localBuilding) return [];

        const [apiBuildings, apiRooms] = await Promise.all([
            getBuildings(),
            getRooms(),
        ]);

        const apiBuilding = apiBuildings.find(
            (building) => getBuildingCode(building) === localBuilding.code.toUpperCase()
        );

        const backendBuildingId = toNumber(apiBuilding?.id);

        if (!apiBuilding || backendBuildingId === null) return [];

        return apiRooms
            .filter((room) => toNumber(room.buildingId) === backendBuildingId)
            .map((room) => roomToSearchResult(room, apiBuilding))
            .filter((room): room is SearchResult => room !== null)
            .sort((a, b) => (a.number ?? '').localeCompare(b.number ?? ''));
    },

    async getRoom(roomId: number): Promise<RoomDetails> {
        const room = await apiRequest<RoomDto>(`/Rooms/${roomId}`);

        const roomNumber = normalizeRoomNumber(room.number);
        const backendBuildingId = toNumber(room.buildingId);

        if (!roomNumber || backendBuildingId === null) {
            throw new Error('Nieprawidłowe dane sali.');
        }

        const apiBuildings = await getBuildings();

        const apiBuilding = apiBuildings.find(
            (building) => toNumber(building.id) === backendBuildingId
        );

        if (!apiBuilding) {
            throw new Error('Nie znaleziono budynku dla sali.');
        }

        const buildingCode = getBuildingCode(apiBuilding);
        const localBuilding = findLocalBuildingByCode(buildingCode);

        if (!localBuilding) {
            throw new Error(`Budynek ${buildingCode} nie istnieje na mapie.`);
        }

        const floor = getFloor(roomNumber);

        return {
            id: roomId,
            number: roomNumber,
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