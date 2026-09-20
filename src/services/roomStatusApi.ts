export type RoomStatus =
    | 'free'
    | 'lecture'
    | 'closed';

export interface ActiveLecture {
    lecturerId: number;
    lecturerName: string;

    topic: string | null;

    startTime: string;
    endTime: string;

    startedAt: string;
}

export interface RoomStatusRecord {
    buildingId: number;
    roomNumber: string;

    status: RoomStatus;

    activeLecture: ActiveLecture | null;

    updatedAt: string | null;
    updatedBy: string | null;
}

const STORAGE_KEY =
    'campus-guide-room-statuses';

function readStatuses(): RoomStatusRecord[] {
    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {
        return [];
    }

    try {
        const parsed =
            JSON.parse(
                saved
            ) as RoomStatusRecord[];

        return parsed.map(
            (item) => ({
                ...item,

                activeLecture:
                    item.activeLecture ??
                    null,
            })
        );
    } catch {
        return [];
    }
}

function saveStatuses(
    statuses: RoomStatusRecord[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            statuses
        )
    );
}

function findRecord(
    statuses: RoomStatusRecord[],
    buildingId: number,
    roomNumber: string
) {
    return statuses.findIndex(
        (item) =>
            item.buildingId ===
            buildingId &&
            item.roomNumber ===
            roomNumber
    );
}

export function getDemoRoomStatus(
    roomNumber: string
): RoomStatus {
    const number =
        Number(
            roomNumber
        );

    if (
        number % 4 ===
        0
    ) {
        return 'lecture';
    }

    if (
        number % 5 ===
        0
    ) {
        return 'closed';
    }

    return 'free';
}

export const roomStatusApi = {
    async getAll():
        Promise<RoomStatusRecord[]> {

        return readStatuses();
    },

    async setStatus(
        buildingId: number,
        roomNumber: string,
        status: 'free' | 'closed',
        updatedBy: string,
        userId: number,
        isAdmin: boolean
    ): Promise<RoomStatusRecord> {

        const statuses =
            readStatuses();

        const index =
            findRecord(
                statuses,
                buildingId,
                roomNumber
            );

        const existing =
            index === -1
                ? null
                : statuses[index];

        if (
            existing?.activeLecture &&
            existing
                .activeLecture
                .lecturerId !==
            userId &&
            !isAdmin
        ) {
            throw new Error(
                'ROOM_OCCUPIED'
            );
        }

        const updated:
            RoomStatusRecord = {
            buildingId,
            roomNumber,

            status,

            activeLecture: null,

            updatedAt:
                new Date()
                    .toISOString(),

            updatedBy,
        };

        if (
            index === -1
        ) {
            statuses.push(
                updated
            );
        } else {
            statuses[index] =
                updated;
        }

        saveStatuses(
            statuses
        );

        return updated;
    },

    async startLecture(
        buildingId: number,
        roomNumber: string,
        lecturerId: number,
        lecturerName: string,
        topic: string,
        startTime: string,
        endTime: string
    ): Promise<RoomStatusRecord> {

        const statuses =
            readStatuses();

        const index =
            findRecord(
                statuses,
                buildingId,
                roomNumber
            );

        const existing =
            index === -1
                ? null
                : statuses[index];

        if (
            existing
                ?.activeLecture &&
            existing
                .activeLecture
                .lecturerId !==
            lecturerId
        ) {
            throw new Error(
                'ROOM_OCCUPIED'
            );
        }

        if (
            !startTime ||
            !endTime
        ) {
            throw new Error(
                'LECTURE_TIME_REQUIRED'
            );
        }

        if (
            startTime >=
            endTime
        ) {
            throw new Error(
                'INVALID_LECTURE_TIME'
            );
        }

        const now =
            new Date()
                .toISOString();

        const updated:
            RoomStatusRecord = {
            buildingId,
            roomNumber,

            status:
                'lecture',

            activeLecture: {
                lecturerId,
                lecturerName,

                topic:
                    topic.trim() ||
                    null,

                startTime,
                endTime,

                startedAt:
                now,
            },

            updatedAt:
            now,

            updatedBy:
            lecturerName,
        };

        if (
            index === -1
        ) {
            statuses.push(
                updated
            );
        } else {
            statuses[index] =
                updated;
        }

        saveStatuses(
            statuses
        );

        return updated;
    },

    async endLecture(
        buildingId: number,
        roomNumber: string,
        userId: number,
        userName: string,
        isAdmin: boolean
    ): Promise<RoomStatusRecord> {

        const statuses =
            readStatuses();

        const index =
            findRecord(
                statuses,
                buildingId,
                roomNumber
            );

        if (
            index === -1
        ) {
            throw new Error(
                'ROOM_NOT_FOUND'
            );
        }

        const existing =
            statuses[index];

        if (
            existing
                .activeLecture &&
            existing
                .activeLecture
                .lecturerId !==
            userId &&
            !isAdmin
        ) {
            throw new Error(
                'NOT_LECTURE_OWNER'
            );
        }

        const updated:
            RoomStatusRecord = {
            ...existing,

            status:
                'free',

            activeLecture:
                null,

            updatedAt:
                new Date()
                    .toISOString(),

            updatedBy:
            userName,
        };

        statuses[index] =
            updated;

        saveStatuses(
            statuses
        );

        return updated;
    },
};