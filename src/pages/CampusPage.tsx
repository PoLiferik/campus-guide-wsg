import { useEffect, useState } from 'react';

import CampusMap from '../components/CampusMap/CampusMap';
import SearchBar from '../components/SearchBar/SearchBar';
import SearchResults from '../components/SearchResults/SearchResults';

import { campusApi } from '../services/campusApi';
import { entranceApi } from '../services/entranceApi';
import { authApi } from '../services/authApi';

import {
    getDemoRoomStatus,
    roomStatusApi,
} from '../services/roomStatusApi';

import { buildings } from '../mocks/buildings';

import type { SearchResult } from '../types/Search';
import type { RoomDetails } from '../types/Room';
import type { Entrance } from '../types/Entrance';
import type { User } from '../types/User';

import type {
    RoomStatus,
    RoomStatusRecord,
} from '../services/roomStatusApi';

import './CampusPage.css';

interface FloorDefinition {
    floor: number;
    label: string;
    start: number;
}

const FLOORS: FloorDefinition[] = [
    {
        floor: 0,
        label: 'Parter',
        start: 1,
    },
    {
        floor: 1,
        label: '1 piętro',
        start: 101,
    },
    {
        floor: 2,
        label: '2 piętro',
        start: 201,
    },
];

function getRoomStatusText(status: RoomStatus) {
    switch (status) {
        case 'lecture':
            return 'Trwa wykład';

        case 'closed':
            return 'Zamknięta';

        case 'free':
        default:
            return 'Wolna';
    }
}

