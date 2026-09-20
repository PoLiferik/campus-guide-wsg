import {
    apiRequest,
} from './apiClient';

import {
    entrances as mockEntrances,
} from '../mocks/entrances';

import {
    buildings as mapBuildings,
} from '../mocks/buildings';

import type {
    BuildingDto,
} from '../types/dto/BuildingDto';

import type {
    EntranceDto,
} from '../types/dto/EntranceDto';

import type {
    Entrance,
} from '../types/Entrance';

export interface EntranceStatusUpdate {
    isOpen:
        boolean | null;
    openFrom?:
        string | null;
    openUntil?:
        string | null;
    updatedBy?:
        string | null;
}

interface EntranceExtra {
    isOpenOverride?:
        boolean | null;
    openFrom:
        string | null;
    openUntil:
        string | null;
    updatedAt:
        string | null;
    updatedBy:
        string | null;
}

const EXTRA_STORAGE_KEY =
    'campus-guide-entrance-extra';

function toNumber(
    value:
        number |
        string |
        undefined
): number | null {
    if (
        value === undefined ||
        value === null
    ) {
        return null;
    }

    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : null;
}

function readExtras():
    Record<
        string,
        EntranceExtra
    > {
    const saved =
        localStorage.getItem(
            EXTRA_STORAGE_KEY
        );

    if (!saved) {
        return {};
    }

    try {
        return JSON.parse(
            saved
        );
    } catch {
        return {};
    }
}

function saveExtras(
    extras:
    Record<
        string,
        EntranceExtra
    >
) {
    localStorage.setItem(
        EXTRA_STORAGE_KEY,
        JSON.stringify(
            extras
        )
    );
}

async function getApiBuildings():
    Promise<BuildingDto[]> {
    const response =
        await apiRequest<
            BuildingDto[] |
            undefined
        >(
            '/Buildings'
        );

    return response ?? [];
}

async function getApiEntrance(
    id: number
): Promise<EntranceDto> {
    return apiRequest<EntranceDto>(
        `/Entrances/${id}`
    );
}

function findLocalBuilding(
    apiBuilding:
        BuildingDto |
        undefined
) {
    const code =
        apiBuilding?.name
            ?.trim()
            .toUpperCase();

    if (!code) {
        return undefined;
    }

    return mapBuildings.find(
        (building) =>
            building.code
                .trim()
                .toUpperCase() ===
            code
    );
}

function findMockEntrance(
    apiEntrance:
    EntranceDto,
    localBuildingId?:
    number
) {
    const apiName =
        apiEntrance.name
            ?.trim()
            .toUpperCase();

    if (apiName) {
        const byCode =
            mockEntrances.find(
                (entrance) =>
                    entrance.code
                        .trim()
                        .toUpperCase() ===
                    apiName
            );

        if (byCode) {
            return byCode;
        }
    }

    const apiId =
        toNumber(
            apiEntrance.id
        );

    if (
        apiId === null
    ) {
        return undefined;
    }

    const byId =
        mockEntrances.find(
            (entrance) =>
                entrance.id ===
                apiId
        );

    if (
        byId &&
        (
            localBuildingId ===
            undefined ||
            byId.buildingId ===
            localBuildingId
        )
    ) {
        return byId;
    }

    return undefined;
}

function mergeEntrance(
    apiEntrance:
    EntranceDto,
    apiBuildings:
    BuildingDto[]
): Entrance | null {
    const apiEntranceId =
        toNumber(
            apiEntrance.id
        );

    const backendBuildingId =
        toNumber(
            apiEntrance.buildingId
        );

    if (
        apiEntranceId ===
        null ||
        backendBuildingId ===
        null
    ) {
        return null;
    }

    const apiBuilding =
        apiBuildings.find(
            (building) =>
                toNumber(
                    building.id
                ) ===
                backendBuildingId
        );

    const localBuilding =
        findLocalBuilding(
            apiBuilding
        );

    const mockEntrance =
        findMockEntrance(
            apiEntrance,
            localBuilding?.id
        );

    if (!mockEntrance) {
        console.warn(
            'Brak pozycji wejścia na mapie:',
            apiEntrance.name
        );

        return null;
    }

    const extras =
        readExtras();

    const extra =
        extras[
            String(
                apiEntranceId
            )
            ];

    const hasOverride =
        extra !==
        undefined &&
        Object.prototype
            .hasOwnProperty
            .call(
                extra,
                'isOpenOverride'
            );

    return {
        ...mockEntrance,

        id:
        apiEntranceId,

        buildingId:
            localBuilding?.id ??
            mockEntrance
                .buildingId,

        code:
            apiEntrance.name ??
            mockEntrance.code,

        isOpen:
            hasOverride
                ? extra
                    .isOpenOverride ??
                null
                : apiEntrance
                    .isOpen ??
                null,

        openFrom:
            extra?.openFrom ??
            null,

        openUntil:
            extra?.openUntil ??
            null,

        updatedAt:
            extra?.updatedAt ??
            null,

        updatedBy:
            extra?.updatedBy ??
            null,
    };
}

