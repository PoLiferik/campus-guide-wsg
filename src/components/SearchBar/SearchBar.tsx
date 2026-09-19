import { useState, type FormEvent } from 'react';

import './SearchBar.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedQuery = query.trim();

        if (!normalizedQuery) {
            return;
        }

        onSearch(normalizedQuery);
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={({ target }) => setQuery(target.value)}
                placeholder="Wpisz budynek lub numer sali"
                maxLength={50}
                className="search-bar__input"
            />

            <button type="submit" className="search-bar__button">
                Szukaj
            </button>
        </form>
    );
}

export default SearchBar;