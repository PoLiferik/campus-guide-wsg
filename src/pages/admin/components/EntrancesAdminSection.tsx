import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { buildingApi } from '../../../services/buildingApi';
import { entranceAdminApi } from '../../../services/entranceAdminApi';
import { ApiError } from '../../../services/apiClient';
import type { BuildingDto } from '../../../types/dto/BuildingDto';
import type { EntranceDto } from '../../../types/dto/EntranceDto';
import './EntrancesAdminSection.css';

function EntrancesAdminSection() {
    const [entrances, setEntrances] = useState<EntranceDto[]>([]);
    const [buildings, setBuildings] = useState<BuildingDto[]>([]);
    const [name, setName] = useState('');
    const [buildingId, setBuildingId] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [editing, setEditing] = useState<EntranceDto | null>(null);
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

            const [entranceData, buildingData] = await Promise.all([
                entranceAdminApi.getAll(),
                buildingApi.getAll(),
            ]);

            setEntrances(entranceData);
            setBuildings(buildingData);
        } catch (error) {
            console.error(error);
            setError('Nie udało się pobrać wejść.');
        } finally {
            setLoading(false);
        }
    }

    function startEdit(entrance: EntranceDto) {
        setEditing(entrance);
        setName(entrance.name ?? '');
        setBuildingId(String(entrance.buildingId));
        setIsOpen(entrance.isOpen ?? false);
        setError(null);
    }

    function cancelEdit() {
        setEditing(null);
        setName('');
        setBuildingId('');
        setIsOpen(true);
        setError(null);
    }

    async function handleSave(event: FormEvent) {
        event.preventDefault();

        const normalizedName = name.trim().toUpperCase();
        const selectedBuildingId = Number(buildingId);

        if (normalizedName.length < 3 || normalizedName.length > 4) {
            setError('Nazwa wejścia musi mieć od 3 do 4 znaków, np. B-1.');
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
                await entranceAdminApi.update(
                    Number(editing.id),
                    normalizedName,
                    selectedBuildingId,
                    isOpen
                );
            } else {
                await entranceAdminApi.create(
                    normalizedName,
                    selectedBuildingId,
                    isOpen
                );
            }

            await loadData();
            cancelEdit();
        } catch (error) {
            console.error(error);

            if (error instanceof ApiError && error.status === 409) {
                setError('Wejście o tej nazwie już istnieje.');
            } else {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Nie udało się zapisać wejścia.'
                );
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(entrance: EntranceDto) {
        if (entrance.id === undefined) return;

        if (!window.confirm(`Czy usunąć wejście ${entrance.name}?`)) return;

        try {
            setError(null);
            await entranceAdminApi.delete(Number(entrance.id));
            await loadData();

            if (editing?.id === entrance.id) {
                cancelEdit();
            }
        } catch (error) {
            console.error(error);
            setError('Nie udało się usunąć wejścia.');
        }
    }

    async function toggleStatus(entrance: EntranceDto) {
        if (entrance.id === undefined) return;

        try {
            setError(null);

            await entranceAdminApi.update(
                Number(entrance.id),
                entrance.name ?? '',
                Number(entrance.buildingId),
                !entrance.isOpen
            );

            await loadData();
        } catch (error) {
            console.error(error);
            setError('Nie udało się zmienić statusu wejścia.');
        }
    }

    function getBuildingName(id: number | string) {
        return buildings.find(
            (building) => Number(building.id) === Number(id)
        )?.name ?? '?';
    }

    return (
        <>
            <header className="entrances-admin-header">
                <div>
                    <span>Zarządzanie</span>
                    <h1>Wejścia</h1>
                    <p>Dodawanie i zarządzanie wejściami do budynków</p>
                </div>
            </header>

            <form className="entrances-admin-form" onSubmit={handleSave}>
                <div>
                    <label>Nazwa wejścia</label>
                    <input
                        value={name}
                        maxLength={4}
                        placeholder="np. B-1"
                        onChange={(event) => setName(event.target.value.toUpperCase())}
                    />
                </div>

                <div>
                    <label>Budynek</label>

                    <select
                        value={buildingId}
                        onChange={(event) => setBuildingId(event.target.value)}
                    >
                        <option value="">Wybierz budynek</option>

                        {buildings.map((building) => (
                            <option
                                key={String(building.id)}
                                value={String(building.id)}
                            >
                                {building.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Status</label>

                    <select
                        value={isOpen ? 'open' : 'closed'}
                        onChange={(event) => setIsOpen(event.target.value === 'open')}
                    >
                        <option value="open">Otwarte</option>
                        <option value="closed">Zamknięte</option>
                    </select>
                </div>

                <div className="entrances-admin-form__actions">
                    <button type="submit" disabled={saving}>
                        {saving
                            ? 'Zapisywanie...'
                            : editing
                                ? 'Zapisz zmiany'
                                : 'Dodaj'}
                    </button>

                    {editing && (
                        <button
                            type="button"
                            className="entrances-admin-cancel"
                            onClick={cancelEdit}
                        >
                            Anuluj
                        </button>
                    )}
                </div>
            </form>

            {error && (
                <div className="entrances-admin-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="entrances-admin-card">
                    Ładowanie...
                </div>
            ) : entrances.length === 0 ? (
                <div className="entrances-admin-card">
                    Brak wejść w bazie danych.
                </div>
            ) : (
                <div className="entrances-admin-table-wrapper">
                    <table className="entrances-admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Wejście</th>
                            <th>Budynek</th>
                            <th>Status</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>

                        <tbody>
                        {entrances.map((entrance) => (
                            <tr key={String(entrance.id)}>
                                <td>{entrance.id}</td>

                                <td>
                                    <strong>{entrance.name}</strong>
                                </td>

                                <td>
                                    {getBuildingName(entrance.buildingId)}
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        className={`entrances-admin-status ${
                                            entrance.isOpen
                                                ? 'entrances-admin-status--open'
                                                : 'entrances-admin-status--closed'
                                        }`}
                                        onClick={() => void toggleStatus(entrance)}
                                    >
                                        {entrance.isOpen ? 'Otwarte' : 'Zamknięte'}
                                    </button>
                                </td>

                                <td>
                                    <div className="entrances-admin-actions">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(entrance)}
                                        >
                                            Edytuj
                                        </button>

                                        <button
                                            type="button"
                                            className="entrances-admin-delete"
                                            onClick={() => void handleDelete(entrance)}
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

export default EntrancesAdminSection;