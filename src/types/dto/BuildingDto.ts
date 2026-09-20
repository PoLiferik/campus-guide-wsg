export interface BuildingDto {
    id?: number | string;
    name?: string;
    moderatorIds?: Array<number | string>;
    entranceIds?: Array<number | string>;
    roomIds?: Array<number | string>;
}