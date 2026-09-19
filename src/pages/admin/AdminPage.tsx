import UsersAdminSection from './components/UsersAdminSection';
import {
    useEffect,
    useState,
} from 'react';
import { Link } from 'react-router-dom';
import { buildings } from '../../mocks/buildings';
import { entranceApi } from '../../services/entranceApi';
import type { Entrance } from '../../types/Entrance';
import './AdminPage.css';


type AdminSection =
    | 'dashboard'
    | 'buildings'
    | 'rooms'
    | 'entrances'
    | 'users';

function AdminPage() {
    const [section, setSection] =
        useState<AdminSection>('dashboard');

    const [allEntrances, setAllEntrances] =
        useState<Entrance[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data =
                    await entranceApi.getAll();

                setAllEntrances(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const openEntrances =
        allEntrances.filter(
            (entrance) =>
                entrance.isOpen === true
        ).length;

    const closedEntrances =
        allEntrances.filter(
            (entrance) =>
                entrance.isOpen === false
        ).length;

    const unknownEntrances =
        allEntrances.filter(
            (entrance) =>
                entrance.isOpen === null
        ).length;

    return (
        <main className="admin-page">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <span>
                        Campus Guide WSG
                    </span>

                    <strong>
                        Panel administratora
                    </strong>
                </div>

                <nav className="admin-nav">
                    <button
                        className={
                            section === 'dashboard'
                                ? 'admin-nav__item admin-nav__item--active'
                                : 'admin-nav__item'
                        }
                        onClick={() =>
                            setSection('dashboard')
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className={
                            section === 'buildings'
                                ? 'admin-nav__item admin-nav__item--active'
                                : 'admin-nav__item'
                        }
                        onClick={() =>
                            setSection('buildings')
                        }
                    >
                        Budynki
                    </button>

                    <button
                        className={
                            section === 'rooms'
                                ? 'admin-nav__item admin-nav__item--active'
                                : 'admin-nav__item'
                        }
                        onClick={() =>
                            setSection('rooms')
                        }
                    >
                        Sale
                    </button>

                    <button
                        className={
                            section === 'entrances'
                                ? 'admin-nav__item admin-nav__item--active'
                                : 'admin-nav__item'
                        }
                        onClick={() =>
                            setSection('entrances')
                        }
                    >
                        Wejścia
                    </button>

                    <button
                        className={
                            section === 'users'
                                ? 'admin-nav__item admin-nav__item--active'
                                : 'admin-nav__item'
                        }
                        onClick={() =>
                            setSection('users')
                        }
                    >
                        Użytkownicy
                    </button>
                </nav>

                <div className="admin-sidebar__bottom">
                    <Link
                        to="/"
                        className="admin-map-link"
                    >
                        ← Mapa kampusu
                    </Link>

                    <Link
                        to="/lecturer"
                        className="admin-map-link"
                    >
                        Panel wykładowcy
                    </Link>
                </div>
            </aside>

            <section className="admin-content">
                {section === 'dashboard' && (
                    <>
                        <header className="admin-header">
                            <div>
                                <span>
                                    Campus Guide WSG
                                </span>

                                <h1>
                                    Dashboard
                                </h1>

                                <p>
                                    Podsumowanie systemu
                                </p>
                            </div>
                        </header>

                        <div className="admin-stats">
                            <div className="admin-stat">
                                <span>
                                    Budynki
                                </span>

                                <strong>
                                    {buildings.length}
                                </strong>
                            </div>

                            <div className="admin-stat">
                                <span>
                                    Wejścia
                                </span>

                                <strong>
                                    {allEntrances.length}
                                </strong>
                            </div>

                            <div className="admin-stat admin-stat--green">
                                <span>
                                    Otwarte
                                </span>

                                <strong>
                                    {openEntrances}
                                </strong>
                            </div>

                            <div className="admin-stat admin-stat--red">
                                <span>
                                    Zamknięte
                                </span>

                                <strong>
                                    {closedEntrances}
                                </strong>
                            </div>

                            <div className="admin-stat">
                                <span>
                                    Brak danych
                                </span>

                                <strong>
                                    {unknownEntrances}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h2>
                                Stan projektu
                            </h2>

                            <p>
                                Frontend pracuje obecnie na danych demonstracyjnych.
                                Docelowo panel administratora będzie komunikował się
                                z ASP.NET Core Web API i MySQL.
                            </p>
                        </div>
                    </>
                )}

                {section === 'entrances' && (
                    <>
                        <header className="admin-header">
                            <div>
                                <span>
                                    Zarządzanie
                                </span>

                                <h1>
                                    Wejścia
                                </h1>

                                <p>
                                    Lista wejść do budynków
                                </p>
                            </div>

                            <button
                                className="admin-primary-button"
                                type="button"
                            >
                                + Dodaj wejście
                            </button>
                        </header>

                        {loading ? (
                            <div className="admin-card">
                                Ładowanie...
                            </div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>
                                            Kod
                                        </th>

                                        <th>
                                            Budynek
                                        </th>

                                        <th>
                                            Opis
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Godziny
                                        </th>

                                        <th>
                                            Akcje
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {allEntrances.map(
                                        (entrance) => {
                                            const building =
                                                buildings.find(
                                                    (item) =>
                                                        item.id ===
                                                        entrance.buildingId
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        entrance.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                entrance.code
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        Budynek{' '}
                                                        {
                                                            building?.code ??
                                                            '?'
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            entrance.description ??
                                                            'Brak opisu'
                                                        }
                                                    </td>

                                                    <td>
                                                            <span
                                                                className={
                                                                    entrance.isOpen === true
                                                                        ? 'admin-status admin-status--open'
                                                                        : entrance.isOpen === false
                                                                            ? 'admin-status admin-status--closed'
                                                                            : 'admin-status admin-status--unknown'
                                                                }
                                                            >
                                                                {
                                                                    entrance.isOpen === true
                                                                        ? 'Otwarte'
                                                                        : entrance.isOpen === false
                                                                            ? 'Zamknięte'
                                                                            : 'Brak danych'
                                                                }
                                                            </span>
                                                    </td>

                                                    <td>
                                                        {
                                                            entrance.openFrom &&
                                                            entrance.openUntil
                                                                ? `${entrance.openFrom}–${entrance.openUntil}`
                                                                : '—'
                                                        }
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="admin-edit-button"
                                                        >
                                                            Edytuj
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {section === 'buildings' && (
                    <AdminComingSoon
                        title="Budynki"
                        description="Tutaj administrator będzie zarządzał budynkami i pozycjami na mapie."
                    />
                )}

                {section === 'rooms' && (
                    <AdminComingSoon
                        title="Sale"
                        description="Tutaj administrator będzie dodawał i edytował sale oraz piętra."
                    />
                )}

                {section === 'users' && (
                    <UsersAdminSection />
                )}
            </section>
        </main>
    );
}

interface AdminComingSoonProps {
    title: string;
    description: string;
}

function AdminComingSoon({
                             title,
                             description,
                         }: AdminComingSoonProps) {
    return (
        <>
            <header className="admin-header">
                <div>
                    <span>
                        Zarządzanie
                    </span>
                    <h1>
                        {title}
                    </h1>
                    <p>
                        {description}
                    </p>
                </div>
            </header>
            <div className="admin-card">
                <h2>
                    Moduł w przygotowaniu
                </h2>
                <p>
                    Dodamy go w kolejnym etapie.
                </p>
            </div>
        </>
    );
}
export default AdminPage;