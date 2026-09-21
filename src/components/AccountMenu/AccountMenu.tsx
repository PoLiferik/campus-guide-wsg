import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import type { User } from '../../types/User';
import './AccountMenu.css';

function AccountMenu() {
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setLoading(true);

        authApi.getCurrentUser()
            .then(setUser)
            .finally(() => setLoading(false));
    }, [location.pathname]);

    if (location.pathname !== '/') {
        return null;
    }

    async function handleLogout() {
        try {
            await authApi.logout();
        } finally {
            window.location.replace('/');
        }
    }

    if (loading) {
        return null;
    }

    if (!user) {
        return (
            <div className="account-menu">
                <Link to="/login" className="account-menu__login">
                    Zaloguj się
                </Link>
            </div>
        );
    }

    const initials = user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const panelPath = user.role === 'Admin'
        ? '/admin'
        : '/lecturer';

    const panelLabel = user.role === 'Admin'
        ? 'Panel administratora'
        : 'Panel moderatora';

    return (
        <div className="account-menu">
            <button
                type="button"
                className="account-menu__summary"
                onClick={() => setOpen((value) => !value)}
            >
                <span className="account-menu__avatar">
                    {initials || 'U'}
                </span>

                <span className="account-menu__identity">
                    <strong>{user.name}</strong>
                    <small>{user.role}</small>
                </span>

                <span
                    className={`account-menu__arrow ${
                        open ? 'account-menu__arrow--open' : ''
                    }`}
                >
                    ▾
                </span>
            </button>

            {open && (
                <div className="account-menu__dropdown">
                    <div className="account-menu__profile">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{user.role}</small>
                    </div>

                    <div className="account-menu__divider" />

                    <div className="account-menu__actions">
                        <Link
                            to="/"
                            className="account-menu__action"
                            onClick={() => setOpen(false)}
                        >
                            <span className="account-menu__action-icon">
                                ⌖
                            </span>
                            Mapa kampusu
                        </Link>

                        <Link
                            to={panelPath}
                            className="account-menu__action"
                            onClick={() => setOpen(false)}
                        >
                            <span className="account-menu__action-icon">
                                ▣
                            </span>
                            {panelLabel}
                        </Link>

                        <button
                            type="button"
                            className="account-menu__action account-menu__action--logout"
                            onClick={handleLogout}
                        >
                            <span className="account-menu__action-icon">
                                ↪
                            </span>
                            Wyloguj się
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountMenu;