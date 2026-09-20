import type {User} from '../types/User';

export const users: User[] = [
    {
        id: 1,
        name: 'Administrator',
        email: 'admin@wsg.pl',
        role: 'Admin',
        isActive: true,
        assignedBuildingIds: [],
        createdAt: null,
        updatedAt: null,
    },
    {
        id: 2,
        name: 'Cezary Kowalski',
        email: 'cezary@wsg.pl',
        role: 'Moderator',
        isActive: true,
        assignedBuildingIds: [2, 10],
        createdAt: null,
        updatedAt: null,
    },
];