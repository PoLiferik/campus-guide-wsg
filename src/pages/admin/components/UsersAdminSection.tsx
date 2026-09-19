import {
    useEffect,
    useState,
} from 'react';

import {
    buildings,
} from '../../../mocks/buildings';

import {
    userApi,
} from '../../../services/userApi';

import type {
    User,
    UserRole,
} from '../../../types/User';

interface UserForm {
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    assignedBuildingIds:
        number[];
}

const EMPTY_FORM:
    UserForm = {
    name: '',
    email: '',
    role: 'lecturer',
    isActive: true,
    assignedBuildingIds: [],
};

function UsersAdminSection() {
    const [
        users,
        setUsers
    ] =
        useState<User[]>([]);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        editorOpen,
        setEditorOpen
    ] =
        useState(false);

    const [
        editingUserId,
        setEditingUserId
    ] =
        useState<number | null>(
            null
        );

    const [
        form,
        setForm
    ] =
        useState<UserForm>(
            EMPTY_FORM
        );

    const [
        saving,
        setSaving
    ] =
        useState(false);

    const [
        message,
        setMessage
    ] =
        useState<string | null>(
            null
        );

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers =
        async () => {
            try {
                setLoading(true);

                const data =
                    await userApi
                        .getAll();

                setUsers(
                    data
                );
            } finally {
                setLoading(false);
            }
        };

    const openCreate =
        () => {
            setEditingUserId(
                null
            );

            setForm({
                ...EMPTY_FORM,
                assignedBuildingIds:
                    [],
            });

            setMessage(null);
            setEditorOpen(true);
        };

    const openEdit =
        (
            user: User
        ) => {
            setEditingUserId(
                user.id
            );

            setForm({
                name:
                user.name,

                email:
                user.email,

                role:
                user.role,

                isActive:
                user.isActive,

                assignedBuildingIds:
                    [
                        ...user
                            .assignedBuildingIds,
                    ],
            });

            setMessage(null);
            setEditorOpen(true);
        };

    const closeEditor =
        () => {
            setEditorOpen(false);
            setEditingUserId(null);
            setMessage(null);
        };

    const toggleBuilding =
        (
            buildingId:
            number
        ) => {
            setForm(
                (current) => {
                    const exists =
                        current
                            .assignedBuildingIds
                            .includes(
                                buildingId
                            );

                    return {
                        ...current,

                        assignedBuildingIds:
                            exists
                                ? current
                                    .assignedBuildingIds
                                    .filter(
                                        (id) =>
                                            id !==
                                            buildingId
                                    )

                                : [
                                    ...current
                                        .assignedBuildingIds,

                                    buildingId,
                                ],
                    };
                }
            );
        };

    const handleSave =
        async () => {
            const name =
                form.name.trim();

            const email =
                form.email
                    .trim()
                    .toLowerCase();

            if (!name) {
                setMessage(
                    'Podaj imię i nazwisko.'
                );

                return;
            }

            if (
                !email ||
                !email.includes('@')
            ) {
                setMessage(
                    'Podaj poprawny adres e-mail.'
                );

                return;
            }

            if (
                form.role ===
                'lecturer' &&
                form
                    .assignedBuildingIds
                    .length === 0
            ) {
                setMessage(
                    'Przypisz wykładowcy co najmniej jeden budynek.'
                );

                return;
            }

            try {
                setSaving(true);
                setMessage(null);

                const request = {
                    name,
                    email,
                    role:
                    form.role,
                    isActive:
                    form.isActive,

                    assignedBuildingIds:
                        form.role ===
                        'admin'
                            ? []
                            : form
                                .assignedBuildingIds,
                };

                if (
                    editingUserId ===
                    null
                ) {
                    await userApi
                        .create(
                            request
                        );
                } else {
                    await userApi
                        .update(
                            editingUserId,
                            request
                        );
                }

                await loadUsers();

                closeEditor();
            } catch (error) {
                if (
                    error instanceof
                    Error &&
                    error.message ===
                    'EMAIL_EXISTS'
                ) {
                    setMessage(
                        'Użytkownik z tym adresem e-mail już istnieje.'
                    );

                    return;
                }

                console.error(
                    error
                );

                setMessage(
                    'Nie udało się zapisać użytkownika.'
                );
            } finally {
                setSaving(false);
            }
        };

    const handleDelete =
        async (
            user: User
        ) => {
            if (
                user.role ===
                'admin'
            ) {
                window.alert(
                    'Nie można usunąć administratora.'
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Usunąć użytkownika ${user.name}?`
                );

            if (!confirmed) {
                return;
            }

            try {
                await userApi.delete(
                    user.id
                );

                await loadUsers();
            } catch (error) {
                console.error(
                    error
                );
            }
        };

    const getBuildingsText =
        (
            user: User
        ) => {
            if (
                user.role ===
                'admin'
            ) {
                return 'Wszystkie';
            }

            const codes =
                buildings
                    .filter(
                        (building) =>
                            user
                                .assignedBuildingIds
                                .includes(
                                    building.id
                                )
                    )
                    .map(
                        (building) =>
                            building.code
                    );

            if (
                codes.length ===
                0
            ) {
                return 'Brak';
            }

            return codes.join(
                ', '
            );
        };

    return (
        <>
            <header className="admin-header">
                <div>
                    <span>
                        Zarządzanie
                    </span>

                    <h1>
                        Użytkownicy
                    </h1>

                    <p>
                        Konta wykładowców,
                        administratorów
                        i dostęp do budynków
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-primary-button"
                    onClick={
                        openCreate
                    }
                >
                    + Dodaj użytkownika
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
                                Użytkownik
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Rola
                            </th>

                            <th>
                                Budynki
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Akcje
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map(
                            (user) => (
                                <tr
                                    key={
                                        user.id
                                    }
                                >
                                    <td>
                                        <strong>
                                            {
                                                user.name
                                            }
                                        </strong>
                                    </td>

                                    <td>
                                        {
                                            user.email
                                        }
                                    </td>

                                    <td>
                                            <span
                                                className={
                                                    user.role ===
                                                    'admin'
                                                        ? 'admin-role admin-role--admin'
                                                        : 'admin-role admin-role--lecturer'
                                                }
                                            >
                                                {
                                                    user.role ===
                                                    'admin'
                                                        ? 'Administrator'
                                                        : 'Wykładowca'
                                                }
                                            </span>
                                    </td>

                                    <td>
                                        {
                                            getBuildingsText(
                                                user
                                            )
                                        }
                                    </td>

                                    <td>
                                            <span
                                                className={
                                                    user.isActive
                                                        ? 'admin-status admin-status--open'
                                                        : 'admin-status admin-status--closed'
                                                }
                                            >
                                                {
                                                    user.isActive
                                                        ? 'Aktywny'
                                                        : 'Zablokowany'
                                                }
                                            </span>
                                    </td>

                                    <td>
                                        <div className="admin-actions">
                                            <button
                                                type="button"
                                                className="admin-edit-button"
                                                onClick={() =>
                                                    openEdit(
                                                        user
                                                    )
                                                }
                                            >
                                                Edytuj
                                            </button>

                                            {user.role !==
                                                'admin' && (
                                                    <button
                                                        type="button"
                                                        className="admin-delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                user
                                                            )
                                                        }
                                                    >
                                                        Usuń
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {editorOpen && (
                <div className="admin-modal">
                    <div
                        className="admin-modal__backdrop"
                        onClick={
                            closeEditor
                        }
                    />

                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <div>
                                <span>
                                    {
                                        editingUserId ===
                                        null
                                            ? 'Nowe konto'
                                            : 'Edycja konta'
                                    }
                                </span>

                                <h2>
                                    {
                                        editingUserId ===
                                        null
                                            ? 'Dodaj użytkownika'
                                            : form.name
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-modal__close"
                                onClick={
                                    closeEditor
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-form">
                            <label>
                                Imię i nazwisko

                                <input
                                    value={
                                        form.name
                                    }
                                    placeholder="np. Cezary Kowalski"
                                    onChange={(
                                        event
                                    ) =>
                                        setForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                name:
                                                event
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                />
                            </label>

                            <label>
                                Email

                                <input
                                    type="email"
                                    value={
                                        form.email
                                    }
                                    placeholder="np. cezary@wsg.pl"
                                    onChange={(
                                        event
                                    ) =>
                                        setForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                email:
                                                event
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                />
                            </label>

                            <label>
                                Rola

                                <select
                                    value={
                                        form.role
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        const role =
                                            event
                                                .target
                                                .value as
                                                UserRole;

                                        setForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                role,

                                                assignedBuildingIds:
                                                    role ===
                                                    'admin'
                                                        ? []
                                                        : current
                                                            .assignedBuildingIds,
                                            })
                                        );
                                    }}
                                >
                                    <option value="lecturer">
                                        Wykładowca
                                    </option>

                                    <option value="admin">
                                        Administrator
                                    </option>
                                </select>
                            </label>

                            <label>
                                Status

                                <select
                                    value={
                                        form.isActive
                                            ? 'active'
                                            : 'blocked'
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,

                                                isActive:
                                                    event
                                                        .target
                                                        .value ===
                                                    'active',
                                            })
                                        )
                                    }
                                >
                                    <option value="active">
                                        Aktywny
                                    </option>

                                    <option value="blocked">
                                        Zablokowany
                                    </option>
                                </select>
                            </label>
                        </div>

                        <div className="admin-user-buildings">
                            <div className="admin-user-buildings__header">
                                <strong>
                                    Dostęp do budynków
                                </strong>

                                <span>
                                    {
                                        form.role ===
                                        'admin'
                                            ? 'Administrator ma dostęp do wszystkich budynków.'
                                            : 'Wybierz budynki przypisane do wykładowcy.'
                                    }
                                </span>
                            </div>

                            {form.role ===
                            'admin' ? (
                                <div className="admin-all-buildings">
                                    ✓ Wszystkie budynki
                                </div>
                            ) : (
                                <div className="admin-building-grid">
                                    {buildings.map(
                                        (
                                            building
                                        ) => {
                                            const selected =
                                                form
                                                    .assignedBuildingIds
                                                    .includes(
                                                        building.id
                                                    );

                                            return (
                                                <label
                                                    key={
                                                        building.id
                                                    }
                                                    className={
                                                        selected
                                                            ? 'admin-building-check admin-building-check--selected'
                                                            : 'admin-building-check'
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selected
                                                        }
                                                        onChange={() =>
                                                            toggleBuilding(
                                                                building.id
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {
                                                            building.code
                                                        }
                                                    </span>
                                                </label>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>

                        {message && (
                            <div className="admin-form-error">
                                {message}
                            </div>
                        )}

                        <div className="admin-modal__actions">
                            <button
                                type="button"
                                className="admin-secondary-button"
                                onClick={
                                    closeEditor
                                }
                            >
                                Anuluj
                            </button>

                            <button
                                type="button"
                                className="admin-primary-button"
                                disabled={
                                    saving
                                }
                                onClick={
                                    handleSave
                                }
                            >
                                {
                                    saving
                                        ? 'Zapisywanie...'
                                        : 'Zapisz'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UsersAdminSection;