function CampusPage() {
    const [selectedBuildingId, setSelectedBuildingId] =
        useState<number | null>(null);

    const [selectedResult, setSelectedResult] =
        useState<SearchResult | null>(null);

    const [roomDetails, setRoomDetails] =
        useState<RoomDetails | null>(null);

    const [searchResults, setSearchResults] =
        useState<SearchResult[]>([]);

    const [allEntrances, setAllEntrances] =
        useState<Entrance[]>([]);

    const [roomStatuses, setRoomStatuses] =
        useState<RoomStatusRecord[]>([]);

    const [currentUser, setCurrentUser] =
        useState<User | null>(null);

    const [openFloor, setOpenFloor] =
        useState<number | null>(null);

    const [menuVisible, setMenuVisible] =
        useState(true);

    const [lectureFormOpen, setLectureFormOpen] =
        useState(false);

    const [lectureTopic, setLectureTopic] =
        useState('');

    const [lectureStartTime, setLectureStartTime] =
        useState('');

    const [lectureEndTime, setLectureEndTime] =
        useState('');

    const [roomActionError, setRoomActionError] =
        useState<string | null>(null);

    const [changingRoom, setChangingRoom] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [searched, setSearched] =
        useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [entrances, statuses, user] =
                    await Promise.all([
                        entranceApi.getAll(),
                        roomStatusApi.getAll(),
                        authApi.getCurrentUser(),
                    ]);

                setAllEntrances(entrances);
                setRoomStatuses(statuses);
                setCurrentUser(user);
            } catch (error) {
                console.error(
                    'Nie udało się pobrać danych:',
                    error
                );
            }
        }

        void loadData();
    }, []);

    const selectedBuilding =
        selectedBuildingId === null
            ? null
            : buildings.find(
            (building) =>
                building.id ===
                selectedBuildingId
        ) ?? null;

    function resetLectureForm() {
        setLectureFormOpen(false);
        setLectureTopic('');
        setLectureStartTime('');
        setLectureEndTime('');
        setRoomActionError(null);
    }

    function canManageBuilding(buildingId: number) {
        if (!currentUser) {
            return false;
        }

        if (currentUser.role === 'admin') {
            return true;
        }

        return (
            currentUser.role === 'lecturer' &&
            currentUser.assignedBuildingIds.includes(
                buildingId
            )
        );
    }

    function getRoomRecord(
        buildingId: number,
        roomNumber: string
    ) {
        return roomStatuses.find(
            (item) =>
                item.buildingId === buildingId &&
                item.roomNumber === roomNumber
        );
    }

    function getRoomStatus(
        buildingId: number,
        roomNumber: string
    ): RoomStatus {
        return (
            getRoomRecord(
                buildingId,
                roomNumber
            )?.status ??
            getDemoRoomStatus(roomNumber)
        );
    }

    function updateRoomRecord(
        updated: RoomStatusRecord
    ) {
        setRoomStatuses((current) => {
            const exists =
                current.some(
                    (item) =>
                        item.buildingId ===
                        updated.buildingId &&
                        item.roomNumber ===
                        updated.roomNumber
                );

            if (!exists) {
                return [
                    ...current,
                    updated,
                ];
            }

            return current.map(
                (item) =>
                    item.buildingId ===
                    updated.buildingId &&
                    item.roomNumber ===
                    updated.roomNumber
                        ? updated
                        : item
            );
        });
    }

    async function handleSearch(query: string) {
        try {
            setLoading(true);
            setError(null);
            setSearched(false);

            setSelectedBuildingId(null);
            setSelectedResult(null);
            setRoomDetails(null);
            setSearchResults([]);
            setOpenFloor(null);

            resetLectureForm();

            const response =
                await campusApi.search(query);

            setSearchResults(
                response.items
            );

            setSearched(true);
        } catch (error) {
            console.error(error);

            setSearchResults([]);
            setSearched(true);

            setError(
                'Nie można pobrać danych. Spróbuj ponownie.'
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleResultSelect(
        result: SearchResult
    ) {
        setSelectedBuildingId(
            result.buildingId
        );

        setSelectedResult(result);

        setSearchResults([]);
        setSearched(false);
        setRoomDetails(null);

        resetLectureForm();

        if (
            result.type === 'room' &&
            result.floor !== undefined
        ) {
            setOpenFloor(
                result.floor
            );
        }

        if (result.type === 'room') {
            try {
                const details =
                    await campusApi.getRoom(
                        result.id
                    );

                setRoomDetails(details);
            } catch (error) {
                console.error(error);
            }
        }
    }

    function handleBuildingSelect(
        buildingId: number | null
    ) {
        setRoomDetails(null);
        setSearchResults([]);
        setSearched(false);
        setOpenFloor(null);

        resetLectureForm();

        if (buildingId === null) {
            setSelectedBuildingId(null);
            setSelectedResult(null);
            return;
        }

        const building =
            buildings.find(
                (item) =>
                    item.id === buildingId
            );

        if (!building) {
            return;
        }

        setSelectedBuildingId(
            building.id
        );

        setSelectedResult({
            type: 'building',
            id: building.id,
            buildingId: building.id,
            buildingCode:
            building.code,
        });
    }

    function handleFloorToggle(
        floor: number
    ) {
        setOpenFloor(
            (current) =>
                current === floor
                    ? null
                    : floor
        );
    }

    function handleRoomSelect(
        floorDefinition: FloorDefinition,
        index: number
    ) {
        if (!selectedBuilding) {
            return;
        }

        const roomNumber =
            String(
                floorDefinition.start +
                index
            ).padStart(3, '0');

        const roomId =
            selectedBuilding.id *
            10000 +
            Number(roomNumber);

        const result: SearchResult = {
            type: 'room',
            id: roomId,

            buildingId:
            selectedBuilding.id,

            buildingCode:
            selectedBuilding.code,

            number:
            roomNumber,

            floor:
            floorDefinition.floor,

            floorLabel:
            floorDefinition.label,

            isDemo: true,
        };

        void handleResultSelect(result);
    }

    async function handleSimpleStatus(
        roomNumber: string,
        status: 'free' | 'closed'
    ) {
        if (
            !selectedBuilding ||
            !currentUser
        ) {
            return;
        }

        try {
            setChangingRoom(true);
            setRoomActionError(null);

            const updated =
                await roomStatusApi.setStatus(
                    selectedBuilding.id,
                    roomNumber,
                    status,
                    currentUser.name,
                    currentUser.id,
                    currentUser.role ===
                    'admin'
                );

            updateRoomRecord(updated);
            resetLectureForm();
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                'ROOM_OCCUPIED'
            ) {
                setRoomActionError(
                    'Ta sala jest obecnie zajęta przez innego prowadzącego.'
                );
            } else {
                console.error(error);

                setRoomActionError(
                    'Nie udało się zmienić statusu sali.'
                );
            }
        } finally {
            setChangingRoom(false);
        }
    }

    async function handleStartLecture(
        roomNumber: string
    ) {
        if (
            !selectedBuilding ||
            !currentUser ||
            currentUser.role !==
            'lecturer'
        ) {
            return;
        }

        if (
            !lectureStartTime ||
            !lectureEndTime
        ) {
            setRoomActionError(
                'Podaj godzinę rozpoczęcia i zakończenia zajęć.'
            );

            return;
        }

        if (
            lectureStartTime >=
            lectureEndTime
        ) {
            setRoomActionError(
                'Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.'
            );

            return;
        }

        try {
            setChangingRoom(true);
            setRoomActionError(null);

            const updated =
                await roomStatusApi.startLecture(
                    selectedBuilding.id,
                    roomNumber,
                    currentUser.id,
                    currentUser.name,
                    lectureTopic,
                    lectureStartTime,
                    lectureEndTime
                );

            updateRoomRecord(updated);
            resetLectureForm();
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                'ROOM_OCCUPIED'
            ) {
                setRoomActionError(
                    'Inny wykładowca prowadzi już zajęcia w tej sali.'
                );
            } else if (
                error instanceof Error &&
                error.message ===
                'LECTURE_TIME_REQUIRED'
            ) {
                setRoomActionError(
                    'Podaj godzinę rozpoczęcia i zakończenia.'
                );
            } else if (
                error instanceof Error &&
                error.message ===
                'INVALID_LECTURE_TIME'
            ) {
                setRoomActionError(
                    'Nieprawidłowy zakres godzin.'
                );
            } else {
                console.error(error);

                setRoomActionError(
                    'Nie udało się rozpocząć zajęć.'
                );
            }
        } finally {
            setChangingRoom(false);
        }
    }

    async function handleEndLecture(
        roomNumber: string
    ) {
        if (
            !selectedBuilding ||
            !currentUser
        ) {
            return;
        }

        try {
            setChangingRoom(true);
            setRoomActionError(null);

            const updated =
                await roomStatusApi.endLecture(
                    selectedBuilding.id,
                    roomNumber,
                    currentUser.id,
                    currentUser.name,
                    currentUser.role ===
                    'admin'
                );

            updateRoomRecord(updated);
            resetLectureForm();
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                'NOT_LECTURE_OWNER'
            ) {
                setRoomActionError(
                    'Tylko prowadzący lub administrator może zakończyć te zajęcia.'
                );
            } else {
                console.error(error);

                setRoomActionError(
                    'Nie udało się zakończyć zajęć.'
                );
            }
        } finally {
            setChangingRoom(false);
        }
    }

    function closeRoomInfo() {
        if (!selectedBuilding) {
            return;
        }

        setSelectedResult({
            type: 'building',
            id: selectedBuilding.id,

            buildingId:
            selectedBuilding.id,

            buildingCode:
            selectedBuilding.code,
        });

        setRoomDetails(null);
        resetLectureForm();
    }

    return (
        <main className="campus-page">
            <CampusMap
                selectedBuildingId={
                    selectedBuildingId
                }
                recommendedEntranceId={
                    roomDetails
                        ?.recommendedEntranceId ??
                    null
                }
                entrances={
                    allEntrances
                }
                onBuildingSelect={
                    handleBuildingSelect
                }
            />

            {!menuVisible && (
                <button
                    type="button"
                    className="campus-menu-toggle"
                    onClick={() =>
                        setMenuVisible(true)
                    }
                >
                    ☰
                </button>
            )}

            {menuVisible && (
                <aside className="campus-menu">
                    <div className="campus-menu__header">
                        <div>
                            <span className="campus-menu__logo">
                                WSG
                            </span>

                            <h1>
                                Campus Guide
                            </h1>
                        </div>

                        <div className="campus-menu__header-actions">
                            {selectedBuilding && (
                                <span className="campus-menu__building-code">
                                    {
                                        selectedBuilding.code
                                    }
                                </span>
                            )}

                            <button
                                type="button"
                                className="campus-menu__hide"
                                onClick={() =>
                                    setMenuVisible(
                                        false
                                    )
                                }
                            >
                                —
                            </button>
                        </div>
                    </div>

                    <SearchBar
                        onSearch={
                            handleSearch
                        }
                    />

                    <SearchResults
                        results={
                            searchResults
                        }
                        loading={
                            loading
                        }
                        error={
                            error
                        }
                        searched={
                            searched
                        }
                        onSelect={
                            handleResultSelect
                        }
                    />

                    {selectedBuilding && (
                        <div className="campus-building-panel">
                            <div className="campus-building-panel__top">
                                <div>
                                    <span>
                                        Wybrany budynek
                                    </span>

                                    <strong>
                                        Budynek{' '}
                                        {
                                            selectedBuilding.code
                                        }
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleBuildingSelect(
                                            null
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </div>

                            <div className="room-status-legend">
                                <span>
                                    <i className="room-status-dot room-status-dot--free" />
                                    Wolna
                                </span>

                                <span>
                                    <i className="room-status-dot room-status-dot--lecture" />
                                    Trwa wykład
                                </span>

                                <span>
                                    <i className="room-status-dot room-status-dot--closed" />
                                    Zamknięta
                                </span>
                            </div>

                            <div className="floor-accordion">
                                {FLOORS.map(
                                    (
                                        floorDefinition
                                    ) => {
                                        const isOpen =
                                            openFloor ===
                                            floorDefinition.floor;

                                        const selectedRoomOnFloor =
                                            selectedResult?.type ===
                                            'room' &&
                                            selectedResult.floor ===
                                            floorDefinition.floor;

                                        return (
                                            <div
                                                key={
                                                    floorDefinition.floor
                                                }
                                                className={
                                                    isOpen
                                                        ? 'floor-accordion__item floor-accordion__item--open'
                                                        : 'floor-accordion__item'
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="floor-accordion__button"
                                                    onClick={() =>
                                                        handleFloorToggle(
                                                            floorDefinition.floor
                                                        )
                                                    }
                                                >
                                                    <div className="floor-accordion__floor">
                                                        {floorDefinition.floor ===
                                                        0
                                                            ? 'P'
                                                            : floorDefinition.floor}
                                                    </div>

                                                    <div className="floor-accordion__label">
                                                        <strong>
                                                            {
                                                                floorDefinition.label
                                                            }
                                                        </strong>

                                                        <span>
                                                            {floorDefinition.floor ===
                                                            0
                                                                ? '001–008'
                                                                : floorDefinition.floor ===
                                                                1
                                                                    ? '101–108'
                                                                    : '201–208'}
                                                        </span>
                                                    </div>

                                                    <span className="floor-accordion__arrow">
                                                        ›
                                                    </span>
                                                </button>

                                                <div className="floor-accordion__content">
                                                    <div className="floor-accordion__inner">
                                                        <div className="room-grid">
                                                            {Array.from(
                                                                {
                                                                    length: 8,
                                                                },
                                                                (
                                                                    _,
                                                                    index
                                                                ) => {
                                                                    const roomNumber =
                                                                        String(
                                                                            floorDefinition.start +
                                                                            index
                                                                        ).padStart(
                                                                            3,
                                                                            '0'
                                                                        );

                                                                    const status =
                                                                        getRoomStatus(
                                                                            selectedBuilding.id,
                                                                            roomNumber
                                                                        );

                                                                    const isSelected =
                                                                        selectedResult?.type ===
                                                                        'room' &&
                                                                        selectedResult.number ===
                                                                        roomNumber &&
                                                                        selectedResult.buildingId ===
                                                                        selectedBuilding.id;

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                roomNumber
                                                                            }
                                                                            type="button"
                                                                            className={[
                                                                                'room-button',
                                                                                `room-button--${status}`,
                                                                                isSelected
                                                                                    ? 'room-button--selected'
                                                                                    : '',
                                                                            ]
                                                                                .filter(
                                                                                    Boolean
                                                                                )
                                                                                .join(
                                                                                    ' '
                                                                                )}
                                                                            onClick={() =>
                                                                                handleRoomSelect(
                                                                                    floorDefinition,
                                                                                    index
                                                                                )
                                                                            }
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    roomNumber
                                                                                }
                                                                            </span>

                                                                            <span
                                                                                className={`room-button__dot room-button__dot--${status}`}
                                                                            />
                                                                        </button>
                                                                    );
                                                                }
                                                            )}
                                                        </div>

                                                        {selectedRoomOnFloor &&
                                                            selectedResult.number &&
                                                            (() => {
                                                                const roomNumber =
                                                                    selectedResult.number;

                                                                const roomStatus =
                                                                    getRoomStatus(
                                                                        selectedBuilding.id,
                                                                        roomNumber
                                                                    );

                                                                const roomRecord =
                                                                    getRoomRecord(
                                                                        selectedBuilding.id,
                                                                        roomNumber
                                                                    );

                                                                const activeLecture =
                                                                    roomRecord?.activeLecture ??
                                                                    null;

                                                                const canManage =
                                                                    canManageBuilding(
                                                                        selectedBuilding.id
                                                                    );

                                                                const isOwnLecture =
                                                                    activeLecture?.lecturerId ===
                                                                    currentUser?.id;

                                                                const canEndLecture =
                                                                    Boolean(
                                                                        activeLecture &&
                                                                        currentUser &&
                                                                        (isOwnLecture ||
                                                                            currentUser.role ===
                                                                            'admin')
                                                                    );

                                                                return (
                                                                    <div className="inline-room-info">
                                                                        <div className="inline-room-info__header">
                                                                            <div>
                                                                                <span>
                                                                                    Wybrana sala
                                                                                </span>

                                                                                <strong>
                                                                                    Sala{' '}
                                                                                    {
                                                                                        roomNumber
                                                                                    }
                                                                                </strong>
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                onClick={
                                                                                    closeRoomInfo
                                                                                }
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </div>

                                                                        <div className="inline-room-info__meta">
                                                                            <span>
                                                                                Budynek{' '}
                                                                                {
                                                                                    selectedBuilding.code
                                                                                }
                                                                            </span>

                                                                            <span>
                                                                                {
                                                                                    floorDefinition.label
                                                                                }
                                                                            </span>

                                                                            <span
                                                                                className={`inline-room-status inline-room-status--${roomStatus}`}
                                                                            >
                                                                                {getRoomStatusText(
                                                                                    roomStatus
                                                                                )}
                                                                            </span>
                                                                        </div>

                                                                        {activeLecture && (
                                                                            <div className="active-lecture">
                                                                                <div className="active-lecture__icon">
                                                                                    ●
                                                                                </div>

                                                                                <div className="active-lecture__content">
                                                                                    <span>
                                                                                        Trwa wykład
                                                                                    </span>

                                                                                    <strong>
                                                                                        {
                                                                                            activeLecture.lecturerName
                                                                                        }
                                                                                    </strong>

                                                                                    {activeLecture.topic && (
                                                                                        <small>
                                                                                            {
                                                                                                activeLecture.topic
                                                                                            }
                                                                                        </small>
                                                                                    )}

                                                                                    <small className="active-lecture__time">
                                                                                        🕒{' '}
                                                                                        {
                                                                                            activeLecture.startTime
                                                                                        }
                                                                                        {' – '}
                                                                                        {
                                                                                            activeLecture.endTime
                                                                                        }
                                                                                    </small>
                                                                                </div>

                                                                                {canEndLecture && (
                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={
                                                                                            changingRoom
                                                                                        }
                                                                                        onClick={() =>
                                                                                            void handleEndLecture(
                                                                                                roomNumber
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Zakończ
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {canManage &&
                                                                            !activeLecture && (
                                                                                <div className="room-manager">
                                                                                    <div className="room-manager__header">
                                                                                        <span>
                                                                                            Zarządzanie salą
                                                                                        </span>

                                                                                        <small>
                                                                                            Status zapisuje się automatycznie
                                                                                        </small>
                                                                                    </div>

                                                                                    <div className="room-manager__buttons">
                                                                                        <button
                                                                                            type="button"
                                                                                            className={
                                                                                                roomStatus ===
                                                                                                'free'
                                                                                                    ? 'room-manager__button room-manager__button--free room-manager__button--active'
                                                                                                    : 'room-manager__button room-manager__button--free'
                                                                                            }
                                                                                            disabled={
                                                                                                changingRoom
                                                                                            }
                                                                                            onClick={() =>
                                                                                                void handleSimpleStatus(
                                                                                                    roomNumber,
                                                                                                    'free'
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            ● Wolna
                                                                                        </button>

                                                                                        <button
                                                                                            type="button"
                                                                                            className={
                                                                                                lectureFormOpen
                                                                                                    ? 'room-manager__button room-manager__button--lecture room-manager__button--active'
                                                                                                    : 'room-manager__button room-manager__button--lecture'
                                                                                            }
                                                                                            disabled={
                                                                                                changingRoom ||
                                                                                                currentUser?.role !==
                                                                                                'lecturer'
                                                                                            }
                                                                                            onClick={() => {
                                                                                                setLectureFormOpen(
                                                                                                    true
                                                                                                );

                                                                                                setRoomActionError(
                                                                                                    null
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            ● Wykład
                                                                                        </button>

                                                                                        <button
                                                                                            type="button"
                                                                                            className={
                                                                                                roomStatus ===
                                                                                                'closed'
                                                                                                    ? 'room-manager__button room-manager__button--closed room-manager__button--active'
                                                                                                    : 'room-manager__button room-manager__button--closed'
                                                                                            }
                                                                                            disabled={
                                                                                                changingRoom
                                                                                            }
                                                                                            onClick={() =>
                                                                                                void handleSimpleStatus(
                                                                                                    roomNumber,
                                                                                                    'closed'
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            ● Zamknij
                                                                                        </button>
                                                                                    </div>

                                                                                    {lectureFormOpen &&
                                                                                        currentUser?.role ===
                                                                                        'lecturer' && (
                                                                                            <div className="lecture-form">
                                                                                                <label>
                                                                                                    Temat zajęć

                                                                                                    <input
                                                                                                        type="text"
                                                                                                        value={
                                                                                                            lectureTopic
                                                                                                        }
                                                                                                        placeholder="np. Programowanie obiektowe"
                                                                                                        onChange={(
                                                                                                            event
                                                                                                        ) =>
                                                                                                            setLectureTopic(
                                                                                                                event
                                                                                                                    .target
                                                                                                                    .value
                                                                                                            )
                                                                                                        }
                                                                                                    />
                                                                                                </label>

                                                                                                <div className="lecture-form__times">
                                                                                                    <label>
                                                                                                        Od

                                                                                                        <input
                                                                                                            type="time"
                                                                                                            value={
                                                                                                                lectureStartTime
                                                                                                            }
                                                                                                            onChange={(
                                                                                                                event
                                                                                                            ) =>
                                                                                                                setLectureStartTime(
                                                                                                                    event
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                )
                                                                                                            }
                                                                                                        />
                                                                                                    </label>

                                                                                                    <label>
                                                                                                        Do

                                                                                                        <input
                                                                                                            type="time"
                                                                                                            value={
                                                                                                                lectureEndTime
                                                                                                            }
                                                                                                            onChange={(
                                                                                                                event
                                                                                                            ) =>
                                                                                                                setLectureEndTime(
                                                                                                                    event
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                )
                                                                                                            }
                                                                                                        />
                                                                                                    </label>
                                                                                                </div>

                                                                                                <div className="lecture-form__teacher">
                                                                                                    Prowadzący:{' '}

                                                                                                    <strong>
                                                                                                        {
                                                                                                            currentUser.name
                                                                                                        }
                                                                                                    </strong>
                                                                                                </div>

                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="lecture-form__start"
                                                                                                    disabled={
                                                                                                        changingRoom
                                                                                                    }
                                                                                                    onClick={() =>
                                                                                                        void handleStartLecture(
                                                                                                            roomNumber
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    ▶ Rozpocznij zajęcia
                                                                                                </button>
                                                                                            </div>
                                                                                        )}

                                                                                    {roomActionError && (
                                                                                        <div className="room-manager__error">
                                                                                            {
                                                                                                roomActionError
                                                                                            }
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                        {roomDetails?.directions && (
                                                                            <p className="inline-room-info__directions">
                                                                                {
                                                                                    roomDetails.directions
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}
                </aside>
            )}
        </main>
    );
}

export default CampusPage;