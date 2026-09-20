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

const IMAGE_URL =
    '/maps/campus-map.jpg';

const imageBounds: LatLngBoundsExpression = [
    [0, 0],
    [IMAGE_HEIGHT, IMAGE_WIDTH],
];

/*
    Dokładne środki czarnych oznaczeń
    budynków na mapie.
*/
const BUILDING_LABEL_POSITIONS:
    Record<string, MapPoint> = {
    A: {
        x: 0.7889,
        y: 0.5950,
    },

    B: {
        x: 0.6610,
        y: 0.5809,
    },

    C: {
        x: 0.5878,
        y: 0.5849,
    },

    D: {
        x: 0.7285,
        y: 0.4745,
    },

    E: {
        x: 0.3754,
        y: 0.4050,
    },

    G: {
        x: 0.5319,
        y: 0.7130,
    },

    H: {
        x: 0.5967,
        y: 0.7018,
    },

    K: {
        x: 0.1928,
        y: 0.3765,
    },

    L: {
        x: 0.2000,
        y: 0.2128,
    },

    M: {
        x: 0.3535,
        y: 0.5490,
    },
};

interface Props {
    selectedBuildingId:
        number | null;

    recommendedEntranceId:
        number | null;

    entrances:
        Entrance[];

    onBuildingSelect:
        (
            buildingId:
                number | null
        ) => void;
}

function pointToLatLng(
    point: MapPoint
): LatLngExpression {
    return [
        IMAGE_HEIGHT *
        (1 - point.y),

        IMAGE_WIDTH *
        point.x,
    ];
}

function InitialMapView() {
    const map = useMap();

    useEffect(() => {
        map.fitBounds(
            imageBounds,
            {
                padding: [
                    30,
                    30,
                ],
            }
        );
    }, [map]);

    return null;
}

function CampusMap({
                       selectedBuildingId,
                       recommendedEntranceId,
                       entrances,
                       onBuildingSelect,
                   }: Props) {
    const [
        currentUser,
        setCurrentUser
    ] =
        useState<User | null>(
            null
        );

    useEffect(() => {
        void authApi
            .getCurrentUser()
            .then(
                setCurrentUser
            );
    }, []);

    const selectedEntrances =
        selectedBuildingId ===
        null
            ? []
            : entrances.filter(
                (entrance) =>
                    entrance.buildingId ===
                    selectedBuildingId
            );

    function hasEditAccess(
        buildingId: number
    ) {
        if (!currentUser) {
            return false;
        }

        if (
            currentUser.role ===
            'admin'
        ) {
            return true;
        }

        if (
            currentUser.role ===
            'lecturer'
        ) {
            return currentUser
                .assignedBuildingIds
                .includes(
                    buildingId
                );
        }

        return false;
    }

    function getBuildingColor(
        buildingId: number
    ) {
        /*
            Wybrany budynek:
            tylko zmiana koloru.
            Rozmiar się NIE zmienia.
        */
        if (
            selectedBuildingId ===
            buildingId
        ) {
            return '#ef4444';
        }

        /*
            Student / niezalogowany.
        */
        if (!currentUser) {
            return '#2563eb';
        }

        /*
            Administrator:
            wszystkie budynki zielone.
        */
        if (
            currentUser.role ===
            'admin'
        ) {
            return '#22c55e';
        }

        /*
            Wykładowca:
            przypisane = zielone,
            pozostałe = niebieskie.
        */
        if (
            hasEditAccess(
                buildingId
            )
        ) {
            return '#22c55e';
        }

        return '#2563eb';
    }

    function handleBuildingClick(
        buildingId: number
    ) {
        if (
            selectedBuildingId ===
            buildingId
        ) {
            onBuildingSelect(
                null
            );

            return;
        }

        onBuildingSelect(
            buildingId
        );
    }

    return (
        <div className="campus-map">
            <MapContainer
                crs={CRS.Simple}
                bounds={imageBounds}

                minZoom={-1.5}
                maxZoom={2}

                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                boxZoom={false}
                keyboard={false}

                zoomControl={false}
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

                        const color =
                            getBuildingColor(
                                building.id
                            );

                        const canEdit =
                            hasEditAccess(
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

                                /*
                                    Jeden rozmiar dla KAŻDEGO
                                    budynku, także wybranego.
                                */
                                radius={17}

                                pathOptions={{
                                    color,

                                    fill: true,
                                    fillColor: color,

                                    /*
                                        Przezroczysty środek,
                                        ale całość nadal klikalna.
                                    */
                                    fillOpacity: 0,

                                    opacity: 1,

                                    /*
                                        Stała grubość.
                                    */
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
                                        'lecturer' && (
                                            <>
                                                <br />

                                                {canEdit
                                                    ? 'Możesz zarządzać tym budynkiem'
                                                    : 'Tylko podgląd'}
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
                                pointToLatLng({
                                    x:
                                    entrance.x,

                                    y:
                                    entrance.y,
                                })
                            }

                            isRecommended={
                                entrance.id ===
                                recommendedEntranceId
                            }
                        />
                    )
                )}
            </MapContainer>
        </div>
    );
}

export default CampusMap;