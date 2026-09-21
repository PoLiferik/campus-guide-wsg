import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { buildingApi } from '../../../services/buildingApi';
import { roomApi } from '../../../services/roomApi';
import type { BuildingDto } from '../../../types/dto/BuildingDto';
import type { RoomDto } from '../../../types/dto/RoomDto';
import './RoomsAdminSection.css';

function RoomsAdminSection() {
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [buildings, setBuildings] = useState<BuildingDto[]>([]);
    const [number, setNumber] = useState('');
    const [selectedBuildingIds, setSelectedBuildingIds] = useState<number[]>([]);
    const [editing, setEditing] = useState<RoomDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            const [roomData, buildingData] = await Promise.all([
                roomApi.getAll(),
                buildingApi.getAll(),
            ]);

            setRooms(roomData);
            setBuildings(buildingData);
        } catch (error) {
            console.error(error);
            setError('Nie udało się pobrać sal.');
        } finally {
            setLoading(false);
        }
    }

    function startEdit(room: RoomDto) {
        setEditing(room);
        setNumber(String(room.number ?? '').padStart(3, '0'));
        setSelectedBuildingIds(
            (room.buildingIds ?? [])
                .map(Number)
                .filter(Number.isFinite)
        );
        setError(null);
    }

    function cancelEdit() {
        setEditing(null);
        setNumber('');
        setSelectedBuildingIds([]);
        setError(null);
    }

    function toggleBuilding(buildingId: number) {
        setSelectedBuildingIds((current) =>
            current.includes(buildingId)
                ? current.filter((id) => id !== buildingId)
                : [...current, buildingId]
        );
    }

    async function handleSave(event: FormEvent) {
        event.preventDefault();

        const normalizedNumber = number.trim().padStart(3, '0');
        const numericNumber = Number(normalizedNumber);

        if (!/^\d{3}$/.test(normalizedNumber) || numericNumber < 1 || numericNumber > 999) {
            setError('Numer sali musi mieć wartość od 001 do 999.');
            return;
        }

        if (selectedBuildingIds.length === 0) {
            setError('Wybierz co najmniej jeden budynek.');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            if (editing?.id !== undefined) {
                await roomApi.update(
                    Number(editing.id),
                    normalizedNumber,
                    selectedBuildingIds
                );
            } else {
                await roomApi.create(
                    normalizedNumber,
                    selectedBuildingIds
                );
            }

            await loadData();
            cancelEdit();
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Nie udało się zapisać sali.'
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(room: RoomDto) {
        if (room.id === undefined) return;

        const roomNumber = String(room.number ?? '').padStart(3, '0');

        if (!window.confirm(`Czy usunąć salę ${roomNumber}?`)) {
            return;
        }

        try {
            setError(null);
            await roomApi.delete(Number(room.id));
            await loadData();
        } catch (error) {
            console.error(error);
            setError('Nie udało się usunąć sali.');
        }
    }

    function getBuildingsText(room: RoomDto) {
        const names = (room.buildingIds ?? [])
            .map((buildingId) =>
                buildings.find(
                    (building) => Number(building.id) === Number(buildingId)
                )?.name
            )
            .filter(Boolean);

        return names.length > 0
            ? names.join(', ')
            : 'Brak';
    }

    function getFloor(roomNumber: number | string | undefined) {
        const value = Number(roomNumber ?? 0);

        if (value >= 200) return '2 piętro';
        if (value >= 100) return '1 piętro';

        return 'Parter';
    }

    return (
        <>
            <header className="rooms-admin-header">
                <div>
                    <span>Zarządzanie</span>
                    <h1>Sale</h1>
                    <p>Dodawanie sal i przypisywanie ich do budynków</p>
                </div>
            </header>

            <form className="rooms-admin-form" onSubmit={handleSave}>
                <div className="rooms-admin-number">
                    <label>Numer sali</label>
                    <input
                        value={number}
                        maxLength={3}
                        placeholder="np. 104"
                        onChange={(event) =>
                            setNumber(
                                event.target.value.replace(/\D/g, '')
                            )
                        }
                    />
                </div>

                <div className="rooms-admin-buildings">
                    <div className="rooms-admin-buildings__header">
                        <label>Budynki</label>
                        <span>Możesz zaznaczyć kilka</span>
                    </div>

                    <div className="rooms-admin-buildings__grid">
                        {buildings.map((building) => {
                            const id = Number(building.id);
                            const selected = selectedBuildingIds.includes(id);

                            return (
                                <label
                                    key={id}
                                    className={`rooms-admin-building ${
                                        selected
                                            ? 'rooms-admin-building--selected'
                                            : ''
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => toggleBuilding(id)}
                                    />

                                    <span>
                                        {building.name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="rooms-admin-form__actions">
                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? 'Zapisywanie...'
                            : editing
                                ? 'Zapisz zmiany'
                                : 'Dodaj'}
                    </button>

                    {editing && (
                        <button
                            type="button"
                            className="rooms-admin-cancel"
                            onClick={cancelEdit}
                        >
                            Anuluj
                        </button>
                    )}
                </div>
            </form>

            {error && (
                <div className="rooms-admin-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rooms-admin-card">
                    Ładowanie...
                </div>
            ) : rooms.length === 0 ? (
                <div className="rooms-admin-card">
                    Brak sal w bazie danych.
                </div>
            ) : (
                <div className="rooms-admin-table-wrapper">
                    <table className="rooms-admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sala</th>
                            <th>Budynki</th>
                            <th>Piętro</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rooms.map((room) => (
                            <tr key={String(room.id)}>
                                <td>{room.id}</td>

                                <td>
                                    <strong>
                                        {String(room.number ?? '').padStart(3, '0')}
                                    </strong>
                                </td>

                                <td>
                                    {getBuildingsText(room)}
                                </td>

                                <td>
                                    {getFloor(room.number)}
                                </td>

                                <td>
                                    <div className="rooms-admin-actions">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(room)}
                                        >
                                            Edytuj
                                        </button>

                                        <button
                                            type="button"
                                            className="rooms-admin-delete"
                                            onClick={() =>
                                                void handleDelete(room)
                                            }
                                        >
                                            Usuń
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

export default RoomsAdminSection;