import type {
    SearchResponse,
} from '../types/Search';

import type {
    RoomDetails,
} from '../types/Room';

import {
    mockSearchCampus,
} from '../mocks/searchMock';

import {
    mockGetRoom,
} from '../mocks/roomMock';


const API_URL =
    import.meta.env
        .VITE_API_BASE_URL;


const USE_MOCK_API =
    import.meta.env
        .VITE_USE_MOCK_API ===
    'true';


async function realSearchCampus(
    query: string
): Promise<SearchResponse> {

    const response =
        await fetch(

            `${API_URL}/search?q=${encodeURIComponent(
                query
            )}`

        );


    if (!response.ok) {

        throw new Error(
            `API error: ${response.status}`
        );
    }


    return response.json();
}


async function realGetRoom(
    roomId: number
): Promise<RoomDetails> {

    const response =
        await fetch(
            `${API_URL}/rooms/${roomId}`
        );


    if (!response.ok) {

        throw new Error(
            `API error: ${response.status}`
        );
    }


    return response.json();
}


export const campusApi = {

    search(
        query: string
    ): Promise<SearchResponse> {

        if (USE_MOCK_API) {

            return mockSearchCampus(
                query
            );
        }


        return realSearchCampus(
            query
        );
    },


    getRoom(
        roomId: number
    ): Promise<RoomDetails> {

        if (USE_MOCK_API) {

            return mockGetRoom(
                roomId
            );
        }


        return realGetRoom(
            roomId
        );
    },

};