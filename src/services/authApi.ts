import { userApi } from './userApi';

import type {
    User,
} from '../types/User';

const STORAGE_KEY =
    'campus-guide-current-user-id';

export const authApi = {
    async login(
        userId: number
    ): Promise<User> {
        const users =
            await userApi.getAll();

        const user =
            users.find(
                (item) =>
                    item.id === userId
            );

        if (
            !user ||
            !user.isActive
        ) {
            throw new Error(
                'USER_NOT_AVAILABLE'
            );
        }

        localStorage.setItem(
            STORAGE_KEY,
            String(user.id)
        );

        return user;
    },

    async getCurrentUser():
        Promise<User | null> {

        const savedId =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!savedId) {
            return null;
        }

        const userId =
            Number(savedId);

        if (
            Number.isNaN(userId)
        ) {
            localStorage.removeItem(
                STORAGE_KEY
            );

            return null;
        }

        const users =
            await userApi.getAll();

        const user =
            users.find(
                (item) =>
                    item.id === userId
            );

        if (
            !user ||
            !user.isActive
        ) {
            localStorage.removeItem(
                STORAGE_KEY
            );

            return null;
        }

        return user;
    },

    async logout() {
        localStorage.removeItem(
            STORAGE_KEY
        );
    },
};