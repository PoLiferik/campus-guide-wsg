import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import CampusMap from '../components/CampusMap/CampusMap';

import { buildings } from '../mocks/buildings';

import { campusApi } from '../services/campusApi';
import { entranceApi } from '../services/entranceApi';
import { authApi } from '../services/authApi';
import {
    getDemoRoomStatus,
    roomStatusApi,
} from '../services/roomStatusApi';

import type { SearchResult } from '../types/Search';
import type { Entrance } from '../types/Entrance';
import type { User } from '../types/User';
import type {
    RoomStatus,
    RoomStatusRecord,
} from '../services/roomStatusApi';

import './CampusPage.css';

function CampusPage() {
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<SearchResult | null>(null);

    const [buildingRooms, setBuildingRooms] = useState<SearchResult[]>([]);
    const [allEntrances, setAllEntrances] = useState<Entrance[]>([]);
    const [roomStatuses, setRoomStatuses] = useState<RoomStatusRecord[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [roomsLoading, setRoomsLoading] = useState(false);
    const [roomsError, setRoomsError] = useState<string | null>(null);

    const [menuOpen, setMenuOpen] = useState(true);
    const [openFloor, setOpenFloor] = useState<number | null>(null);

    const [lectureFormOpen, setLectureFormOpen] = useState(false);
    const [lectureTopic, setLectureTopic] = useState('');
    const [lectureStartTime, setLectureStartTime] = useState('');
    const [lectureEndTime, setLectureEndTime] = useState('');
    const [roomActionLoading, setRoomActionLoading] = useState(false);
    const [roomActionError, setRoomActionError] = useState<string | null>(null);

    useEffect(() => {
        entranceApi.getAll()
            .then(setAllEntrances)
            .catch(console.error);

        roomStatusApi.getAll()
            .then(setRoomStatuses)
            .catch(console.error);

        authApi.getCurrentUser()
            .then(setCurrentUser)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedBuildingId === null) return;

        let cancelled = false;

        campusApi.getRoomsByBuilding(selectedBuildingId)
            .then((rooms) => {
                if (cancelled) return;

                setBuildingRooms(rooms);
                setRoomsError(null);

                const firstFloor = rooms[0]?.floor ?? null;

                setOpenFloor((current) => {
                    if (current !== null && rooms.some((room) => room.floor === current)) {
                        return current;
                    }

                    return firstFloor;
                });

                setSelectedRoom((current) => {
                    if (!current) return null;

                    return rooms.find((room) => room.id === current.id) ?? null;
                });
            })
            .catch((error) => {
                if (cancelled) return;

                console.error(error);
                setBuildingRooms([]);
                setRoomsError('Nie udało się pobrać sal z bazy danych.');
            })
            .finally(() => {
                if (!cancelled) setRoomsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedBuildingId]);

    const selectedBuilding = buildings.find(
        (building) => building.id === selectedBuildingId
    );

    const floors = Array.from(
        new Set(
            buildingRooms
                .map((room) => room.floor)
                .filter((floor): floor is number => floor !== undefined)
        )
    ).sort((a, b) => a - b);

    const selectedStatusRecord = selectedRoom?.number && selectedBuildingId !== null
        ? roomStatuses.find(
            (record) =>
                record.buildingId === selectedBuildingId &&
                record.roomNumber === selectedRoom.number
        )
        : undefined;

    const selectedRoomStatus = selectedRoom?.number
        ? selectedStatusRecord?.status ?? getDemoRoomStatus(selectedRoom.number)
        : null;

    const activeLecture = selectedStatusRecord?.activeLecture ?? null;

    const canEditSelectedBuilding = Boolean(
        currentUser &&
        selectedBuildingId !== null &&
        (
            currentUser.role === 'Admin' ||
            (
                currentUser.role === 'Moderator' &&
                currentUser.assignedBuildingIds.includes(selectedBuildingId)
            )
        )
    );

    const canEndLecture = Boolean(
        currentUser &&
        activeLecture &&
        (
            currentUser.role === 'Admin' ||
            activeLecture.lecturerId === currentUser.id
        )
    );

    function handleBuildingSelect(id: number | null) {
        setSelectedBuildingId(id);
        setSelectedRoom(null);
        setBuildingRooms([]);
        setSearchResults([]);
        setSearchError(null);
        setRoomsError(null);
        setRoomActionError(null);
        setLectureFormOpen(false);

        if (id !== null) setRoomsLoading(true);
    }

    function handleRoomSelect(room: SearchResult) {
        setSelectedRoom(room);
        setOpenFloor(room.floor ?? null);
        setRoomActionError(null);
        setLectureFormOpen(false);
        setLectureTopic('');
        setLectureStartTime('');
        setLectureEndTime('');
    }

    async function handleSearch(event: FormEvent) {
        event.preventDefault();

        const value = query.trim();

        if (!value) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        try {
            setSearchLoading(true);
            setSearchError(null);

            const response = await campusApi.search(value);

            if (response.items.length === 0) {
                setSearchResults([]);
                setSearchError('Nie znaleziono sali lub budynku.');
                return;
            }

            if (response.items.length === 1) {
                selectSearchResult(response.items[0]);
                return;
            }

            setSearchResults(response.items);
        } catch (error) {
            console.error(error);
            setSearchResults([]);
            setSearchError('Nie można pobrać danych. Spróbuj ponownie.');
        } finally {
            setSearchLoading(false);
        }
    }

    function selectSearchResult(result: SearchResult) {
        setSearchResults([]);
        setSearchError(null);
        setRoomsError(null);

        if (result.type === 'building') {
            handleBuildingSelect(result.buildingId);
            return;
        }

        setSelectedBuildingId(result.buildingId);
        setSelectedRoom(result);
        setRoomsLoading(true);
        setOpenFloor(result.floor ?? null);
        setLectureFormOpen(false);
        setRoomActionError(null);
    }

    function getRoomStatus(room: SearchResult): RoomStatus {
        if (!room.number) return 'free';

        const record = roomStatuses.find(
            (item) =>
                item.buildingId === room.buildingId &&
                item.roomNumber === room.number
        );

        return record?.status ?? getDemoRoomStatus(room.number);
    }

    function getStatusLabel(status: RoomStatus) {
        if (status === 'lecture') return 'Trwa wykład';
        if (status === 'closed') return 'Zamknięta';

        return 'Wolna';
    }

    async function reloadStatuses() {
        setRoomStatuses(await roomStatusApi.getAll());
    }

    async function changeRoomStatus(status: 'free' | 'closed') {
        if (!currentUser || !selectedRoom?.number || selectedBuildingId === null) return;

        try {
            setRoomActionLoading(true);
            setRoomActionError(null);

            await roomStatusApi.setStatus(
                selectedBuildingId,
                selectedRoom.number,
                status,
                currentUser.name,
                currentUser.id,
                currentUser.role === 'Admin'
            );

            await reloadStatuses();
            setLectureFormOpen(false);
        } catch (error) {
            console.error(error);
            setRoomActionError(
                error instanceof Error ? error.message : 'Nie udało się zmienić statusu sali.'
            );
        } finally {
            setRoomActionLoading(false);
        }
    }

    async function startLecture(event: FormEvent) {
        event.preventDefault();

        if (!currentUser || !selectedRoom?.number || selectedBuildingId === null) return;

        if (!lectureStartTime || !lectureEndTime) {
            setRoomActionError('Podaj godzinę rozpoczęcia i zakończenia.');
            return;
        }

        if (lectureEndTime <= lectureStartTime) {
            setRoomActionError('Godzina zakończenia musi być późniejsza niż rozpoczęcia.');
            return;
        }

        try {
            setRoomActionLoading(true);
            setRoomActionError(null);

            await roomStatusApi.startLecture(
                selectedBuildingId,
                selectedRoom.number,
                currentUser.id,
                currentUser.name,
                lectureTopic.trim(),
                lectureStartTime,
                lectureEndTime
            );

            await reloadStatuses();

            setLectureFormOpen(false);
            setLectureTopic('');
            setLectureStartTime('');
            setLectureEndTime('');
        } catch (error) {
            console.error(error);
            setRoomActionError(
                error instanceof Error ? error.message : 'Nie udało się rozpocząć wykładu.'
            );
        } finally {
            setRoomActionLoading(false);
        }
    }

    async function endLecture() {
        if (!currentUser || !selectedRoom?.number || selectedBuildingId === null) return;

        try {
            setRoomActionLoading(true);
            setRoomActionError(null);

            await roomStatusApi.endLecture(
                selectedBuildingId,
                selectedRoom.number,
                currentUser.id,
                currentUser.name,
                currentUser.role === 'Admin'
            );

            await reloadStatuses();
        } catch (error) {
            console.error(error);
            setRoomActionError(
                error instanceof Error ? error.message : 'Nie udało się zakończyć wykładu.'
            );
        } finally {
            setRoomActionLoading(false);
        }
    }

    return (
        <main className="campus-page">
            <CampusMap
                selectedBuildingId={selectedBuildingId}
                recommendedEntranceId={null}
                entrances={allEntrances}
                onBuildingSelect={handleBuildingSelect}
            />

            {!menuOpen && (
                <button
                    type="button"
                    className="campus-panel-toggle"
                    onClick={() => setMenuOpen(true)}
                >
                    ☰
                </button>
            )}

            {menuOpen && (
                <aside className="campus-panel">
                    <header className="campus-panel__header">
                        <div>
                            <span>WSG</span>
                            <h1>Campus Guide</h1>
                        </div>

                        <div className="campus-panel__header-actions">
                            {selectedBuilding && (
                                <span className="campus-building-badge">
                                    {selectedBuilding.code}
                                </span>
                            )}

                            <button
                                type="button"
                                className="campus-panel__hide"
                                onClick={() => setMenuOpen(false)}
                            >
                                —
                            </button>
                        </div>
                    </header>

                    <form className="campus-search" onSubmit={handleSearch}>
                        <input
                            value={query}
                            placeholder="Wpisz budynek lub numer sali"
                            onChange={(event) => setQuery(event.target.value)}
                        />

                        <button type="submit" disabled={searchLoading}>
                            {searchLoading ? '...' : 'Szukaj'}
                        </button>
                    </form>

                    {searchError && (
                        <div className="campus-message campus-message--error">
                            {searchError}
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="campus-search-results">
                            {searchResults.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    type="button"
                                    onClick={() => selectSearchResult(result)}
                                >
                                    {result.type === 'building' ? (
                                        <>
                                            <strong>Budynek {result.buildingCode}</strong>
                                            <span>Budynek</span>
                                        </>
                                    ) : (
                                        <>
                                            <strong>
                                                {result.buildingCode} {result.number}
                                            </strong>
                                            <span>{result.floorLabel}</span>
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedBuilding && (
                        <>
                            <div className="campus-selected-building">
                                <div>
                                    <span>Wybrany budynek</span>
                                    <strong>Budynek {selectedBuilding.code}</strong>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleBuildingSelect(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="campus-legend">
                                <span><i className="campus-dot campus-dot--free" /> Wolna</span>
                                <span><i className="campus-dot campus-dot--lecture" /> Trwa wykład</span>
                                <span><i className="campus-dot campus-dot--closed" /> Zamknięta</span>
                            </div>

                            {roomsLoading && (
                                <div className="campus-message">
                                    Ładowanie sal...
                                </div>
                            )}

                            {roomsError && (
                                <div className="campus-message campus-message--error">
                                    {roomsError}
                                </div>
                            )}

                            {!roomsLoading && !roomsError && buildingRooms.length === 0 && (
                                <div className="campus-message">
                                    Brak sal w tym budynku.
                                </div>
                            )}

                            {!roomsLoading && floors.map((floor) => {
                                const floorRooms = buildingRooms.filter(
                                    (room) => room.floor === floor
                                );

                                const floorLabel = floor === 0 ? 'Parter' : `${floor} piętro`;
                                const isOpen = openFloor === floor;

                                return (
                                    <section className="campus-floor" key={floor}>
                                        <button
                                            type="button"
                                            className="campus-floor__header"
                                            onClick={() => setOpenFloor(isOpen ? null : floor)}
                                        >
                                            <div>
                                                <span className="campus-floor__icon">
                                                    {floor === 0 ? 'P' : floor}
                                                </span>

                                                <div>
                                                    <strong>{floorLabel}</strong>
                                                    <small>
                                                        {floorRooms[0]?.number}–{floorRooms[floorRooms.length - 1]?.number}
                                                    </small>
                                                </div>
                                            </div>

                                            <span>{isOpen ? '⌃' : '⌄'}</span>
                                        </button>

                                        {isOpen && (
                                            <div className="campus-floor__content">
                                                <div className="campus-room-grid">
                                                    {floorRooms.map((room) => {
                                                        const status = getRoomStatus(room);
                                                        const selected = selectedRoom?.id === room.id;

                                                        return (
                                                            <button
                                                                key={room.id}
                                                                type="button"
                                                                className={`campus-room campus-room--${status} ${
                                                                    selected ? 'campus-room--selected' : ''
                                                                }`}
                                                                onClick={() => handleRoomSelect(room)}
                                                            >
                                                                <span>{room.number}</span>
                                                                <i />
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {selectedRoom?.floor === floor && selectedRoom.number && (
                                                    <div className="campus-room-details">
                                                        <div className="campus-room-details__header">
                                                            <div>
                                                                <span>Sala</span>
                                                                <strong>
                                                                    {selectedBuilding.code} {selectedRoom.number}
                                                                </strong>
                                                            </div>

                                                            {selectedRoomStatus && (
                                                                <span
                                                                    className={`campus-room-status campus-room-status--${selectedRoomStatus}`}
                                                                >
                                                                    {getStatusLabel(selectedRoomStatus)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {activeLecture && (
                                                            <div className="campus-active-lecture">
                                                                <strong>{activeLecture.lecturerName}</strong>

                                                                {activeLecture.topic && (
                                                                    <span>{activeLecture.topic}</span>
                                                                )}

                                                                <small>
                                                                    {activeLecture.startTime} – {activeLecture.endTime}
                                                                </small>
                                                            </div>
                                                        )}

                                                        {canEditSelectedBuilding && currentUser && (
                                                            <div className="room-manager">
                                                                <div className="room-manager__buttons">
                                                                    <button
                                                                        type="button"
                                                                        disabled={roomActionLoading}
                                                                        onClick={() => void changeRoomStatus('free')}
                                                                    >
                                                                        Wolna
                                                                    </button>

                                                                    {!activeLecture && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={roomActionLoading}
                                                                            onClick={() => {
                                                                                setLectureFormOpen((value) => !value);
                                                                                setRoomActionError(null);
                                                                            }}
                                                                        >
                                                                            Wykład
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        type="button"
                                                                        disabled={roomActionLoading}
                                                                        onClick={() => void changeRoomStatus('closed')}
                                                                    >
                                                                        Zamknij
                                                                    </button>
                                                                </div>

                                                                {lectureFormOpen && !activeLecture && (
                                                                    <form
                                                                        className="room-manager__lecture"
                                                                        onSubmit={startLecture}
                                                                    >
                                                                        <input
                                                                            value={lectureTopic}
                                                                            placeholder="Temat wykładu"
                                                                            onChange={(event) =>
                                                                                setLectureTopic(event.target.value)
                                                                            }
                                                                        />

                                                                        <div>
                                                                            <label>
                                                                                Od
                                                                                <input
                                                                                    type="time"
                                                                                    value={lectureStartTime}
                                                                                    required
                                                                                    onChange={(event) =>
                                                                                        setLectureStartTime(event.target.value)
                                                                                    }
                                                                                />
                                                                            </label>

                                                                            <label>
                                                                                Do
                                                                                <input
                                                                                    type="time"
                                                                                    value={lectureEndTime}
                                                                                    required
                                                                                    onChange={(event) =>
                                                                                        setLectureEndTime(event.target.value)
                                                                                    }
                                                                                />
                                                                            </label>
                                                                        </div>

                                                                        <button
                                                                            type="submit"
                                                                            disabled={roomActionLoading}
                                                                        >
                                                                            Rozpocznij wykład
                                                                        </button>
                                                                    </form>
                                                                )}

                                                                {activeLecture && canEndLecture && (
                                                                    <button
                                                                        type="button"
                                                                        className="room-manager__end"
                                                                        disabled={roomActionLoading}
                                                                        onClick={() => void endLecture()}
                                                                    >
                                                                        Zakończ wykład
                                                                    </button>
                                                                )}

                                                                {roomActionError && (
                                                                    <div className="room-manager__error">
                                                                        {roomActionError}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </>
                    )}

                    {!selectedBuilding && searchResults.length === 0 && !searchError && (
                        <div className="campus-panel__empty">
                            Wybierz budynek na mapie lub użyj wyszukiwarki.
                        </div>
                    )}
                </aside>
            )}
        </main>
    );
}

export default CampusPage;