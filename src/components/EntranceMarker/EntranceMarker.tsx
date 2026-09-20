import { divIcon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';

import type {
    Entrance,
    EntranceDirection,
} from '../../types/Entrance';

import './EntranceMarker.css';

interface Props {
    entrance: Entrance;
    position: LatLngExpression;
    isRecommended: boolean;
}

function EntranceMarker({
                            entrance,
                            position,
                            isRecommended,
                        }: Props) {
    const statusClass =
        entrance.isOpen === true
            ? 'entrance-arrow--open'
            : entrance.isOpen === false
                ? 'entrance-arrow--closed'
                : 'entrance-arrow--unknown';

    const recommendedClass =
        isRecommended
            ? 'entrance-arrow--recommended'
            : '';

    const direction: EntranceDirection =
        entrance.direction ?? 'right';

    const icon = divIcon({
        className: 'entrance-arrow-wrapper',
        html: `
            <div class="
                entrance-arrow
                ${statusClass}
                ${recommendedClass}
                entrance-arrow--${direction}
            ">
                <div class="entrance-arrow__shaft"></div>
                <div class="entrance-arrow__head"></div>
            </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });

    const getStatusText = () => {
        if (entrance.isOpen === true) {
            return 'Otwarte';
        }

        if (entrance.isOpen === false) {
            return 'Zamknięte';
        }

        return 'Brak danych';
    };

    const getHoursText = () => {
        if (
            entrance.openFrom &&
            entrance.openUntil
        ) {
            return `${entrance.openFrom} – ${entrance.openUntil}`;
        }

        return 'Brak danych o godzinach';
    };

    return (
        <Marker
            position={position}
            icon={icon}
        >
            <Tooltip
                direction="top"
                offset={[0, -8]}
            >
                <div>
                    <strong>
                        {entrance.code}
                    </strong>

                    <br />

                    {entrance.description ??
                        'Wejście'}

                    <br />

                    {getStatusText()}

                    <br />

                    {getHoursText()}
                </div>
            </Tooltip>
        </Marker>
    );
}

export default EntranceMarker;