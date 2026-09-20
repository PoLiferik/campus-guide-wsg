import { apiRequest, backendRequest } from './apiClient';
import { buildings as mapBuildings } from '../mocks/buildings';
import type { BuildingDto } from '../types/dto/BuildingDto';
import type { ModeratorDto } from '../types/dto/ModeratorDto';
import type { RegisterDto } from '../types/dto/RegisterDto';
import type { RoleDto } from '../types/dto/RoleDto';
import type { User, UserRole } from '../types/User';

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive?: boolean;
    assignedBuildingIds: number[];
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    role?: UserRole;
    assignedBuildingIds?: number[];
}

function toNumber(value: number | string | undefined): number | null {
    if (value === undefined || value === null) return null;

    const result = Number(value);
    return Number.isFinite(result) ? result : null;
}

function splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    return {
        name: parts.shift() ?? '',
        surname: parts.join(' ') || '-',
    };
}

function roleNameToUserRole(roleName?: string): UserRole {
    return roleName?.trim().toLowerCase() === 'admin' ? 'Admin' : 'Moderator';
}

async function getRoles(): Promise<RoleDto[]> {
    return (await apiRequest<RoleDto[] | undefined>('/Roles')) ?? [];
}

async function getBackendBuildings(): Promise<BuildingDto[]> {
    return (await apiRequest<BuildingDto[] | undefined>('/Buildings')) ?? [];
}

async function getContext() {
    const [roles, backendBuildings] = await Promise.all([
        getRoles(),
        getBackendBuildings(),
    ]);

    return { roles, backendBuildings };
}

function getRoleName(roleId: number | string | undefined, roles: RoleDto[]) {
    const id = toNumber(roleId);
    return roles.find((role) => toNumber(role.id) === id)?.name;
}

function resolveRoleId(role: UserRole, roles: RoleDto[]): number {
    const found = roles.find(
        (item) => item.name?.trim().toLowerCase() === role.toLowerCase()
    );

    const id = toNumber(found?.id);

    if (id === null) {
        throw new Error(`ROLE_NOT_FOUND:${role}`);
    }

    return id;
}

function backendBuildingIdsToLocal(
    backendIds: Array<number | string>,
    backendBuildings: BuildingDto[]
): number[] {
    return backendIds
        .map((backendId) => {
            const backendBuilding = backendBuildings.find(
                (building) => toNumber(building.id) === Number(backendId)
            );

            if (!backendBuilding?.name) return null;

            const localBuilding = mapBuildings.find(
                (building) =>
                    building.code.toUpperCase() === backendBuilding.name?.trim().toUpperCase()
            );

            return localBuilding?.id ?? null;
        })
        .filter((id): id is number => id !== null);
}

function localBuildingIdsToBackend(
    localIds: number[],
    backendBuildings: BuildingDto[]
): number[] {
    return localIds
        .map((localId) => {
            const localBuilding = mapBuildings.find((building) => building.id === localId);

            if (!localBuilding) return null;

            const backendBuilding = backendBuildings.find(
                (building) =>
                    building.name?.trim().toUpperCase() === localBuilding.code.toUpperCase()
            );

            return toNumber(backendBuilding?.id);
        })
        .filter((id): id is number => id !== null);
}

function moderatorToUser(
    moderator: ModeratorDto,
    roles: RoleDto[],
    backendBuildings: BuildingDto[]
): User {
    const id = toNumber(moderator.id);

    if (id === null) {
        throw new Error('INVALID_MODERATOR_ID');
    }

    const fullName = [moderator.name, moderator.surname]
        .filter((value) => value && value !== '-')
        .join(' ')
        .trim();

    return {
        id,
        name: fullName || moderator.username || `Moderator ${id}`,
        email: moderator.username ?? '',
        role: roleNameToUserRole(getRoleName(moderator.roleId, roles)),
        isActive: true,
        assignedBuildingIds: backendBuildingIdsToLocal(
            moderator.buildingIds ?? [],
            backendBuildings
        ),
        createdAt: null,
        updatedAt: null,
    };
}

async function addBuilding(moderatorId: number, buildingId: number): Promise<void> {
    await backendRequest<unknown>(
        `/add-building?moderatorId=${moderatorId}&buildingId=${buildingId}`,
        { method: 'POST' }
    );
}

async function removeBuilding(moderatorId: number, buildingId: number): Promise<void> {
    await backendRequest<unknown>(
        `/remove-building?moderatorId=${moderatorId}&buildingId=${buildingId}`,
        { method: 'POST' }
    );
}

async function syncBuildings(
    moderatorId: number,
    currentBuildingIds: number[],
    targetBuildingIds: number[]
): Promise<void> {
    const toRemove = currentBuildingIds.filter(
        (id) => !targetBuildingIds.includes(id)
    );

    const toAdd = targetBuildingIds.filter(
        (id) => !currentBuildingIds.includes(id)
    );

    for (const buildingId of toRemove) {
        await removeBuilding(moderatorId, buildingId);
    }

    for (const buildingId of toAdd) {
        await addBuilding(moderatorId, buildingId);
    }
}

