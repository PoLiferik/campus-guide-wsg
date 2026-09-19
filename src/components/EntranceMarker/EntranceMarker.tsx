import { CircleMarker, Tooltip } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

import type { Entrance } from '../../types/Entrance';

interface EntranceMarkerProps {
    entrance: Entrance;
    position: LatLngExpression;
    isRecommended: boolean;
}

const DEFAULT_COLORS = {
    fillColor: '#9ca3af',
    borderColor: '#6b7280',
    statusText: 'Brak danych',
};

const getEntranceVisualState = (isOpen: Entrance['isOpen']) => {
    if (isOpen === true) {
        return {
            fillColor: '#22c55e',
            borderColor: '#15803d',
            statusText: 'Otwarte',
        };
    }

    if (isOpen === false) {
        return {
            fillColor: '#ef4444',
            borderColor: '#b91c1c',
            statusText: 'Zamknięte',
        };
    }

    return DEFAULT_COLORS;
};

function EntranceMarker({ entrance, position, isRecommended }: EntranceMarkerProps) {
    const visualState = getEntranceVisualState(entrance.isOpen);
    const borderColor = isRecommended ? '#f59e0b' : visualState.borderColor;
    const radius = isRecommended ? 12 : 8;
    const weight = isRecommended ? 5 : 3;
    const description = entrance.description ?? 'Brak opisu';

    return (
        <CircleMarker
            center={position}
            radius={radius}
            pathOptions={{
                color: borderColor,
                fillColor: visualState.fillColor,
                weight,
                fillOpacity: 1,
            }}
        >
            <Tooltip>
                <div>
                    {isRecommended && (
                        <>
                            <strong>★ Zalecane wejście</strong>
                            <br />
                        </>
                    )}

                    <strong>Wejście {entrance.code}</strong>
                    <br />
                    {description}
                    <br />
                    Status: {visualState.statusText}
                    <br />
                    <small>Dane demonstracyjne</small>
                </div>
            </Tooltip>
        </CircleMarker>
    );
}

export default EntranceMarker;