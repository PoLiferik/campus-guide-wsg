import { apiRequest } from './apiClient';
import type { EntranceDto } from '../types/dto/EntranceDto';

export const entranceAdminApi = {
    async getAll(): Promise<EntranceDto[]> {
        return (await apiRequest<EntranceDto[] | undefined>('/Entrances')) ?? [];
    },

    async getById(id: number): Promise<EntranceDto> {
        return apiRequest<EntranceDto>(`/Entrances/${id}`);
    },

    async create(name: string, buildingId: number, isOpen: boolean): Promise<EntranceDto> {
        return apiRequest<EntranceDto>('/Entrances', {
            method: 'POST',
            body: JSON.stringify({
                name: name.trim().toUpperCase(),
                isOpen,
                buildingId,
            }),
        });
    },

    async update(id: number, name: string, buildingId: number, isOpen: boolean): Promise<EntranceDto> {
        return apiRequest<EntranceDto>(`/Entrances/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                id,
                name: name.trim().toUpperCase(),
                isOpen,
                buildingId,
            }),
        });
    },

    async delete(id: number): Promise<void> {
        await apiRequest<void>(`/Entrances/${id}`, {
            method: 'DELETE',
        });
    },
};