function normalizeUpdate(
    updateOrIsOpen:
        EntranceStatusUpdate |
        boolean |
        null,
    openFrom:
        string | null,
    openUntil:
        string | null,
    updatedBy:
        string | null
): EntranceStatusUpdate {
    if (
        typeof updateOrIsOpen ===
        'object' &&
        updateOrIsOpen !==
        null
    ) {
        return updateOrIsOpen;
    }

    return {
        isOpen:
        updateOrIsOpen,

        openFrom,

        openUntil,

        updatedBy,
    };
}

export const entranceApi = {
    async getAll():
        Promise<Entrance[]> {
        const [
            apiEntrances,
            apiBuildings,
        ] =
            await Promise.all([
                apiRequest<
                    EntranceDto[] |
                    undefined
                >(
                    '/Entrances'
                ),

                getApiBuildings(),
            ]);

        return (
            apiEntrances ??
            []
        )
            .map(
                (entrance) =>
                    mergeEntrance(
                        entrance,
                        apiBuildings
                    )
            )
            .filter(
                (
                    entrance
                ): entrance is Entrance =>
                    entrance !== null
            );
    },

    async getById(
        id: number
    ): Promise<
        Entrance | null
    > {
        const [
            entrance,
            buildings,
        ] =
            await Promise.all([
                getApiEntrance(
                    id
                ),

                getApiBuildings(),
            ]);

        return mergeEntrance(
            entrance,
            buildings
        );
    },

    async updateStatus(
        id: number,
        updateOrIsOpen:
            EntranceStatusUpdate |
            boolean |
            null,
        openFrom:
            string | null =
        null,
        openUntil:
            string | null =
        null,
        updatedBy:
            string | null =
        null
    ): Promise<Entrance> {
        const update =
            normalizeUpdate(
                updateOrIsOpen,
                openFrom,
                openUntil,
                updatedBy
            );

        const current =
            await getApiEntrance(
                id
            );

        let saved =
            current;

        if (
            update.isOpen !==
            null
        ) {
            const payload:
                EntranceDto = {
                id:
                current.id,

                name:
                current.name,

                isOpen:
                update.isOpen,

                buildingId:
                current.buildingId,
            };

            saved =
                await apiRequest<EntranceDto>(
                    `/Entrances/${id}`,
                    {
                        method:
                            'PUT',

                        body:
                            JSON.stringify(
                                payload
                            ),
                    }
                );
        }

        const extras =
            readExtras();

        const key =
            String(id);

        const previous =
            extras[key] ?? {
                openFrom:
                    null,

                openUntil:
                    null,

                updatedAt:
                    null,

                updatedBy:
                    null,
            };

        const next:
            EntranceExtra = {
            ...previous,

            openFrom:
                update.openFrom ??
                null,

            openUntil:
                update.openUntil ??
                null,

            updatedAt:
                new Date()
                    .toISOString(),

            updatedBy:
                update.updatedBy ??
                null,
        };

        if (
            update.isOpen ===
            null
        ) {
            next.isOpenOverride =
                null;
        } else {
            delete next
                .isOpenOverride;
        }

        extras[key] =
            next;

        saveExtras(extras);

        const buildings =
            await getApiBuildings();

        const result =
            mergeEntrance(
                saved,
                buildings
            );

        if (!result) {
            throw new Error(
                'Nie znaleziono pozycji wejścia na mapie.'
            );
        }

        return result;
    },
};