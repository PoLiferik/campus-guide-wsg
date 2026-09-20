const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        let message = `HTTP ${response.status}`;

        try {
            const text = await response.text();

            if (text) {
                try {
                    const data = JSON.parse(text);
                    message = data.detail ?? data.title ?? data.message ?? message;
                } catch {
                    message = text;
                }
            }
        } catch {
            // Brak treści błędu
        }

        throw new ApiError(response.status, message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();

    if (!text) {
        return undefined as T;
    }

    return JSON.parse(text) as T;
}

export function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return request<T>(`${API_BASE_URL}${endpoint}`, options);
}

export function backendRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return request<T>(endpoint, options);
}