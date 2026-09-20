export interface EntranceDto {
    id?: number | string;
    name?: string;
    isOpen?: boolean;
    buildingId: number | string;
}