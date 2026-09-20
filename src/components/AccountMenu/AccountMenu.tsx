import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {authApi} from '../../services/authApi';
import type {User} from '../../types/User';
import './AccountMenu.css';

function AccountMenu() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<User | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        authApi.getCurrentUser().then(setUser);
    }, [location.pathname]);

    function goTo(path: string) {
        setOpen(false);
        navigate(path);
    }

    async function logout() {
        await authApi.logout();
        setUser(null);
        setOpen(false);
        navigate('/');
    }

    if (location.pathname !== '/') return null;

    if (!user) {
        return (
            <div className="account-menu">
                <button
                    type="button"
                    className="account-menu__login"
                    onClick={() => navigate('/login')}
                >
                    Zaloguj się
                </button>
            </div>
        );
    }

    return (
        <div className="account-menu">
            <button
                type="button"
                className="account-menu__button"
                onClick={() => setOpen((current) => !current)}
            >
                <span className="account-menu__avatar">
                    {user.name.charAt(0).toUpperCase()}
                </span>

                <span className="account-menu__user">
                    <strong>{user.name}</strong>
                    <small>{user.role}</small>
                </span>

                <span className="account-menu__arrow">
                    {open ? '▲' : '▼'}
                </span>
            </button>

            {open && (
                <div className="account-menu__dropdown">
                    <div className="account-menu__profile">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{user.role}</small>
                    </div>

                    <button type="button" onClick={() => goTo('/')}>
                        Mapa kampusu
                    </button>

                    {user.role === 'Admin' && (
                        <button type="button" onClick={() => goTo('/admin')}>
                            Panel administratora
                        </button>
                    )}

                    {user.role === 'Moderator' && (
                        <button type="button" onClick={() => goTo('/lecturer')}>
                            Panel Moderatora
                        </button>
                    )}

                    <button
                        type="button"
                        className="account-menu__logout"
                        onClick={() => void logout()}
                    >
                        Wyloguj się
                    </button>
                </div>
            )}
        </div>
    );
}

export default AccountMenu;