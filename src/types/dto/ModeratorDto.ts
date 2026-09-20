export interface ModeratorDto {
    id?: number | string;
    username?: string;
    name?: string;
    surname?: string;
    roleId?: number | string;
    buildingIds?: Array<number | string>;
}