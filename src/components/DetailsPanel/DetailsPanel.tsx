import type {SearchResult} from '../../types/Search';
import type {Entrance} from '../../types/Entrance';

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
    const buildingEntrances =
        entrances.filter(
            (entrance) =>
                entrance.buildingId ===
                result.buildingId
        );

    const title =
        result.type === 'room' &&
        result.number
            ? `Sala ${result.number}`
            : `Budynek ${result.buildingCode}`;

    return (
        <aside className="details-panel">
            <div className="details-panel__header">
                <div>
                    <span>
                        Wybrana lokalizacja
                    </span>

                    <h2>
                        {title}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Zamknij"
                >
                    ×
                </button>
            </div>

            <div className="details-panel__content">
                <div className="details-panel__row">
                    <span>
                        Budynek
                    </span>

                    <strong>
                        {result.buildingCode}
                    </strong>
                </div>

                {result.type === 'room' &&
                    result.number && (
                        <>
                            <div className="details-panel__row">
                                <span>
                                    Sala
                                </span>

                                <strong>
                                    {result.number}
                                </strong>
                            </div>

                            {result.floorLabel && (
                                <div className="details-panel__row">
                                    <span>
                                        Piętro
                                    </span>

                                    <strong>
                                        {result.floorLabel}
                                    </strong>
                                </div>
                            )}
                        </>
                    )}

                {buildingEntrances.length > 0 && (
                    <div className="details-panel__entrances">
                        <h3>
                            Wejścia
                        </h3>

                        {buildingEntrances.map(
                            (entrance) => (
                                <div
                                    key={entrance.id}
                                    className="details-panel__entrance"
                                >
                                    <div>
                                        <strong>
                                            {entrance.code}
                                        </strong>

                                        {entrance.description && (
                                            <span>
                                                {entrance.description}
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className={[
                                            'details-panel__entrance-status',

                                            entrance.isOpen === true
                                                ? 'details-panel__entrance-status--open'
                                                : entrance.isOpen === false
                                                    ? 'details-panel__entrance-status--closed'
                                                    : 'details-panel__entrance-status--unknown',
                                        ].join(' ')}
                                    >
                                        {entrance.isOpen === true
                                            ? 'Otwarte'
                                            : entrance.isOpen === false
                                                ? 'Zamknięte'
                                                : 'Brak danych'}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}

export default DetailsPanel;