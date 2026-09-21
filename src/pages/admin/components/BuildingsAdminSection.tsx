import {useEffect, useState} from 'react';
import {buildingApi} from '../../../services/buildingApi';
import type {BuildingDto} from '../../../types/dto/BuildingDto';
import './BuildingsAdminSection.css';

function BuildingsAdminSection() {
    const [buildings, setBuildings] = useState<BuildingDto[]>([]);
    const [name, setName] = useState('');
    const [editing, setEditing] = useState<BuildingDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadBuildings();
    }, []);

    async function loadBuildings() {
        try {
            setLoading(true);
            setBuildings(await buildingApi.getAll());
        } catch (error) {
            console.error(error);
            setError('Nie udało się pobrać budynków.');
        } finally {
            setLoading(false);
        }
    }

    function startEdit(building: BuildingDto) {
        setEditing(building);
        setName(building.name ?? '');
        setError(null);
    }

    async function handleSave(event: React.FormEvent) {
        event.preventDefault();

        const value = name.trim().toUpperCase();

        if (!value || value.length > 2) {
            setError('Kod budynku musi mieć od 1 do 2 znaków.');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            if (editing?.id !== undefined) {
                await buildingApi.update(Number(editing.id), value);
            } else {
                await buildingApi.create(value);
            }

            await loadBuildings();
            setEditing(null);
            setName('');
        } catch (error) {
            console.error(error);
            setError('Nie udało się zapisać budynku.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(building: BuildingDto) {
        if (building.id === undefined) return;
        if (!window.confirm(`Czy usunąć budynek ${building.name}?`)) return;

        try {
            setError(null);
            await buildingApi.delete(Number(building.id));
            await loadBuildings();
        } catch (error) {
            console.error(error);
            setError('Nie udało się usunąć budynku. Budynek może posiadać sale lub wejścia.');
        }
    }

    return (
        <>
            <header className="buildings-admin-header">
                <div>
                    <span>Zarządzanie</span>
                    <h1>Budynki</h1>
                    <p>Dodawanie i edycja budynków kampusu</p>
                </div>


            </header>

            <form className="buildings-admin-form" onSubmit={handleSave}>
                <div>
                    <label>Kod budynku</label>
                    <input
                        value={name}
                        maxLength={2}
                        placeholder="np. B"
                        onChange={(event) => setName(event.target.value.toUpperCase())}
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? 'Zapisywanie...' : editing ? 'Zapisz zmiany' : 'Dodaj'}
                </button>

                {editing && (
                    <button
                        type="button"
                        className="buildings-admin-cancel"
                        onClick={() => {
                            setEditing(null);
                            setName('');
                        }}
                    >
                        Anuluj
                    </button>
                )}
            </form>

            {error && <div className="buildings-admin-error">{error}</div>}

            {loading ? (
                <div className="buildings-admin-card">Ładowanie...</div>
            ) : (
                <div className="buildings-admin-table-wrapper">
                    <table className="buildings-admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Budynek</th>
                            <th>Sale</th>
                            <th>Wejścia</th>
                            <th>Moderatorzy</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>

                        <tbody>
                        {buildings.map((building) => (
                            <tr key={String(building.id)}>
                                <td>{building.id}</td>
                                <td><strong>{building.name}</strong></td>
                                <td>{building.roomIds?.length ?? 0}</td>
                                <td>{building.entranceIds?.length ?? 0}</td>
                                <td>{building.moderatorIds?.length ?? 0}</td>
                                <td>
                                    <div className="buildings-admin-actions">
                                        <button onClick={() => startEdit(building)}>Edytuj</button>
                                        <button
                                            className="buildings-admin-delete"
                                            onClick={() => void handleDelete(building)}
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

export default BuildingsAdminSection;