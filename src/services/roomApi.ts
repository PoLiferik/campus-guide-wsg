import {apiRequest} from './apiClient';
import type {RoomDto} from '../types/dto/RoomDto';

export const roomApi = {
    async getAll(): Promise<RoomDto[]> {
        return (await apiRequest<RoomDto[] | undefined>('/Rooms')) ?? [];
    },

    async create(number: string, buildingId: number): Promise<RoomDto> {
        return apiRequest<RoomDto>('/Rooms', {
            method: 'POST',
            body: JSON.stringify({
                number: number.trim().padStart(3, '0'),
                buildingId,
            }),
        });
    },

    async update(id: number, number: string, buildingId: number): Promise<RoomDto> {
        return apiRequest<RoomDto>(`/Rooms/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                id,
                number: number.trim().padStart(3, '0'),
                buildingId,
            }),
        });
    },

    async delete(id: number): Promise<void> {
        await apiRequest<void>(`/Rooms/${id}`, {
            method: 'DELETE',
        });
    },
};