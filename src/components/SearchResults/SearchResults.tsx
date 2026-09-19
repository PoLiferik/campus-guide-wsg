import type { SearchResult } from '../../types/Search';

import './SearchResults.css';

interface SearchResultsProps {
    results: SearchResult[];
    loading: boolean;
    error: string | null;
    searched: boolean;
    onSelect: (result: SearchResult) => void;
}

function SearchResults({ results, loading, error, searched, onSelect }: SearchResultsProps) {
    if (loading) {
        return <div className="search-status">Szukanie...</div>;
    }

    if (error) {
        return <div className="search-status search-status--error">{error}</div>;
    }

    if (searched && results.length === 0) {
        return <div className="search-status">Nie znaleziono sali lub budynku.</div>;
    }

    if (results.length === 0) {
        return null;
    }

    return (
        <div className="search-results">
            {results.map((result) => {
                const isBuilding = result.type === 'building';

                return (
                    <button
                        key={`${result.type}-${result.id}`}
                        className="search-result"
                        onClick={() => onSelect(result)}
                    >
                        {isBuilding ? (
                            <>
                                <strong>Budynek {result.buildingCode}</strong>
                                <span>Pokaż budynek na mapie</span>
                            </>
                        ) : (
                            <>
                                <strong>
                                    Budynek {result.buildingCode} — sala {result.number}
                                </strong>
                                <span>{result.floorLabel}</span>
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export default SearchResults;