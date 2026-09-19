import type { SearchResult } from '../../types/Search';
import type { Entrance } from '../../types/Entrance';
import './DetailsPanel.css';

interface DetailsPanelProps {
    result: SearchResult | null;
    entrances: Entrance[];
    onClose: () => void;
}

function DetailsPanel({
                          result,
                          entrances,
                          onClose,
                      }: DetailsPanelProps) {
    if (!result) {
        return null;
    }

    const getStatus = (entrance: Entrance) => {
        if (entrance.isOpen === true) {
            return {
                text: 'Otwarte',
                className: 'open',
            };
        }

        if (entrance.isOpen === false) {
            return {
                text: 'Zamknięte',
                className: 'closed',
            };
        }

        return {
            text: 'Brak danych',
            className: 'unknown',
        };
    };

    const getHours = (entrance: Entrance) => {
        if (
            entrance.openFrom &&
            entrance.openUntil
        ) {
            return `${entrance.openFrom} – ${entrance.openUntil}`;
        }

        return 'Brak danych o godzinach';
    };

    return (
        <div className="details-panel">
            <div className="details-panel__header">
                <div>
                    <span className="details-panel__label">
                        Wybrana lokalizacja
                    </span>

                    <h2>
                        Budynek {result.buildingCode}
                    </h2>
                </div>

                <button
                    type="button"
                    className="details-panel__close"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            {result.type === 'building' && (
                <p className="details-panel__description">
                    Wybrano budynek{' '}
                    <strong>
                        {result.buildingCode}
                    </strong>.
                </p>
            )}

            {result.type === 'room' && (
                <div className="details-panel__room">
                    <div className="details-panel__row">
                        <span>Sala</span>

                        <strong>
                            {result.number}
                        </strong>
                    </div>

                    <div className="details-panel__row">
                        <span>Piętro</span>

                        <strong>
                            {result.floorLabel ?? 'Brak danych'}
                        </strong>
                    </div>
                </div>
            )}

            <div className="details-panel__entrances">
                <h3>
                    Wejścia
                </h3>

                {entrances.length === 0 ? (
                    <div className="details-panel__empty">
                        Brak danych o wejściach.
                    </div>
                ) : (
                    <div className="entrance-list">
                        {entrances.map((entrance) => {
                            const status =
                                getStatus(entrance);

                            return (
                                <div
                                    key={entrance.id}
                                    className="entrance-item"
                                >
                                    <div className="entrance-item__main">
                                        <span
                                            className={
                                                `entrance-status entrance-status--${status.className}`
                                            }
                                        />

                                        <div className="entrance-item__info">
                                            <strong>
                                                {entrance.code}
                                            </strong>

                                            <span className="entrance-item__description">
                                                {entrance.description ?? 'Brak opisu'}
                                            </span>

                                            <span className="entrance-item__hours">
                                                🕒 {getHours(entrance)}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={
                                            `entrance-item__status entrance-item__status--${status.className}`
                                        }
                                    >
                                        {status.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {entrances.length > 0 && (
                    <div className="details-panel__warning">
                        Statusy wejść są obecnie danymi demonstracyjnymi.
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailsPanel;