import { useEffect, useState } from 'react';
import {
    CircleMarker,
    ImageOverlay,
    MapContainer,
    Tooltip,
    useMap,
} from 'react-leaflet';

import { CRS } from 'leaflet';
import type {
    LatLngBoundsExpression,
    LatLngExpression,
} from 'leaflet';

import { buildings } from '../../mocks/buildings';
import { authApi } from '../../services/authApi';

import type { User } from '../../types/User';
import type { Entrance } from '../../types/Entrance';
import type { MapPoint } from '../../types/Building';

import EntranceMarker from '../EntranceMarker/EntranceMarker';

import './CampusMap.css';

const IMAGE_WIDTH = 963;
const IMAGE_HEIGHT = 1280;
const IMAGE_URL = '/maps/campus-map.jpg';

const imageBounds: LatLngBoundsExpression = [
    [0, 0],
    [IMAGE_HEIGHT, IMAGE_WIDTH],
];

const mapBounds: LatLngBoundsExpression = [
    [-300, -300],
    [IMAGE_HEIGHT + 300, IMAGE_WIDTH + 300],
];

const BUILDING_LABEL_POSITIONS: Record<string, MapPoint> = {
    A: { x: 0.789, y: 0.593 },
    B: { x: 0.661, y: 0.583 },
    C: { x: 0.587, y: 0.587 },
    D: { x: 0.729, y: 0.475 },
    E: { x: 0.375, y: 0.403 },
    G: { x: 0.533, y: 0.714 },
    H: { x: 0.597, y: 0.701 },
    K: { x: 0.193, y: 0.375 },
    L: { x: 0.197, y: 0.214 },
    M: { x: 0.354, y: 0.546 },
};

interface Props {
    selectedBuildingId: number | null;
    recommendedEntranceId: number | null;
    entrances: Entrance[];
    onBuildingSelect: (buildingId: number | null) => void;
}

function pointToLatLng(point: MapPoint): LatLngExpression {
    return [
        IMAGE_HEIGHT * (1 - point.y),
        IMAGE_WIDTH * point.x,
    ];
}

function InitialMapView() {
    const map = useMap();

    useEffect(() => {
        map.fitBounds(imageBounds, {
            padding: [30, 30],
        });
    }, [map]);

    return null;
}

function MapResetButton({
                            onReset,
                        }: {
    onReset: () => void;
}) {
    const map = useMap();

    const handleReset = () => {
        map.flyToBounds(imageBounds, {
            padding: [30, 30],
        });

        onReset();
    };

    return (
        <button
            type="button"
            className="campus-map__reset"
            onClick={handleReset}
        >
            Pokaż cały kampus
        </button>
    );
}

function CampusMap({
                       selectedBuildingId,
                       recommendedEntranceId,
                       entrances,
                       onBuildingSelect,
                   }: Props) {
    const [currentUser, setCurrentUser] =
        useState<User | null>(null);

    useEffect(() => {
        authApi
            .getCurrentUser()
            .then(setCurrentUser);
    }, []);

    const selectedEntrances =
        selectedBuildingId === null
            ? []
            : entrances.filter(
                (entrance) =>
                    entrance.buildingId ===
                    selectedBuildingId
            );

    const hasAccess = (
        buildingId: number
    ) => {
        // Student / gość
        if (!currentUser) {
            return true;
        }

        // Admin ma dostęp do wszystkiego
        if (
            currentUser.role ===
            'admin'
        ) {
            return true;
        }

        // Wykładowca tylko do przypisanych budynków
        return currentUser
            .assignedBuildingIds
            .includes(buildingId);
    };

    const getBuildingColor = (
        buildingId: number
    ) => {
        // Wybrany budynek zawsze czerwony
        if (
            selectedBuildingId ===
            buildingId
        ) {
            return '#ef4444';
        }

        // Student / gość
        if (!currentUser) {
            return '#2563eb';
        }

        // Administrator
        if (
            currentUser.role ===
            'admin'
        ) {
            return '#22c55e';
        }

        // Wykładowca
        if (
            hasAccess(buildingId)
        ) {
            return '#22c55e';
        }

        return '#9ca3af';
    };

    const handleBuildingClick = (
        buildingId: number
    ) => {
        // Wykładowca nie może wybrać
        // nieprzypisanego budynku
        if (
            currentUser?.role ===
            'lecturer' &&
            !hasAccess(buildingId)
        ) {
            return;
        }

        if (
            selectedBuildingId ===
            buildingId
        ) {
            onBuildingSelect(null);
            return;
        }

        onBuildingSelect(buildingId);
    };

    return (
        <div className="campus-map">
            <MapContainer
                crs={CRS.Simple}
                bounds={imageBounds}
                maxBounds={mapBounds}
                maxBoundsViscosity={0.8}
                minZoom={-1.5}
                maxZoom={2}
                zoomControl
                attributionControl={false}
            >
                <InitialMapView />

                <ImageOverlay
                    url={IMAGE_URL}
                    bounds={imageBounds}
                />

                {buildings.map(
                    (building) => {
                        const point =
                            BUILDING_LABEL_POSITIONS[
                                building.code
                                ];

                        if (!point) {
                            return null;
                        }

                        const access =
                            hasAccess(
                                building.id
                            );

                        const color =
                            getBuildingColor(
                                building.id
                            );

                        return (
                            <CircleMarker
                                key={
                                    building.id
                                }
                                center={
                                    pointToLatLng(
                                        point
                                    )
                                }
                                radius={
                                    selectedBuildingId ===
                                    building.id
                                        ? 18
                                        : 14
                                }
                                pathOptions={{
                                    color,
                                    fillColor:
                                    color,
                                    fillOpacity:
                                        currentUser?.role ===
                                        'lecturer' &&
                                        !access
                                            ? 0.35
                                            : 0.85,
                                    weight: 3,
                                }}
                                eventHandlers={{
                                    click: () =>
                                        handleBuildingClick(
                                            building.id
                                        ),
                                }}
                            >
                                <Tooltip>
                                    <strong>
                                        Budynek{' '}
                                        {
                                            building.code
                                        }
                                    </strong>

                                    {currentUser?.role ===
                                        'lecturer' &&
                                        !access && (
                                            <>
                                                <br />
                                                Brak dostępu
                                            </>
                                        )}
                                </Tooltip>
                            </CircleMarker>
                        );
                    }
                )}

                {selectedEntrances.map(
                    (entrance) => (
                        <EntranceMarker
                            key={
                                entrance.id
                            }
                            entrance={
                                entrance
                            }
                            position={
                                pointToLatLng(
                                    {
                                        x:
                                        entrance.x,
                                        y:
                                        entrance.y,
                                    }
                                )
                            }
                            isRecommended={
                                entrance.id ===
                                recommendedEntranceId
                            }
                        />
                    )
                )}

                <MapResetButton
                    onReset={() =>
                        onBuildingSelect(
                            null
                        )
                    }
                />
            </MapContainer>
        </div>
    );
}

export default CampusMap;