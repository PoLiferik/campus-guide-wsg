import {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import {
    authApi,
} from '../../services/authApi';

import {
    studentAuthApi,
} from '../../services/studentAuthApi';

import {
    userApi,
} from '../../services/userApi';

import type {
    User,
} from '../../types/User';

import './LoginPage.css';

type LoginMode =
    | 'student'
    | 'staff';

function LoginPage() {
    const navigate =
        useNavigate();

    const [
        mode,
        setMode
    ] =
        useState<LoginMode>(
            'student'
        );

    const [
        users,
        setUsers
    ] =
        useState<User[]>([]);

    const [
        selectedUserId,
        setSelectedUserId
    ] =
        useState('');

    const [
        email,
        setEmail
    ] =
        useState('');

    const [
        password,
        setPassword
    ] =
        useState('');

    const [
        error,
        setError
    ] =
        useState<string | null>(
            null
        );

    const [
        loading,
        setLoading
    ] =
        useState(false);

    useEffect(() => {
        async function loadUsers() {
            const allUsers =
                await userApi.getAll();

            const activeUsers =
                allUsers.filter(
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
                    String(
                        activeUsers[0].id
                    )
                );
            }
        }

        void loadUsers();
    }, []);

    async function handleStudentLogin(
        event:
        React.FormEvent
    ) {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);

            await authApi.logout();

            await studentAuthApi
                .login(
                    email,
                    password
                );

            navigate('/');
        } catch {
            setError(
                'Nieprawidłowy e-mail lub hasło.'
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleStaffLogin() {
        const userId =
            Number(
                selectedUserId
            );

        if (
            Number.isNaN(userId)
        ) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await studentAuthApi
                .logout();

            const user =
                await authApi.login(
                    userId
                );

            if (
                user.role ===
                'admin'
            ) {
                navigate('/admin');
            } else {
                navigate(
                    '/lecturer'
                );
            }
        } catch {
            setError(
                'Nie można zalogować użytkownika.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <button
                    type="button"
                    className="login-card__back"

                    onClick={() =>
                        navigate('/')
                    }
                >
                    ← Mapa kampusu
                </button>

                <div className="login-card__brand">
                    <span>
                        WSG
                    </span>

                    <h1>
                        Campus Guide
                    </h1>

                    <p>
                        Zaloguj się do swojego konta
                    </p>
                </div>

                <div className="login-tabs">
                    <button
                        type="button"

                        className={
                            mode ===
                            'student'
                                ? 'login-tabs__button login-tabs__button--active'
                                : 'login-tabs__button'
                        }

                        onClick={() => {
                            setMode(
                                'student'
                            );

                            setError(null);
                        }}
                    >
                        Student
                    </button>

                    <button
                        type="button"

                        className={
                            mode ===
                            'staff'
                                ? 'login-tabs__button login-tabs__button--active'
                                : 'login-tabs__button'
                        }

                        onClick={() => {
                            setMode(
                                'staff'
                            );

                            setError(null);
                        }}
                    >
                        Pracownik
                    </button>
                </div>

                {mode ===
                'student' ? (
                    <form
                        className="login-form"
                        onSubmit={
                            handleStudentLogin
                        }
                    >
                        <label>
                            E-mail

                            <input
                                type="email"
                                value={
                                    email
                                }
                                placeholder="student@example.com"
                                required

                                onChange={(
                                    event
                                ) =>
                                    setEmail(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />
                        </label>

                        <label>
                            Hasło

                            <input
                                type="password"
                                value={
                                    password
                                }
                                placeholder="••••••••"
                                required

                                onChange={(
                                    event
                                ) =>
                                    setPassword(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />
                        </label>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-form__submit"
                            disabled={
                                loading
                            }
                        >
                            {loading
                                ? 'Logowanie...'
                                : 'Zaloguj się'}
                        </button>

                        <div className="login-register">
                            Nie masz konta?

                            <button
                                type="button"

                                onClick={() =>
                                    navigate(
                                        '/register'
                                    )
                                }
                            >
                                Zarejestruj się
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="login-form">
                        <div className="login-demo-info">
                            Konta wykładowców tworzy administrator.
                            Wersja demonstracyjna pozwala wybrać konto.
                        </div>

                        <label>
                            Konto

                            <select
                                value={
                                    selectedUserId
                                }

                                onChange={(
                                    event
                                ) =>
                                    setSelectedUserId(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                {users.map(
                                    (
                                        user
                                    ) => (
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
                                            {user.role ===
                                            'admin'
                                                ? 'Administrator'
                                                : 'Wykładowca'}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            className="login-form__submit"

                            disabled={
                                loading ||
                                !selectedUserId
                            }

                            onClick={() =>
                                void handleStaffLogin()
                            }
                        >
                            {loading
                                ? 'Logowanie...'
                                : 'Zaloguj się'}
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}

export default LoginPage;