import {apiRequest} from './apiClient';
import type {BuildingDto} from '../types/dto/BuildingDto';

export const buildingApi = {
    async getAll(): Promise<BuildingDto[]> {
        return (await apiRequest<BuildingDto[] | undefined>('/Buildings')) ?? [];
    },

    async create(name: string): Promise<BuildingDto> {
        return apiRequest<BuildingDto>('/Buildings', {
            method: 'POST',
            body: JSON.stringify({
                name: name.trim().toUpperCase(),
                moderatorIds: [],
                entranceIds: [],
                roomIds: [],
            }),
        });
    },

    async update(id: number, name: string): Promise<BuildingDto> {
        const current = await apiRequest<BuildingDto>(`/Buildings/${id}`);

        return apiRequest<BuildingDto>(`/Buildings/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...current,
                id,
                name: name.trim().toUpperCase(),
            }),
        });
    },

    async delete(id: number): Promise<void> {
        await apiRequest<void>(`/Buildings/${id}`, {
            method: 'DELETE',
        });
    },
};