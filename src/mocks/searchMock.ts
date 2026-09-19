import type {
    SearchResponse,
    SearchResult,
} from '../types/Search';

import {
    demoRooms,
} from './roomMock';


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


function normalizeRoomNumber(
    value: string
): string {

    return value.padStart(
        3,
        '0'
    );
}


function createResponse(
    items: SearchResult[]
): SearchResponse {

    return {
        items,

        page: 1,

        pageSize: 20,

        total:
        items.length,
    };
}


export async function mockSearchCampus(
    query: string
): Promise<SearchResponse> {

    await new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                250
            )
    );


    let normalized =
        query
            .trim()
            .replace(
                /\s+/g,
                ' '
            )
            .toUpperCase();


    normalized =
        normalized.replace(
            /^BUDYNEK\s+/,
            ''
        );


    /*
        B 005
        B005
        B-005
    */

    const buildingRoomMatch =
        normalized.match(
            /^([A-Z])[\s-]?(\d{1,3})$/
        );


    if (buildingRoomMatch) {

        const buildingCode =
            buildingRoomMatch[1];


        const roomNumber =
            normalizeRoomNumber(
                buildingRoomMatch[2]
            );


        const room =
            demoRooms.find(
                (item) =>
                    item.buildingCode ===
                    buildingCode &&
                    item.number ===
                    roomNumber
            );


        if (!room) {
            return createResponse([]);
        }


        return createResponse([
            {
                type:
                    'room',

                id:
                room.id,

                buildingId:
                room.buildingId,

                buildingCode:
                room.buildingCode,

                number:
                room.number,

                floor:
                room.floor,

                floorLabel:
                room.floorLabel,

                isDemo:
                    true,
            },
        ]);
    }


    /*
        005
        5
        101
    */

    if (
        /^\d{1,3}$/.test(
            normalized
        )
    ) {

        const roomNumber =
            normalizeRoomNumber(
                normalized
            );


        const items =
            demoRooms
                .filter(
                    (room) =>
                        room.number ===
                        roomNumber
                )
                .map(
                    (room):
                    SearchResult => ({

                        type:
                            'room',

                        id:
                        room.id,

                        buildingId:
                        room.buildingId,

                        buildingCode:
                        room.buildingCode,

                        number:
                        room.number,

                        floor:
                        room.floor,

                        floorLabel:
                        room.floorLabel,

                        isDemo:
                            true,
                    })
                );


        return createResponse(
            items
        );
    }


    /*
        A
        B
        C...
    */

    const buildingIndex =
        buildingCodes.indexOf(
            normalized
        );


    if (
        buildingIndex !== -1
    ) {

        const buildingId =
            buildingIndex + 1;


        return createResponse([
            {
                type:
                    'building',

                id:
                buildingId,

                buildingId,

                buildingCode:
                normalized,
            },
        ]);
    }


    return createResponse([]);
}