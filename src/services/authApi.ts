import type { User } from '../types/User';
import { userApi } from './userApi';

const CURRENT_USER_KEY =
    'campus-guide-current-user-id';

export const authApi = {
    async login(
        userId: number
    ): Promise<User> {
        const user =
            await userApi.getById(
                userId
            );
        if (!user.isActive) {
            throw new Error(
                'USER_BLOCKED'
            );
        }
        localStorage.setItem(
            CURRENT_USER_KEY,
            String(user.id)
        );
        return user;
    },
    async getCurrentUser():
        Promise<User | null> {
        const saved =
            localStorage.getItem(
                CURRENT_USER_KEY
            );
        if (!saved) {
            return null;
        }
        const userId =
            Number(saved);
        if (
            Number.isNaN(userId)
        ) {
            localStorage.removeItem(
                CURRENT_USER_KEY
            );
            return null;
        }
        try {
            const user =
                await userApi.getById(
                    userId
                );
            if (!user.isActive) {
                localStorage.removeItem(
                    CURRENT_USER_KEY
                );
                return null;
            }
            return user;
        } catch {
            localStorage.removeItem(
                CURRENT_USER_KEY
            );
            return null;
        }
    },
    async logout():
        Promise<void> {
        localStorage.removeItem(
            CURRENT_USER_KEY
        );
    },
};