import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '../../services/authApi';
import { studentAuthApi } from '../../services/studentAuthApi';

import '../login/LoginPage.css';

function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(false);

    async function handleSubmit(
        event: React.FormEvent
    ) {
        event.preventDefault();

        if (name.trim().length < 2) {
            setError(
                'Podaj imię i nazwisko.'
            );
            return;
        }

        if (password.length < 6) {
            setError(
                'Hasło musi mieć co najmniej 6 znaków.'
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                'Hasła nie są takie same.'
            );
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await authApi.logout();

            await studentAuthApi.register(
                name,
                email,
                password
            );

            navigate('/');
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === 'EMAIL_EXISTS'
            ) {
                setError(
                    'Konto z tym adresem e-mail już istnieje.'
                );
            } else {
                setError(
                    'Nie udało się utworzyć konta.'
                );
            }
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
                    <span>WSG</span>

                    <h1>
                        Rejestracja
                    </h1>

                    <p>
                        Utwórz konto studenta
                    </p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Imię i nazwisko

                        <input
                            type="text"
                            value={name}
                            placeholder="Jan Kowalski"
                            required
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                        />
                    </label>

                    <label>
                        E-mail

                        <input
                            type="email"
                            value={email}
                            placeholder="student@example.com"
                            required
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                        />
                    </label>

                    <label>
                        Hasło

                        <input
                            type="password"
                            value={password}
                            placeholder="Minimum 6 znaków"
                            required
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                        />
                    </label>

                    <label>
                        Powtórz hasło

                        <input
                            type="password"
                            value={
                                confirmPassword
                            }
                            placeholder="Powtórz hasło"
                            required
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
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
                        disabled={loading}
                    >
                        {loading
                            ? 'Tworzenie konta...'
                            : 'Utwórz konto'}
                    </button>

                    <div className="login-register">
                        Masz już konto?

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/login')
                            }
                        >
                            Zaloguj się
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default RegisterPage;