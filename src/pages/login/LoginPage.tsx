import {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import {
    userApi,
} from '../../services/userApi';

import {
    authApi,
} from '../../services/authApi';

import type {
    User,
} from '../../types/User';

import './LoginPage.css';

function LoginPage() {
    const navigate =
        useNavigate();

    const [
        users,
        setUsers
    ] = useState<User[]>([]);

    const [
        selectedUserId,
        setSelectedUserId
    ] = useState<number | null>(
        null
    );

    const [
        error,
        setError
    ] = useState<string | null>(
        null
    );

    const [
        loading,
        setLoading
    ] = useState(true);

    useEffect(() => {
        const load =
            async () => {
                try {
                    const data =
                        await userApi.getAll();

                    const activeUsers =
                        data.filter(
                            (user) =>
                                user.isActive
                        );

                    setUsers(
                        activeUsers
                    );

                    if (
                        activeUsers.length >
                        0
                    ) {
                        setSelectedUserId(
                            activeUsers[0].id
                        );
                    }
                } finally {
                    setLoading(false);
                }
            };

        load();
    }, []);

    const handleLogin =
        async () => {
            if (
                selectedUserId ===
                null
            ) {
                return;
            }

            try {
                setError(null);

                const user =
                    await authApi.login(
                        selectedUserId
                    );

                if (
                    user.role ===
                    'admin'
                ) {
                    navigate(
                        '/admin'
                    );

                    return;
                }

                navigate(
                    '/lecturer'
                );
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message ===
                    'USER_BLOCKED'
                ) {
                    setError(
                        'Konto jest zablokowane.'
                    );

                    return;
                }

                setError(
                    'Nie udało się zalogować.'
                );
            }
        };

    const handleGuest =
        async () => {
            await authApi.logout();

            navigate('/');
        };

    if (loading) {
        return (
            <main className="login-page">
                <div className="login-card">
                    Ładowanie...
                </div>
            </main>
        );
    }

    return (
        <main className="login-page">
            <div className="login-card">
                <div className="login-card__header">
                    <span>
                        Campus Guide WSG
                    </span>

                    <h1>
                        Logowanie
                    </h1>

                    <p>
                        Tryb demonstracyjny
                    </p>
                </div>

                <label className="login-field">
                    Konto

                    <select
                        value={
                            selectedUserId ??
                            ''
                        }
                        onChange={(
                            event
                        ) =>
                            setSelectedUserId(
                                Number(
                                    event
                                        .target
                                        .value
                                )
                            )
                        }
                    >
                        {users.map(
                            (user) => (
                                <option
                                    key={
                                        user.id
                                    }
                                    value={
                                        user.id
                                    }
                                >
                                    {
                                        user.name
                                    }
                                    {' — '}
                                    {
                                        user.role ===
                                        'admin'
                                            ? 'Administrator'
                                            : 'Wykładowca'
                                    }
                                </option>
                            )
                        )}
                    </select>
                </label>
                <div className="login-demo-info">
                    W wersji demonstracyjnej
                    wybieramy konto bez hasła.
                    Po podłączeniu ASP.NET
                    będzie tutaj normalne
                    logowanie.
                </div>
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}
                <button
                    type="button"
                    className="login-primary"
                    onClick={
                        handleLogin
                    }
                >
                    Zaloguj się
                </button>
                <button
                    type="button"
                    className="login-secondary"
                    onClick={
                        handleGuest
                    }
                >
                    Wejdź jako student / gość
                </button>
            </div>
        </main>
    );
}

export default LoginPage;