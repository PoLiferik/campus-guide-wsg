import { useEffect, useState } from 'react';
import {
    useLocation,
    useNavigate,
} from 'react-router-dom';

import { authApi } from '../../services/authApi';
import {
    studentAuthApi,
} from '../../services/studentAuthApi';

import type {
    StudentSession,
} from '../../services/studentAuthApi';

import type { User } from '../../types/User';

import './AccountMenu.css';

function AccountMenu() {
    const navigate = useNavigate();
    const location = useLocation();

    const [staffUser, setStaffUser] =
        useState<User | null>(null);

    const [student, setStudent] =
        useState<StudentSession | null>(null);

    const [open, setOpen] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadSession() {
            const [staff, studentSession] =
                await Promise.all([
                    authApi.getCurrentUser(),
                    studentAuthApi.getCurrentStudent(),
                ]);

            if (cancelled) {
                return;
            }

            setStaffUser(staff);

            setStudent(
                staff
                    ? null
                    : studentSession
            );
        }

        void loadSession();

        return () => {
            cancelled = true;
        };
    }, [location.pathname]);

    /*
        AccountMenu pokazujemy tylko
        na głównej mapie.
    */
    if (location.pathname !== '/') {
        return null;
    }

    const currentName =
        staffUser?.name ??
        student?.name ??
        null;

    const currentEmail =
        staffUser?.email ??
        student?.email ??
        null;

    function getRoleText() {
        if (
            staffUser?.role ===
            'admin'
        ) {
            return 'Administrator';
        }

        if (
            staffUser?.role ===
            'lecturer'
        ) {
            return 'Wykładowca';
        }

        if (student) {
            return 'Student';
        }

        return '';
    }

    function goTo(path: string) {
        setOpen(false);
        navigate(path);
    }

    async function handleLogout() {
        setOpen(false);

        await Promise.all([
            authApi.logout(),
            studentAuthApi.logout(),
        ]);

        window.location.href = '/';
    }

    if (!currentName) {
        return (
            <div className="account-menu account-menu--map">
                <button
                    type="button"
                    className="account-menu__login"
                    onClick={() =>
                        goTo('/login')
                    }
                >
                    Zaloguj się
                </button>

                <button
                    type="button"
                    className="account-menu__register"
                    onClick={() =>
                        goTo('/register')
                    }
                >
                    Rejestracja
                </button>
            </div>
        );
    }

    const initial =
        currentName
            .trim()
            .charAt(0)
            .toUpperCase();

    return (
        <div className="account-menu account-menu--map">
            <button
                type="button"
                className="account-menu__profile"
                onClick={() =>
                    setOpen(
                        (current) =>
                            !current
                    )
                }
            >
                <span className="account-menu__avatar">
                    {initial}
                </span>

                <span className="account-menu__profile-text">
                    <strong>
                        {currentName}
                    </strong>

                    <small>
                        {getRoleText()}
                    </small>
                </span>

                <span className="account-menu__chevron">
                    {open
                        ? '▲'
                        : '▼'}
                </span>
            </button>

            {open && (
                <div className="account-menu__dropdown">
                    <div className="account-menu__user">
                        <strong>
                            {currentName}
                        </strong>

                        <span>
                            {currentEmail}
                        </span>

                        <small>
                            {getRoleText()}
                        </small>
                    </div>

                    <div className="account-menu__divider" />

                    <button
                        type="button"
                        onClick={() =>
                            goTo('/')
                        }
                    >
                        Mapa kampusu
                    </button>

                    {staffUser?.role ===
                        'lecturer' && (
                            <button
                                type="button"
                                onClick={() =>
                                    goTo(
                                        '/lecturer'
                                    )
                                }
                            >
                                Panel wykładowcy
                            </button>
                        )}

                    {staffUser?.role ===
                        'admin' && (
                            <button
                                type="button"
                                onClick={() =>
                                    goTo(
                                        '/admin'
                                    )
                                }
                            >
                                Panel administratora
                            </button>
                        )}

                    <div className="account-menu__divider" />

                    <button
                        type="button"
                        className="account-menu__logout"
                        onClick={() =>
                            void handleLogout()
                        }
                    >
                        Wyloguj się
                    </button>
                </div>
            )}
        </div>
    );
}

export default AccountMenu;