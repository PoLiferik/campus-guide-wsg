export interface SearchResult {
    type: 'building' | 'room';
    id: number;
    buildingId: number;
    buildingCode: string;
    number?: string;
    floor?: number;
    floorLabel?: string;
    isDemo?: boolean;
}

export interface SearchResponse {
    items: SearchResult[];
    page: number;
    pageSize: number;
    total: number;
}