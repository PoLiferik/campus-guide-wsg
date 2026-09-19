import {
    useEffect,
    useState,
} from 'react';

import CampusMap from '../components/CampusMap/CampusMap';
import SearchBar from '../components/SearchBar/SearchBar';
import SearchResults from '../components/SearchResults/SearchResults';
import DetailsPanel from '../components/DetailsPanel/DetailsPanel';

import { campusApi } from '../services/campusApi';
import { entranceApi } from '../services/entranceApi';

import { buildings } from '../mocks/buildings';

import type { SearchResult } from '../types/Search';
import type { RoomDetails } from '../types/Room';
import type { Entrance } from '../types/Entrance';

import './CampusPage.css';

function CampusPage() {
    const [
        selectedBuildingId,
        setSelectedBuildingId
    ] = useState<number | null>(null);

    const [
        selectedResult,
        setSelectedResult
    ] = useState<SearchResult | null>(null);

    const [
        roomDetails,
        setRoomDetails
    ] = useState<RoomDetails | null>(null);

    const [
        searchResults,
        setSearchResults
    ] = useState<SearchResult[]>([]);

    const [
        allEntrances,
        setAllEntrances
    ] = useState<Entrance[]>([]);

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState<string | null>(null);

    const [
        searched,
        setSearched
    ] = useState(false);

    useEffect(() => {
        const loadEntrances = async () => {
            try {
                const data =
                    await entranceApi.getAll();

                setAllEntrances(data);
            } catch (error) {
                console.error(
                    'Nie udało się pobrać wejść:',
                    error
                );
            }
        };

        loadEntrances();
    }, []);

    const selectedEntrances =
        selectedBuildingId === null
            ? []
            : allEntrances.filter(
                (entrance) =>
                    entrance.buildingId ===
                    selectedBuildingId
            );

    const recommendedEntranceId =
        roomDetails?.recommendedEntranceId ??
        null;

    const handleSearch = async (
        query: string
    ) => {
        try {
            setLoading(true);
            setError(null);
            setSearched(false);

            setSelectedBuildingId(null);
            setSelectedResult(null);
            setRoomDetails(null);
            setSearchResults([]);

            const response =
                await campusApi.search(query);

            setSearchResults(
                response.items
            );

            setSearched(true);
        } catch (error) {
            console.error(error);

            setSearchResults([]);
            setSearched(true);

            setError(
                'Nie można pobrać danych. Spróbuj ponownie.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResultSelect = async (
        result: SearchResult
    ) => {
        setSelectedBuildingId(
            result.buildingId
        );

        setSelectedResult(
            result
        );

        setSearchResults([]);
        setSearched(false);
        setRoomDetails(null);

        if (result.type === 'room') {
            try {
                const details =
                    await campusApi.getRoom(
                        result.id
                    );

                setRoomDetails(
                    details
                );
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleBuildingSelect = (
        buildingId: number | null
    ) => {
        setRoomDetails(null);
        setSearchResults([]);
        setSearched(false);

        if (buildingId === null) {
            setSelectedBuildingId(null);
            setSelectedResult(null);

            return;
        }

        const building =
            buildings.find(
                (item) =>
                    item.id === buildingId
            );

        if (!building) {
            return;
        }

        setSelectedBuildingId(
            building.id
        );

        setSelectedResult({
            type: 'building',
            id: building.id,
            buildingId: building.id,
            buildingCode: building.code,
        });
    };

    const handleCloseDetails = () => {
        setSelectedBuildingId(null);
        setSelectedResult(null);
        setRoomDetails(null);
        setSearchResults([]);
        setSearched(false);
    };

    return (
        <main className="campus-page">
            <CampusMap
                selectedBuildingId={
                    selectedBuildingId
                }
                recommendedEntranceId={
                    recommendedEntranceId
                }
                entrances={
                    allEntrances
                }
                onBuildingSelect={
                    handleBuildingSelect
                }
            />

            <div className="campus-page__overlay">
                <div className="campus-page__header">
                    <h1>
                        Campus Guide WSG
                    </h1>

                    <p>
                        Znajdź budynek lub salę
                    </p>
                </div>

                <SearchBar
                    onSearch={
                        handleSearch
                    }
                />

                <SearchResults
                    results={
                        searchResults
                    }
                    loading={
                        loading
                    }
                    error={
                        error
                    }
                    searched={
                        searched
                    }
                    onSelect={
                        handleResultSelect
                    }
                />

                <DetailsPanel
                    result={
                        selectedResult
                    }
                    entrances={
                        selectedEntrances
                    }
                    onClose={
                        handleCloseDetails
                    }
                />

                {roomDetails &&
                    recommendedEntranceId && (
                        <div className="recommended-entrance">
                            <strong>
                                ★ Zalecane wejście:{' '}
                            </strong>

                            {
                                selectedEntrances.find(
                                    (entrance) =>
                                        entrance.id ===
                                        recommendedEntranceId
                                )?.code
                            }
                        </div>
                    )}
            </div>
        </main>
    );
}

export default CampusPage;