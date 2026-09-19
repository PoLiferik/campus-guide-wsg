import {
    useEffect,
    useState,
} from 'react';
import { Link } from 'react-router-dom';
import { buildings } from '../../mocks/buildings';
import { entranceApi } from '../../services/entranceApi';
import type { Entrance } from '../../types/Entrance';
import './LecturerPage.css';

function LecturerPage() {
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

    useEffect(() => {
        const loadEntrances = async () => {
            try {
                const data =
                    await entranceApi.getAll();

                setAllEntrances(data);
            } finally {
                setLoading(false);
            }
        };

        loadEntrances();
    }, []);

    const buildingEntrances =
        selectedBuildingId === null
            ? []
            : allEntrances.filter(
                (entrance) =>
                    entrance.buildingId ===
                    selectedBuildingId
            );

    const selectedEntrance =
        allEntrances.find(
            (entrance) =>
                entrance.id ===
                selectedEntranceId
        ) ?? null;

    const handleBuildingChange = (
        buildingId: number
    ) => {
        setSelectedBuildingId(buildingId);
        setSelectedEntranceId(null);
        setMessage(null);
    };

    const handleEntranceSelect = (
        entrance: Entrance
    ) => {
        setSelectedEntranceId(
            entrance.id
        );

        setIsOpen(
            entrance.isOpen ?? true
        );

        setOpenFrom(
            entrance.openFrom ?? '07:00'
        );

        setOpenUntil(
            entrance.openUntil ?? '21:00'
        );

        setMessage(null);
    };

    const handleSave = async () => {
        if (!selectedEntrance) {
            return;
        }

        if (
            isOpen &&
            (!openFrom || !openUntil)
        ) {
            setMessage(
                'Uzupełnij godziny otwarcia.'
            );

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
                            isOpen
                                ? openFrom
                                : null,
                        openUntil:
                            isOpen
                                ? openUntil
                                : null,
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

    return (
        <main className="lecturer-page">
            <header className="lecturer-header">
                <div>
                    <span className="lecturer-header__small">
                        Campus Guide WSG
                    </span>

                    <h1>
                        Panel wykładowcy
                    </h1>

                    <p>
                        Zarządzanie statusem wejść do budynków
                    </p>
                </div>

                <Link
                    to="/"
                    className="lecturer-back"
                >
                    ← Mapa kampusu
                </Link>
            </header>

            <section className="lecturer-layout">
                <aside className="lecturer-sidebar">
                    <h2>
                        Budynek
                    </h2>

                    <select
                        className="lecturer-select"
                        value={
                            selectedBuildingId ?? ''
                        }
                        onChange={(event) =>
                            handleBuildingChange(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    >
                        <option value="">
                            Wybierz budynek
                        </option>

                        {buildings.map(
                            (building) => (
                                <option
                                    key={building.id}
                                    value={building.id}
                                >
                                    Budynek {building.code}
                                </option>
                            )
                        )}
                    </select>

                    {loading && (
                        <p className="lecturer-info">
                            Ładowanie...
                        </p>
                    )}

                    {!loading &&
                        selectedBuildingId !== null &&
                        buildingEntrances.length === 0 && (
                            <p className="lecturer-info">
                                Brak danych o wejściach.
                            </p>
                        )}

                    <div className="lecturer-entrance-list">
                        {buildingEntrances.map(
                            (entrance) => (
                                <button
                                    key={entrance.id}
                                    type="button"
                                    className={
                                        selectedEntranceId ===
                                        entrance.id
                                            ? 'lecturer-entrance lecturer-entrance--selected'
                                            : 'lecturer-entrance'
                                    }
                                    onClick={() =>
                                        handleEntranceSelect(
                                            entrance
                                        )
                                    }
                                >
                                    <span
                                        className={
                                            entrance.isOpen === true
                                                ? 'lecturer-dot lecturer-dot--open'
                                                : entrance.isOpen === false
                                                    ? 'lecturer-dot lecturer-dot--closed'
                                                    : 'lecturer-dot lecturer-dot--unknown'
                                        }
                                    />

                                    <div>
                                        <strong>
                                            {entrance.code}
                                        </strong>

                                        <span>
                                            {
                                                entrance.description ??
                                                'Brak opisu'
                                            }
                                        </span>
                                    </div>
                                </button>
                            )
                        )}
                    </div>
                </aside>

                <section className="lecturer-editor">
                    {!selectedEntrance && (
                        <div className="lecturer-empty">
                            <h2>
                                Wybierz wejście
                            </h2>

                            <p>
                                Najpierw wybierz budynek, a następnie wejście.
                            </p>
                        </div>
                    )}

                    {selectedEntrance && (
                        <>
                            <div className="lecturer-editor__header">
                                <div>
                                    <span>
                                        Edycja wejścia
                                    </span>

                                    <h2>
                                        {
                                            selectedEntrance.code
                                        }
                                    </h2>

                                    <p>
                                        {
                                            selectedEntrance.description
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="lecturer-field">
                                <label>
                                    Status wejścia
                                </label>

                                <div className="lecturer-status-buttons">
                                    <button
                                        type="button"
                                        className={
                                            isOpen
                                                ? 'status-button status-button--open status-button--active'
                                                : 'status-button status-button--open'
                                        }
                                        onClick={() =>
                                            setIsOpen(true)
                                        }
                                    >
                                        ● Otwarte
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            !isOpen
                                                ? 'status-button status-button--closed status-button--active'
                                                : 'status-button status-button--closed'
                                        }
                                        onClick={() =>
                                            setIsOpen(false)
                                        }
                                    >
                                        ● Zamknięte
                                    </button>
                                </div>
                            </div>

                            <div className="lecturer-time-row">
                                <div className="lecturer-field">
                                    <label htmlFor="openFrom">
                                        Otwarte od
                                    </label>

                                    <input
                                        id="openFrom"
                                        type="time"
                                        value={openFrom}
                                        disabled={!isOpen}
                                        onChange={(event) =>
                                            setOpenFrom(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="lecturer-field">
                                    <label htmlFor="openUntil">
                                        Otwarte do
                                    </label>

                                    <input
                                        id="openUntil"
                                        type="time"
                                        value={openUntil}
                                        disabled={!isOpen}
                                        onChange={(event) =>
                                            setOpenUntil(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="lecturer-current">
                                <span>
                                    Aktualny podgląd
                                </span>

                                <strong>
                                    {isOpen
                                        ? `Otwarte ${openFrom}–${openUntil}`
                                        : 'Zamknięte'}
                                </strong>
                            </div>

                            {message && (
                                <div className="lecturer-message">
                                    {message}
                                </div>
                            )}
                            <button
                                type="button"
                                className="lecturer-save"
                                disabled={saving}
                                onClick={handleSave}
                            >
                                {saving
                                    ? 'Zapisywanie...'
                                    : 'Zapisz zmiany'}
                            </button>
                            {selectedEntrance.updatedBy && (
                                <p className="lecturer-updated">
                                    Ostatnia zmiana:{' '}
                                    {
                                        selectedEntrance.updatedBy
                                    }
                                </p>
                            )}
                        </>
                    )}
                </section>
            </section>
        </main>
    );
}
export default LecturerPage;