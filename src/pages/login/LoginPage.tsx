import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {authApi} from '../../services/authApi';
import './LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(event: React.FormEvent) {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const user = await authApi.login(username.trim(), password);

            if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/lecturer');
            }
        } catch (error) {
            console.error(error);
            setError('Nieprawidłowa nazwa użytkownika lub hasło.');
        } finally {
            setLoading(false);
        }
    }

    function handleGuest() {
        navigate('/');
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <button className="login-back" type="button" onClick={() => navigate('/')}>
                    ← Mapa kampusu
                </button>

                <div className="login-brand">
                    <span>WSG</span>
                    <h1>Campus Guide</h1>
                    <p>Zaloguj się jako Admin lub Moderator</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <label>
                        Nazwa użytkownika
                        <input
                            type="text"
                            value={username}
                            placeholder="np. admin"
                            autoComplete="username"
                            required
                            onChange={(event) => setUsername(event.target.value)}
                        />
                    </label>

                    <label>
                        Hasło
                        <input
                            type="password"
                            value={password}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </label>

                    {error && <div className="login-error">{error}</div>}

                    <button className="login-submit" type="submit" disabled={loading}>
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>

                    <div className="login-divider">
                        <span>lub</span>
                    </div>

                    <button className="login-guest" type="button" onClick={handleGuest}>
                        Wejdź jako gość
                    </button>
                </form>
            </section>
        </main>
    );
}

export default LoginPage;