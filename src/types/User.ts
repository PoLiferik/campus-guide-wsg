export type UserRole =
    | 'admin'
    | 'lecturer';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    assignedBuildingIds: number[];
    createdAt?: string | null;
    updatedAt?: string | null;
}