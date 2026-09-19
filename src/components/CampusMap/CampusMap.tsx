import { useEffect } from 'react';

import {
    CircleMarker,
    ImageOverlay,
    MapContainer,
    Tooltip,
    useMap,
} from 'react-leaflet';

import L from 'leaflet';

import { buildings } from '../../mocks/buildings';

import EntranceMarker from '../EntranceMarker/EntranceMarker';

import type { MapPoint } from '../../types/Building';
import type { Entrance } from '../../types/Entrance';

import './CampusMap.css';

const IMAGE_WIDTH = 963;
const IMAGE_HEIGHT = 1280;

const BUILDING_MAX_ZOOM = 0.5;
const BUILDING_PADDING = 180;
const MAP_BOUNDS_PADDING = 300;

const BUILDING_CIRCLE_RADIUS = 14;
const SELECTED_CIRCLE_RADIUS = 18;

const imageBounds = L.latLngBounds(
    [0, 0],
    [IMAGE_HEIGHT, IMAGE_WIDTH]
);

const mapBounds = L.latLngBounds(
    [
        -MAP_BOUNDS_PADDING,
        -MAP_BOUNDS_PADDING,
    ],
    [
        IMAGE_HEIGHT +
        MAP_BOUNDS_PADDING,
        IMAGE_WIDTH +
        MAP_BOUNDS_PADDING,
    ]
);

const BUILDING_LABEL_POSITIONS:
    Record<string, MapPoint> = {
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

function pointToLeaflet(
    point: MapPoint
): L.LatLngTuple {
    const xPx =
        point.x * IMAGE_WIDTH;

    const yPx =
        point.y * IMAGE_HEIGHT;

    return [
        IMAGE_HEIGHT - yPx,
        xPx,
    ];
}

function entranceToLeaflet(
    x: number,
    y: number
): L.LatLngTuple {
    const xPx =
        x * IMAGE_WIDTH;

    const yPx =
        y * IMAGE_HEIGHT;

    return [
        IMAGE_HEIGHT - yPx,
        xPx,
    ];
}

function getPolygonCenter(
    polygon: MapPoint[]
): MapPoint {
    const xValues =
        polygon.map(
            (point) => point.x
        );

    const yValues =
        polygon.map(
            (point) => point.y
        );

    return {
        x:
            (
                Math.min(...xValues) +
                Math.max(...xValues)
            ) / 2,

        y:
            (
                Math.min(...yValues) +
                Math.max(...yValues)
            ) / 2,
    };
}

function getBuildingMarkerPosition(
    buildingCode: string,
    polygon: MapPoint[]
): L.LatLngTuple {
    const position =
        BUILDING_LABEL_POSITIONS[
            buildingCode
            ] ??
        getPolygonCenter(
            polygon
        );

    return pointToLeaflet(
        position
    );
}

function InitialMapView() {
    const map =
        useMap();

    useEffect(() => {
        map.invalidateSize();

        map.fitBounds(
            imageBounds,
            {
                animate: false,
                padding: [30, 30],
            }
        );
    }, [map]);

    return null;
}

interface BuildingZoomProps {
    selectedBuildingId:
        number | null;
}

function BuildingZoom({
                          selectedBuildingId,
                      }: BuildingZoomProps) {
    const map =
        useMap();

    useEffect(() => {
        if (
            selectedBuildingId === null
        ) {
            return;
        }

        const building =
            buildings.find(
                (item) =>
                    item.id ===
                    selectedBuildingId
            );

        if (!building) {
            return;
        }

        const positions =
            building.polygon.map(
                pointToLeaflet
            );

        const bounds =
            L.latLngBounds(
                positions
            );

        map.flyToBounds(
            bounds,
            {
                padding: [
                    BUILDING_PADDING,
                    BUILDING_PADDING,
                ],

                maxZoom:
                BUILDING_MAX_ZOOM,

                duration:
                    0.7,
            }
        );
    }, [
        selectedBuildingId,
        map,
    ]);

    return null;
}

interface ResetMapButtonProps {
    onReset:
        () => void;
}

function ResetMapButton({
                            onReset,
                        }: ResetMapButtonProps) {
    const map =
        useMap();

    const handleReset =
        () => {
            map.flyToBounds(
                imageBounds,
                {
                    padding: [
                        30,
                        30,
                    ],

                    duration:
                        0.7,
                }
            );

            onReset();
        };

    return (
        <button
            type="button"
            className="reset-map-button"
            onClick={
                handleReset
            }
        >
            Pokaż cały kampus
        </button>
    );
}

interface CampusMapProps {
    selectedBuildingId:
        number | null;

    recommendedEntranceId:
        number | null;

    entrances:
        Entrance[];

    onBuildingSelect:
        (
            id:
                number | null
        ) => void;
}

function CampusMap({
                       selectedBuildingId,
                       recommendedEntranceId,
                       entrances,
                       onBuildingSelect,
                   }: CampusMapProps) {
    const visibleEntrances =
        selectedBuildingId === null
            ? []
            : entrances.filter(
                (entrance) =>
                    entrance.buildingId ===
                    selectedBuildingId
            );

    return (
        <div className="campus-map-wrapper">
            <MapContainer
                crs={L.CRS.Simple}
                center={
                    imageBounds.getCenter()
                }
                zoom={0}
                minZoom={-3}
                maxZoom={4}
                zoomSnap={0.25}
                zoomDelta={0.25}
                scrollWheelZoom={true}
                maxBounds={
                    mapBounds
                }
                maxBoundsViscosity={
                    0.8
                }
                className="campus-map"
            >
                <InitialMapView />

                <BuildingZoom
                    selectedBuildingId={
                        selectedBuildingId
                    }
                />

                <ImageOverlay
                    url="/maps/campus-map.jpg"
                    bounds={
                        imageBounds
                    }
                />

                {buildings.map(
                    (building) => {
                        const center =
                            getBuildingMarkerPosition(
                                building.code,
                                building.polygon
                            );

                        const isSelected =
                            selectedBuildingId ===
                            building.id;

                        return (
                            <CircleMarker
                                key={
                                    building.id
                                }
                                center={
                                    center
                                }
                                radius={
                                    isSelected
                                        ? SELECTED_CIRCLE_RADIUS
                                        : BUILDING_CIRCLE_RADIUS
                                }
                                pathOptions={{
                                    color:
                                        isSelected
                                            ? '#dc2626'
                                            : '#2563eb',

                                    fillColor:
                                        isSelected
                                            ? '#dc2626'
                                            : '#2563eb',

                                    weight:
                                        isSelected
                                            ? 4
                                            : 3,

                                    fillOpacity:
                                        isSelected
                                            ? 0.30
                                            : 0.12,
                                }}
                                eventHandlers={{
                                    click: () => {
                                        if (
                                            selectedBuildingId ===
                                            building.id
                                        ) {
                                            onBuildingSelect(
                                                null
                                            );

                                            return;
                                        }

                                        onBuildingSelect(
                                            building.id
                                        );
                                    },
                                }}
                            >
                                <Tooltip>
                                    <strong>
                                        Budynek {
                                        building.code
                                    }
                                    </strong>
                                </Tooltip>
                            </CircleMarker>
                        );
                    }
                )}

                {visibleEntrances.map(
                    (entrance) => (
                        <EntranceMarker
                            key={
                                entrance.id
                            }
                            entrance={
                                entrance
                            }
                            position={
                                entranceToLeaflet(
                                    entrance.x,
                                    entrance.y
                                )
                            }
                            isRecommended={
                                entrance.id ===
                                recommendedEntranceId
                            }
                        />
                    )
                )}

                <ResetMapButton
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