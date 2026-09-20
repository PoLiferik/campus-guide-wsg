import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { buildings } from '../../mocks/buildings';
import { entranceApi } from '../../services/entranceApi';

import type { Entrance } from '../../types/Entrance';

import UsersAdminSection from './components/UsersAdminSection';

import './AdminPage.css';

type AdminSection =
    | 'dashboard'
    | 'buildings'
    | 'rooms'
    | 'users';

function AdminPage() {
    const [section, setSection] =
        useState<AdminSection>('dashboard');

    const [allEntrances, setAllEntrances] =
        useState<Entrance[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);

                const data =
                    await entranceApi.getAll();

                setAllEntrances(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        void loadData();
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
                        type="button"
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
                        type="button"
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
                        type="button"
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
                        type="button"
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

                        {loading ? (
                            <div className="admin-card">
                                Ładowanie...
                            </div>
                        ) : (
                            <>
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
                                        Frontend pracuje obecnie
                                        na danych demonstracyjnych.
                                    </p>
                                </div>
                            </>
                        )}
                    </>
                )}

                {section === 'buildings' && (
                    <AdminComingSoon
                        title="Budynki"
                        description="Zarządzanie budynkami zostanie dodane w kolejnym etapie."
                    />
                )}

                {section === 'rooms' && (
                    <AdminComingSoon
                        title="Sale"
                        description="Zarządzanie salami zostanie dodane w kolejnym etapie."
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