export type EntranceAccessibility =
    | 'unknown'
    | 'step_free'
    | 'stairs_only';
export type EntranceVerificationStatus =
    | 'unverified'
    | 'verified';
export interface Entrance {
    id: number;
    buildingId: number;
    code: string;

    x: number;
    y: number;

    description: string | null;
    accessibility: EntranceAccessibility;
    verificationStatus: EntranceVerificationStatus;
    isOpen: boolean | null;
    openFrom: string | null;
    openUntil: string | null;
    updatedAt?: string | null;
    updatedBy?: string | null;
}