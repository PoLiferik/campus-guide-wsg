import {useEffect, useState} from 'react';
import {buildingApi} from '../../../services/buildingApi';
import {roomApi} from '../../../services/roomApi';
import type {BuildingDto} from '../../../types/dto/BuildingDto';
import type {RoomDto} from '../../../types/dto/RoomDto';
import './RoomsAdminSection.css';

function RoomsAdminSection() {
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [buildings, setBuildings] = useState<BuildingDto[]>([]);
    const [number, setNumber] = useState('');
    const [buildingId, setBuildingId] = useState('');
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

    function startCreate() {
        setEditing(null);
        setNumber('');
        setBuildingId('');
        setError(null);
    }

    function startEdit(room: RoomDto) {
        setEditing(room);
        setNumber(String(room.number ?? '').padStart(3, '0'));
        setBuildingId(String(room.buildingId));
        setError(null);
    }

    async function handleSave(event: React.FormEvent) {
        event.preventDefault();

        const normalizedNumber = number.trim().padStart(3, '0');
        const selectedBuildingId = Number(buildingId);

        if (!/^\d{3}$/.test(normalizedNumber)) {
            setError('Numer sali musi mieć 3 cyfry, np. 005, 101 lub 201.');
            return;
        }

        if (!selectedBuildingId) {
            setError('Wybierz budynek.');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            if (editing?.id !== undefined) {
                await roomApi.update(Number(editing.id), normalizedNumber, selectedBuildingId);
            } else {
                await roomApi.create(normalizedNumber, selectedBuildingId);
            }

            await loadData();
            setEditing(null);
            setNumber('');
            setBuildingId('');
        } catch (error) {
            console.error(error);
            setError('Nie udało się zapisać sali.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(room: RoomDto) {
        if (room.id === undefined) return;
        if (!window.confirm(`Czy usunąć salę ${String(room.number).padStart(3, '0')}?`)) return;

        try {
            setError(null);
            await roomApi.delete(Number(room.id));
            await loadData();
        } catch (error) {
            console.error(error);
            setError('Nie udało się usunąć sali.');
        }
    }

    function getBuildingName(id: number | string) {
        return buildings.find((building) => Number(building.id) === Number(id))?.name ?? '?';
    }

    function getFloor(roomNumber: number | string) {
        const value = Number(roomNumber);

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

                <button className="rooms-admin-primary" onClick={startCreate}>
                    + Dodaj salę
                </button>
            </header>

            <form className="rooms-admin-form" onSubmit={handleSave}>
                <div>
                    <label>Numer sali</label>
                    <input
                        value={number}
                        maxLength={3}
                        placeholder="np. 101"
                        onChange={(event) => setNumber(event.target.value.replace(/\D/g, ''))}
                    />
                </div>

                <div>
                    <label>Budynek</label>
                    <select value={buildingId} onChange={(event) => setBuildingId(event.target.value)}>
                        <option value="">Wybierz budynek</option>

                        {buildings.map((building) => (
                            <option key={String(building.id)} value={String(building.id)}>
                                Budynek {building.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? 'Zapisywanie...' : editing ? 'Zapisz zmiany' : 'Dodaj'}
                </button>

                {editing && (
                    <button
                        type="button"
                        className="rooms-admin-cancel"
                        onClick={() => {
                            setEditing(null);
                            setNumber('');
                            setBuildingId('');
                        }}
                    >
                        Anuluj
                    </button>
                )}
            </form>

            {error && <div className="rooms-admin-error">{error}</div>}

            {loading ? (
                <div className="rooms-admin-card">Ładowanie...</div>
            ) : (
                <div className="rooms-admin-table-wrapper">
                    <table className="rooms-admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sala</th>
                            <th>Budynek</th>
                            <th>Piętro</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rooms.map((room) => (
                            <tr key={String(room.id)}>
                                <td>{room.id}</td>
                                <td><strong>{String(room.number).padStart(3, '0')}</strong></td>
                                <td>Budynek {getBuildingName(room.buildingId)}</td>
                                <td>{getFloor(room.number ?? 0)}</td>
                                <td>
                                    <div className="rooms-admin-actions">
                                        <button onClick={() => startEdit(room)}>Edytuj</button>
                                        <button
                                            className="rooms-admin-delete"
                                            onClick={() => void handleDelete(room)}
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