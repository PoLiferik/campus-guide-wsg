import { apiRequest } from './apiClient';
import { userApi } from './userApi';
import type { LoginDto } from '../types/dto/LoginDto';
import type { User } from '../types/User';

const SESSION_KEY = 'campus-guide-current-staff-user';

function saveSession(user: User) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function readSession(): User | null {
    const saved = localStorage.getItem(SESSION_KEY);

    if (!saved) return null;

    try {
        return JSON.parse(saved) as User;
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}

export const authApi = {
    async login(username: string, password: string): Promise<User> {
        const payload: LoginDto = {
            username: username.trim(),
            password,
        };

        await apiRequest<unknown>('/Moderators/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const user = await userApi.getByUsername(username.trim());

        saveSession(user);
        return user;
    },

    async getCurrentUser(): Promise<User | null> {
        const session = readSession();
        if (!session) return null;
        try {
            const user = await userApi.getByUsername(session.email);
            saveSession(user);
            return user;
        } catch {
            return session;
        }
    },

    async logout(): Promise<void> {
        localStorage.removeItem(SESSION_KEY);
    },
};