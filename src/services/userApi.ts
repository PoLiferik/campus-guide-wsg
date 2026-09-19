import type {
    User,
    UserRole,
} from '../types/User';

import {
    users,
} from '../mocks/users';

const STORAGE_KEY =
    'campus-guide-users';

export interface SaveUserRequest {
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    assignedBuildingIds: number[];
}

function readUsers(): User[] {
    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {
        const initial =
            users.map(
                (user) => ({
                    ...user,
                    assignedBuildingIds: [
                        ...user.assignedBuildingIds,
                    ],
                })
            );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(initial)
        );

        return initial;
    }

    try {
        return JSON.parse(
            saved
        ) as User[];
    } catch {
        return users;
    }
}

function saveUsers(
    data: User[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

export const userApi = {
    async getAll():
        Promise<User[]> {

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    100
                )
        );

        return readUsers();
    },

    async getById(
        userId: number
    ): Promise<User> {

        const data =
            readUsers();

        const user =
            data.find(
                (item) =>
                    item.id ===
                    userId
            );

        if (!user) {
            throw new Error(
                'User not found'
            );
        }

        return user;
    },

    async create(
        request:
        SaveUserRequest
    ): Promise<User> {

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    200
                )
        );

        const data =
            readUsers();

        const emailExists =
            data.some(
                (user) =>
                    user.email
                        .toLowerCase() ===
                    request.email
                        .toLowerCase()
            );

        if (emailExists) {
            throw new Error(
                'EMAIL_EXISTS'
            );
        }

        const newId =
            data.length === 0
                ? 1
                : Math.max(
                ...data.map(
                    (user) =>
                        user.id
                )
            ) + 1;

        const created: User = {
            id: newId,
            ...request,
            assignedBuildingIds:
                request.role ===
                'admin'
                    ? []
                    : request
                        .assignedBuildingIds,
            createdAt:
                new Date()
                    .toISOString(),
            updatedAt:
                new Date()
                    .toISOString(),
        };
        data.push(
            created
        );
        saveUsers(
            data
        );
        return created;
    },
    async update(
        userId: number,
        request:
        SaveUserRequest
    ): Promise<User> {
        const data =
            readUsers();
        const index =
            data.findIndex(
                (user) =>
                    user.id ===
                    userId
            );
        if (index === -1) {
            throw new Error(
                'User not found'
            );
        }
        const emailExists =
            data.some(
                (user) =>
                    user.id !==
                    userId &&
                    user.email
                        .toLowerCase() ===
                    request.email
                        .toLowerCase()
            );
        if (emailExists) {
            throw new Error(
                'EMAIL_EXISTS'
            );
        }
        const updated: User = {
            ...data[index],
            ...request,
            assignedBuildingIds:
                request.role ===
                'admin'
                    ? []
                    : request
                        .assignedBuildingIds,
            updatedAt:
                new Date()
                    .toISOString(),
        };
        data[index] =
            updated;
        saveUsers(
            data
        );
        return updated;
    },
    async delete(
        userId: number
    ): Promise<void> {

        const data =
            readUsers();
        const user =
            data.find(
                (item) =>
                    item.id ===
                    userId
            );
        if (!user) {
            throw new Error(
                'User not found'
            );
        }
        if (
            user.role ===
            'admin'
        ) {
            throw new Error(
                'ADMIN_DELETE'
            );
        }
        saveUsers(
            data.filter(
                (item) =>
                    item.id !==
                    userId
            )
        );
    },
};