async function getUserById(id: number): Promise<User> {
    const [moderator, context] = await Promise.all([
        apiRequest<ModeratorDto>(`/Moderators/${id}`),
        getContext(),
    ]);

    return moderatorToUser(
        moderator,
        context.roles,
        context.backendBuildings
    );
}

export const userApi = {
    async getAll(): Promise<User[]> {
        const [moderators, context] = await Promise.all([
            apiRequest<ModeratorDto[] | undefined>('/Moderators'),
            getContext(),
        ]);

        return (moderators ?? []).map((moderator) =>
            moderatorToUser(
                moderator,
                context.roles,
                context.backendBuildings
            )
        );
    },

    async getById(id: number): Promise<User> {
        return getUserById(id);
    },

    async getByUsername(username: string): Promise<User> {
        const [moderator, context] = await Promise.all([
            apiRequest<ModeratorDto>(
                `/Moderators/username/${encodeURIComponent(username)}`
            ),
            getContext(),
        ]);

        return moderatorToUser(
            moderator,
            context.roles,
            context.backendBuildings
        );
    },

    async create(data: CreateUserInput): Promise<User> {
        const username = data.email.trim();

        if (username.length < 1) {
            throw new Error('USERNAME_REQUIRED');
        }

        if (data.password.length < 8) {
            throw new Error('PASSWORD_REQUIRED');
        }

        const { name, surname } = splitFullName(data.name);

        if (!name || !surname) {
            throw new Error('NAME_REQUIRED');
        }

        const context = await getContext();

        const registerPayload: RegisterDto = {
            username,
            name,
            surname,
            password: data.password,
        };

        await apiRequest<unknown>('/Moderators/register', {
            method: 'POST',
            body: JSON.stringify(registerPayload),
        });

        const created = await apiRequest<ModeratorDto>(
            `/Moderators/username/${encodeURIComponent(username)}`
        );

        const moderatorId = toNumber(created.id);

        if (moderatorId === null) {
            throw new Error('INVALID_MODERATOR_ID');
        }

        const roleId = resolveRoleId(data.role, context.roles);

        const moderatorPayload: ModeratorDto = {
            id: created.id,
            username: created.username ?? username,
            name: created.name ?? name,
            surname: created.surname ?? surname,
            roleId,
            buildingIds: created.buildingIds ?? [],
        };

        await apiRequest<unknown>(`/Moderators/${moderatorId}`, {
            method: 'PUT',
            body: JSON.stringify(moderatorPayload),
        });

        if (data.role === 'Moderator') {
            const buildingIds = localBuildingIdsToBackend(
                data.assignedBuildingIds,
                context.backendBuildings
            );

            await syncBuildings(moderatorId, [], buildingIds);
        }

        return getUserById(moderatorId);
    },

    async update(id: number, data: UpdateUserInput): Promise<User> {
        const [current, context] = await Promise.all([
            apiRequest<ModeratorDto>(`/Moderators/${id}`),
            getContext(),
        ]);

        const currentRole = roleNameToUserRole(
            getRoleName(current.roleId, context.roles)
        );

        const targetRole = data.role ?? currentRole;

        const currentBuildingIds = (current.buildingIds ?? [])
            .map(Number)
            .filter(Number.isFinite);

        const targetBuildingIds =
            targetRole === 'Admin'
                ? []
                : data.assignedBuildingIds !== undefined
                    ? localBuildingIdsToBackend(
                        data.assignedBuildingIds,
                        context.backendBuildings
                    )
                    : currentBuildingIds;

        if (targetRole === 'Admin' && currentBuildingIds.length > 0) {
            await syncBuildings(id, currentBuildingIds, []);
        }

        let name = current.name ?? '';
        let surname = current.surname ?? '-';

        if (data.name !== undefined) {
            const split = splitFullName(data.name);
            name = split.name;
            surname = split.surname;
        }

        const username = data.email?.trim() || current.username || '';
        const roleId = resolveRoleId(targetRole, context.roles);

        const payload: ModeratorDto = {
            id: current.id ?? id,
            username,
            name,
            surname,
            roleId,
            buildingIds: targetRole === 'Admin'
                ? []
                : current.buildingIds ?? [],
        };

        await apiRequest<unknown>(`/Moderators/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        if (targetRole === 'Moderator') {
            const fresh = await apiRequest<ModeratorDto>(`/Moderators/${id}`);

            const freshBuildingIds = (fresh.buildingIds ?? [])
                .map(Number)
                .filter(Number.isFinite);

            await syncBuildings(
                id,
                freshBuildingIds,
                targetBuildingIds
            );
        }

        return getUserById(id);
    },

    async delete(id: number): Promise<void> {
        const user = await getUserById(id);

        if (user.role === 'Admin') {
            throw new Error('ADMIN_DELETE_BLOCKED');
        }

        await apiRequest<void>(`/Moderators/${id}`, {
            method: 'DELETE',
        });
    },
};