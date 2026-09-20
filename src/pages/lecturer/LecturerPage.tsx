import {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {buildings} from '../../mocks/buildings';
import {entranceApi} from '../../services/entranceApi';
import {authApi} from '../../services/authApi';

import type {Entrance} from '../../types/Entrance';
import type {User} from '../../types/User';

import './LecturerPage.css';

function LecturerPage() {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] =
        useState<User | null>(null);

    const [allEntrances, setAllEntrances] =
        useState<Entrance[]>([]);

    const [selectedBuildingId, setSelectedBuildingId] =
        useState<number | null>(null);

    const [selectedEntranceId, setSelectedEntranceId] =
        useState<number | null>(null);

    const [isOpen, setIsOpen] =
        useState(true);

    const [openFrom, setOpenFrom] =
        useState('07:00');

    const [openUntil, setOpenUntil] =
        useState('21:00');

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState<string | null>(null);

    const selectEntrance =
        (entrance: Entrance | null) => {
            setSelectedEntranceId(
                entrance?.id ?? null
            );
            setIsOpen(
                entrance?.isOpen ?? true
            );
            setOpenFrom(
                entrance?.openFrom ?? '07:00'
            );
            setOpenUntil(
                entrance?.openUntil ?? '21:00'
            );
            setMessage(null);
        };

    useEffect(() => {
        const load = async () => {
            try {
                const user =
                    await authApi.getCurrentUser();

                if (!user) {
                    navigate('/login');
                    return;
                }

                setCurrentUser(user);

                const entrances =
                    await entranceApi.getAll();

                setAllEntrances(entrances);

                const availableBuildings =
                    user.role === 'Admin'
                        ? buildings
                        : buildings.filter(
                            (building) =>
                                user.assignedBuildingIds.includes(
                                    building.id
                                )
                        );

                if (availableBuildings.length > 0) {
                    const firstBuilding =
                        availableBuildings[0];

                    setSelectedBuildingId(firstBuilding.id);
                    selectEntrance(
                        entrances.find(
                            (entrance) =>
                                entrance.buildingId ===
                                firstBuilding.id
                        ) ?? null
                    );
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    const availableBuildings =
        useMemo(() => {
            if (!currentUser) {
                return [];
            }

            if (currentUser.role === 'Admin') {
                return buildings;
            }

            return buildings.filter(
                (building) =>
                    currentUser.assignedBuildingIds.includes(
                        building.id
                    )
            );
        }, [currentUser]);

    const buildingEntrances =
        useMemo(() => {
            if (selectedBuildingId === null) {
                return [];
            }

            return allEntrances.filter(
                (entrance) =>
                    entrance.buildingId ===
                    selectedBuildingId
            );
        }, [
            allEntrances,
            selectedBuildingId,
        ]);

    const selectedEntrance =
        useMemo(
            () =>
                buildingEntrances.find(
                    (entrance) =>
                        entrance.id ===
                        selectedEntranceId
                ) ?? null,
            [
                buildingEntrances,
                selectedEntranceId,
            ]
        );

    const handleSave =
        async () => {
            if (!selectedEntrance) {
                return;
            }

            try {
                setSaving(true);
                setMessage(null);

                const updated =
                    await entranceApi.updateStatus(
                        selectedEntrance.id,
                        {
                            isOpen,
                            openFrom:
                                openFrom || null,
                            openUntil:
                                openUntil || null,
                        }
                    );

                setAllEntrances(
                    (current) =>
                        current.map(
                            (entrance) =>
                                entrance.id ===
                                updated.id
                                    ? updated
                                    : entrance
                        )
                );

                setMessage(
                    'Zmiany zostały zapisane.'
                );
            } catch (error) {
                console.error(error);

                setMessage(
                    'Nie udało się zapisać zmian.'
                );
            } finally {
                setSaving(false);
            }
        };

    const handleLogout =
        async () => {
            await authApi.logout();

            navigate('/login');
        };

    if (loading) {
        return (
            <main className="lecturer-page">
                <div className="lecturer-card">
                    Ładowanie...
                </div>
            </main>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <main className="lecturer-page">
            <aside className="lecturer-sidebar">
                <div>
                    <span className="lecturer-sidebar__small">
                        Campus Guide WSG
                    </span>

                    <h1>
                        Panel wykładowcy
                    </h1>
                </div>

                <div className="lecturer-user">
                    <span>
                        Zalogowany jako
                    </span>

                    <strong>
                        {currentUser.name}
                    </strong>

                    <small>
                        {currentUser.role === 'Admin'
                            ? 'Administrator'
                            : 'Wykładowca'}
                    </small>
                </div>

                <div className="lecturer-access">
                    <span>
                        Dostęp do budynków
                    </span>

                    <div className="lecturer-access__list">
                        {availableBuildings.map(
                            (building) => (
                                <span
                                    key={
                                        building.id
                                    }
                                    className="lecturer-building-badge"
                                >
                                    {building.code}
                                </span>
                            )
                        )}
                    </div>
                </div>

                <div className="lecturer-sidebar__bottom">
                    <Link
                        to="/"
                        className="lecturer-link"
                    >
                        ← Mapa kampusu
                    </Link>

                    {currentUser.role ===
                        'Admin' && (
                            <Link
                                to="/admin"
                                className="lecturer-link"
                            >
                                Panel administratora
                            </Link>
                        )}

                    <button
                        type="button"
                        className="lecturer-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        Wyloguj się
                    </button>
                </div>
            </aside>

            <section className="lecturer-content">
                <header className="lecturer-header">
                    <div>
                        <span>
                            Zarządzanie wejściami
                        </span>

                        <h2>
                            Status wejść
                        </h2>

                        <p>
                            Możesz edytować tylko
                            wejścia przypisanych
                            budynków.
                        </p>
                    </div>
                </header>

                {availableBuildings.length ===
                0 ? (
                    <div className="lecturer-card">
                        <h3>
                            Brak przypisanych budynków
                        </h3>

                        <p>
                            Administrator nie
                            przypisał jeszcze
                            żadnego budynku do
                            Twojego konta.
                        </p>
                    </div>
                ) : (
                    <div className="lecturer-grid">
                        <div className="lecturer-card">
                            <label className="lecturer-field">
                                Budynek

                                <select
                                    value={
                                        selectedBuildingId ??
                                        ''
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        const buildingId =
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            );

                                        setSelectedBuildingId(
                                            buildingId
                                        );
                                        selectEntrance(
                                            allEntrances.find(
                                                (entrance) =>
                                                    entrance.buildingId ===
                                                    buildingId
                                            ) ?? null
                                        );
                                    }}
                                >
                                    {availableBuildings.map(
                                        (
                                            building
                                        ) => (
                                            <option
                                                key={
                                                    building.id
                                                }
                                                value={
                                                    building.id
                                                }
                                            >
                                                Budynek{' '}
                                                {
                                                    building.code
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <div className="lecturer-building-info">
                                <span>
                                    Twój dostęp
                                </span>

                                <strong>
                                    {
                                        availableBuildings.find(
                                            (
                                                building
                                            ) =>
                                                building.id ===
                                                selectedBuildingId
                                        )
                                            ?.code
                                    }
                                </strong>

                                <span className="lecturer-access-ok">
                                    ● Dostęp przyznany
                                </span>
                            </div>
                        </div>

                        <div className="lecturer-card">
                            <label className="lecturer-field">
                                Wejście

                                <select
                                    value={
                                        selectedEntranceId ??
                                        ''
                                    }
                                    disabled={
                                        buildingEntrances.length ===
                                        0
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        const entranceId =
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            );

                                        selectEntrance(
                                            buildingEntrances.find(
                                                (entrance) =>
                                                    entrance.id ===
                                                    entranceId
                                            ) ?? null
                                        );
                                    }}
                                >
                                    {buildingEntrances.length ===
                                    0 ? (
                                        <option value="">
                                            Brak wejść
                                        </option>
                                    ) : (
                                        buildingEntrances.map(
                                            (
                                                entrance
                                            ) => (
                                                <option
                                                    key={
                                                        entrance.id
                                                    }
                                                    value={
                                                        entrance.id
                                                    }
                                                >
                                                    {
                                                        entrance.code
                                                    }
                                                    {entrance.description
                                                        ? ` — ${entrance.description}`
                                                        : ''}
                                                </option>
                                            )
                                        )
                                    )}
                                </select>
                            </label>

                            {selectedEntrance && (
                                <>
                                    <div className="lecturer-status-switch">
                                        <button
                                            type="button"
                                            className={
                                                isOpen
                                                    ? 'lecturer-status-button lecturer-status-button--open lecturer-status-button--active'
                                                    : 'lecturer-status-button'
                                            }
                                            onClick={() =>
                                                setIsOpen(
                                                    true
                                                )
                                            }
                                        >
                                            Otwarte
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                !isOpen
                                                    ? 'lecturer-status-button lecturer-status-button--closed lecturer-status-button--active'
                                                    : 'lecturer-status-button'
                                            }
                                            onClick={() =>
                                                setIsOpen(
                                                    false
                                                )
                                            }
                                        >
                                            Zamknięte
                                        </button>
                                    </div>

                                    <div className="lecturer-hours">
                                        <label className="lecturer-field">
                                            Od

                                            <input
                                                type="time"
                                                value={
                                                    openFrom
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setOpenFrom(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className="lecturer-field">
                                            Do

                                            <input
                                                type="time"
                                                value={
                                                    openUntil
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setOpenUntil(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        className="lecturer-save"
                                        disabled={
                                            saving
                                        }
                                        onClick={
                                            handleSave
                                        }
                                    >
                                        {saving
                                            ? 'Zapisywanie...'
                                            : 'Zapisz zmiany'}
                                    </button>

                                    {message && (
                                        <div className="lecturer-message">
                                            {
                                                message
                                            }
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

export default LecturerPage;