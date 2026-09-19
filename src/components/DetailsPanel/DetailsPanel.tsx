import { useEffect, useState } from 'react';

import type { SearchResult } from '../../types/Search';
import type { Entrance } from '../../types/Entrance';
import type { User } from '../../types/User';

import { authApi } from '../../services/authApi';
import { entranceApi } from '../../services/entranceApi';

import './DetailsPanel.css';

interface Props {
    result: SearchResult;
    entrances: Entrance[];
    onClose: () => void;
}

function DetailsPanel({
                          result,
                          entrances,
                          onClose,
                      }: Props) {
    const [currentUser, setCurrentUser] =
        useState<User | null>(null);

    const [localEntrances, setLocalEntrances] =
        useState<Entrance[]>(entrances);

    useEffect(() => {
        setLocalEntrances(entrances);
    }, [entrances]);

    useEffect(() => {
        authApi
            .getCurrentUser()
            .then(setCurrentUser);
    }, []);

    const canEditEntrance = (
        entrance: Entrance
    ) => {
        if (!currentUser) {
            return false;
        }

        if (currentUser.role === 'admin') {
            return true;
        }

        if (
            currentUser.role === 'lecturer'
        ) {
            return currentUser
                .assignedBuildingIds
                .includes(
                    entrance.buildingId
                );
        }

        return false;
    };

    const handleEntranceUpdated = (
        updated: Entrance
    ) => {
        setLocalEntrances(
            (current) =>
                current.map(
                    (entrance) =>
                        entrance.id ===
                        updated.id
                            ? updated
                            : entrance
                )
        );
    };

    return (
        <section className="details-panel">
            <div className="details-panel__header">
                <div>
                    <span className="details-panel__label">
                        Wybrana lokalizacja
                    </span>

                    <h2>
                        {result.type === 'room'
                            ? `Sala ${result.number}`
                            : `Budynek ${result.buildingCode}`}
                    </h2>
                </div>

                <button
                    type="button"
                    className="details-panel__close"
                    onClick={onClose}
                    aria-label="Zamknij"
                >
                    ×
                </button>
            </div>

            {result.type === 'room' ? (
                <div className="details-panel__info">
                    <p>
                        <strong>
                            Budynek:
                        </strong>{' '}
                        {result.buildingCode}
                    </p>

                    <p>
                        <strong>
                            Sala:
                        </strong>{' '}
                        {result.number}
                    </p>

                    {result.floorLabel && (
                        <p>
                            <strong>
                                Piętro:
                            </strong>{' '}
                            {
                                result.floorLabel
                            }
                        </p>
                    )}
                </div>
            ) : (
                <p className="details-panel__description">
                    Wybrano budynek{' '}
                    <strong>
                        {result.buildingCode}
                    </strong>
                    .
                </p>
            )}

            <div className="details-panel__separator" />

            <div className="details-panel__section">
                <h3>
                    Wejścia
                </h3>

                {localEntrances.length ===
                0 ? (
                    <div className="details-panel__empty">
                        Brak danych o wejściach.
                    </div>
                ) : (
                    <div className="entrance-list">
                        {localEntrances.map(
                            (entrance) => (
                                <EntranceCard
                                    key={
                                        entrance.id
                                    }
                                    entrance={
                                        entrance
                                    }
                                    canEdit={
                                        canEditEntrance(
                                            entrance
                                        )
                                    }
                                    onUpdated={
                                        handleEntranceUpdated
                                    }
                                />
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="details-panel__warning">
                Statusy wejść są obecnie
                danymi demonstracyjnymi.
            </div>
        </section>
    );
}

interface EntranceCardProps {
    entrance: Entrance;
    canEdit: boolean;
    onUpdated: (
        entrance: Entrance
    ) => void;
}

function EntranceCard({
                          entrance,
                          canEdit,
                          onUpdated,
                      }: EntranceCardProps) {
    const [status, setStatus] =
        useState<
            'open' |
            'closed' |
            'unknown'
        >(
            entrance.isOpen === true
                ? 'open'
                : entrance.isOpen === false
                    ? 'closed'
                    : 'unknown'
        );

    const [openFrom, setOpenFrom] =
        useState(
            entrance.openFrom ??
            ''
        );

    const [openUntil, setOpenUntil] =
        useState(
            entrance.openUntil ??
            ''
        );

    const [editing, setEditing] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState<string | null>(
            null
        );

    useEffect(() => {
        setStatus(
            entrance.isOpen === true
                ? 'open'
                : entrance.isOpen === false
                    ? 'closed'
                    : 'unknown'
        );

        setOpenFrom(
            entrance.openFrom ??
            ''
        );

        setOpenUntil(
            entrance.openUntil ??
            ''
        );
    }, [entrance]);

    const getStatusText =
        () => {
            if (
                entrance.isOpen === true
            ) {
                return 'Otwarte';
            }

            if (
                entrance.isOpen === false
            ) {
                return 'Zamknięte';
            }

            return 'Brak danych';
        };

    const getStatusClass =
        () => {
            if (
                entrance.isOpen === true
            ) {
                return 'entrance-status entrance-status--open';
            }

            if (
                entrance.isOpen === false
            ) {
                return 'entrance-status entrance-status--closed';
            }

            return 'entrance-status entrance-status--unknown';
        };

    const getHours =
        () => {
            if (
                entrance.openFrom &&
                entrance.openUntil
            ) {
                return `${entrance.openFrom} – ${entrance.openUntil}`;
            }

            return 'Brak danych o godzinach';
        };

    const handleCancel =
        () => {
            setStatus(
                entrance.isOpen === true
                    ? 'open'
                    : entrance.isOpen === false
                        ? 'closed'
                        : 'unknown'
            );

            setOpenFrom(
                entrance.openFrom ??
                ''
            );

            setOpenUntil(
                entrance.openUntil ??
                ''
            );

            setMessage(null);
            setEditing(false);
        };

    const handleSave =
        async () => {
            if (
                status === 'unknown'
            ) {
                setMessage(
                    'Wybierz Otwarte lub Zamknięte.'
                );

                return;
            }

            if (
                !openFrom ||
                !openUntil
            ) {
                setMessage(
                    'Podaj godziny od i do.'
                );

                return;
            }

            try {
                setSaving(true);
                setMessage(null);

                const updated =
                    await entranceApi
                        .updateStatus(
                            entrance.id,
                            {
                                isOpen:
                                    status ===
                                    'open',

                                openFrom,
                                openUntil,
                            }
                        );

                onUpdated(updated);

                setEditing(false);
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
        <article className="entrance-item">
            <div className="entrance-item__top">
                <div className="entrance-item__main">
                    <span
                        className={
                            entrance.isOpen ===
                            true
                                ? 'entrance-dot entrance-dot--open'
                                : entrance.isOpen ===
                                false
                                    ? 'entrance-dot entrance-dot--closed'
                                    : 'entrance-dot entrance-dot--unknown'
                        }
                    />

                    <div className="entrance-item__info">
                        <strong>
                            {entrance.code}
                        </strong>

                        <span>
                            {entrance.description ??
                                'Brak opisu'}
                        </span>

                        {!editing && (
                            <span className="entrance-item__hours">
                                🕒 {getHours()}
                            </span>
                        )}
                    </div>
                </div>

                <span
                    className={
                        getStatusClass()
                    }
                >
                    {getStatusText()}
                </span>
            </div>

            {canEdit && !editing && (
                <button
                    type="button"
                    className="entrance-edit-button"
                    onClick={() =>
                        setEditing(true)
                    }
                >
                    Edytuj status i godziny
                </button>
            )}

            {canEdit && editing && (
                <div className="entrance-editor">
                    <div className="entrance-editor__status">
                        <button
                            type="button"
                            className={
                                status ===
                                'open'
                                    ? 'entrance-editor__status-button entrance-editor__status-button--open'
                                    : 'entrance-editor__status-button'
                            }
                            onClick={() =>
                                setStatus(
                                    'open'
                                )
                            }
                        >
                            ● Otwarte
                        </button>

                        <button
                            type="button"
                            className={
                                status ===
                                'closed'
                                    ? 'entrance-editor__status-button entrance-editor__status-button--closed'
                                    : 'entrance-editor__status-button'
                            }
                            onClick={() =>
                                setStatus(
                                    'closed'
                                )
                            }
                        >
                            ● Zamknięte
                        </button>
                    </div>

                    <div className="entrance-editor__hours">
                        <label>
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

                        <label>
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

                    {message && (
                        <div className="entrance-editor__error">
                            {message}
                        </div>
                    )}

                    <div className="entrance-editor__actions">
                        <button
                            type="button"
                            className="entrance-editor__cancel"
                            onClick={
                                handleCancel
                            }
                        >
                            Anuluj
                        </button>

                        <button
                            type="button"
                            className="entrance-editor__save"
                            disabled={
                                saving
                            }
                            onClick={
                                handleSave
                            }
                        >
                            {saving
                                ? 'Zapisywanie...'
                                : 'Zapisz'}
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
}

export default DetailsPanel;