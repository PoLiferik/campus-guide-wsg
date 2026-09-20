import type {RoomDetails} from '../types/Room';
import {entrances} from './entrances';


interface DemoRoom {
    id: number;
    buildingId: number;
    buildingCode: string;
    number: string;
    floor: number;
    floorLabel: string;
}
const buildingCodes = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'G',
    'H',
    'K',
    'L',
    'M',
];


export const demoRooms: DemoRoom[] = [];


buildingCodes.forEach(
    (buildingCode, buildingIndex) =>
    {
        const buildingId = buildingIndex + 1;
        for (let floor = 0; floor <= 2; floor++)
        {
            for (let roomIndex = 1; roomIndex <= 8; roomIndex++)
            {
                const number = `${floor}${roomIndex.toString().padStart(2, '0')}`;
                demoRooms.push({
                    id: buildingId * 10000 + Number(number),
                    buildingId,
                    buildingCode,
                    number,
                    floor,

                    floorLabel: floor === 0 ? 'Parter' : `${floor} piętro`,
                });
            }
        }
    }
);


// DEMO:
// только некоторые аудитории имеют
// рекомендуемый вход
function getRecommendedEntranceId(
    buildingCode: string,
    roomNumber: string
): number | null {

    if (
        buildingCode === 'B' &&
        roomNumber === '005'
    ) {
        return 1; // B-1
    }


    if (
        buildingCode === 'A' &&
        roomNumber === '103'
    ) {
        return 4; // A-1
    }


    if (
        buildingCode === 'G' &&
        roomNumber === '201'
    ) {
        return 6; // G-1
    }


    return null;
}


export async function mockGetRoom(
    roomId: number
): Promise<RoomDetails> {

    await new Promise(
        (resolve) =>
            setTimeout(resolve, 200)
    );


    const room =
        demoRooms.find(
            (item) =>
                item.id === roomId
        );


    if (!room) {
        throw new Error(
            'Room not found'
        );
    }


    const buildingEntrances =
        entrances.filter(
            (entrance) =>
                entrance.buildingId ===
                room.buildingId
        );


    const recommendedEntranceId =
        getRecommendedEntranceId(
            room.buildingCode,
            room.number
        );


    return {

        id:
        room.id,

        number:
        room.number,

        floor:
        room.floor,

        floorLabel:
        room.floorLabel,

        building: {
            id:
            room.buildingId,

            code:
            room.buildingCode,
        },

        directions:
            recommendedEntranceId
                ? 'Skorzystaj z zalecanego wejścia oznaczonego na mapie.'
                : null,

        isDemo:
            true,

        entrances:
        buildingEntrances,

        recommendedEntranceId,
    };
}