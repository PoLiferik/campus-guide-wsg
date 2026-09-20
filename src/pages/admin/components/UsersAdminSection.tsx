import {useEffect, useState} from 'react';
import {userApi} from '../../../services/userApi';
import {buildings} from '../../../mocks/buildings';
import type {User, UserRole} from '../../../types/User';
import './UsersAdminSection.css';

interface UserFormState {
    name: string;
    username: string;
    password: string;
    role: UserRole;
    assignedBuildingIds: number[];
}

const emptyForm: UserFormState = {
    name: '',
    username: '',
    password: '',
    role: 'Moderator',
    assignedBuildingIds: [],
};

function UsersAdminSection() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form, setForm] = useState<UserFormState>(emptyForm);

    useEffect(() => {
        void loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            setError(null);
            setUsers(await userApi.getAll());
        } catch (error) {
            console.error(error);
            setError('Nie udało się pobrać użytkowników.');
        } finally {
            setLoading(false);
        }
    }

    function openCreateModal() {
        setEditingUser(null);
        setForm({...emptyForm, assignedBuildingIds: []});
        setError(null);
        setModalOpen(true);
    }

    function openEditModal(user: User) {
        setEditingUser(user);
        setForm({
            name: user.name,
            username: user.email,
            password: '',
            role: user.role,
            assignedBuildingIds: [...user.assignedBuildingIds],
        });
        setError(null);
        setModalOpen(true);
    }

    function closeModal() {
        if (saving) return;

        setModalOpen(false);
        setEditingUser(null);
        setForm({...emptyForm, assignedBuildingIds: []});
        setError(null);
    }

    function toggleBuilding(buildingId: number) {
        setForm((current) => ({
            ...current,
            assignedBuildingIds: current.assignedBuildingIds.includes(buildingId)
                ? current.assignedBuildingIds.filter((id) => id !== buildingId)
                : [...current.assignedBuildingIds, buildingId],
        }));
    }

    function validateForm(): string | null {
        if (form.name.trim().length < 2) return 'Podaj imię i nazwisko.';
        if (form.username.trim().length < 4) return 'Nazwa użytkownika musi mieć co najmniej 4 znaki.';
        if (!editingUser && form.password.length < 8) return 'Hasło musi mieć co najmniej 8 znaków.';

        if (form.role === 'Moderator' && form.assignedBuildingIds.length === 0) {
            return 'Moderator musi mieć przypisany co najmniej jeden budynek.';
        }

        return null;
    }

    async function handleSave(event: React.FormEvent) {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError(null);

            if (editingUser) {
                await userApi.update(editingUser.id, {
                    name: form.name.trim(),
                    email: form.username.trim(),
                    role: form.role,
                    assignedBuildingIds: form.role === 'Admin' ? [] : form.assignedBuildingIds,
                });
            } else {
                await userApi.create({
                    name: form.name.trim(),
                    email: form.username.trim(),
                    password: form.password,
                    role: form.role,
                    isActive: true,
                    assignedBuildingIds: form.role === 'Admin' ? [] : form.assignedBuildingIds,
                });
            }

            await loadUsers();
            closeModal();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Nie udało się zapisać użytkownika.');
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(user: User) {
        if (user.role === 'Admin') {
            setError('Konta Admin nie można usunąć z tego panelu.');
            return;
        }

        if (!window.confirm(`Czy na pewno usunąć użytkownika ${user.name}?`)) return;

        try {
            setError(null);
            await userApi.delete(user.id);
            await loadUsers();
        } catch (error) {
            console.error(error);
            setError('Nie udało się usunąć użytkownika.');
        }
    }

    function getBuildingsText(user: User) {
        if (user.role === 'Admin') return 'Wszystkie';
        if (user.assignedBuildingIds.length === 0) return 'Brak';

        return user.assignedBuildingIds
            .map((id) => buildings.find((building) => building.id === id)?.code)
            .filter(Boolean)
            .join(', ');
    }

    return (
        <>
            <header className="users-admin-header">
                <div>
                    <span>Zarządzanie</span>
                    <h1>Użytkownicy</h1>
                    <p>Konta Admin i Moderator zapisane w MySQL</p>
                </div>

                <button type="button" className="users-admin-primary" onClick={openCreateModal}>
                    + Dodaj użytkownika
                </button>
            </header>

            {error && !modalOpen && <div className="users-admin-error">{error}</div>}

            {loading ? (
                <div className="users-admin-card">Ładowanie użytkowników...</div>
            ) : users.length === 0 ? (
                <div className="users-admin-card">Brak użytkowników w bazie danych.</div>
            ) : (
                <div className="users-admin-table-wrapper">
                    <table className="users-admin-table">
                        <thead>
                        <tr>
                            <th>Użytkownik</th>
                            <th>Username</th>
                            <th>Rola</th>
                            <th>Budynki</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td><strong>{user.name}</strong></td>
                                <td>{user.email || '—'}</td>
                                <td>
                                        <span className={`users-admin-role ${
                                            user.role === 'Admin'
                                                ? 'users-admin-role--admin'
                                                : 'users-admin-role--moderator'
                                        }`}>
                                            {user.role}
                                        </span>
                                </td>
                                <td>{getBuildingsText(user)}</td>
                                <td>
                                    <div className="users-admin-actions">
                                        <button type="button" onClick={() => openEditModal(user)}>
                                            Edytuj
                                        </button>

                                        {user.role !== 'Admin' && (
                                            <button
                                                type="button"
                                                className="users-admin-delete"
                                                onClick={() => void handleDelete(user)}
                                            >
                                                Usuń
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <div className="users-admin-modal-backdrop" onMouseDown={closeModal}>
                    <div className="users-admin-modal" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="users-admin-modal__header">
                            <div>
                                <span>{editingUser ? 'Edycja konta' : 'Nowe konto'}</span>
                                <h2>{editingUser ? editingUser.name : 'Dodaj użytkownika'}</h2>
                            </div>

                            <button type="button" onClick={closeModal}>×</button>
                        </div>

                        <form className="users-admin-form" onSubmit={handleSave}>
                            <label>
                                Imię i nazwisko
                                <input
                                    type="text"
                                    value={form.name}
                                    placeholder="Jan Kowalski"
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))}
                                />
                            </label>

                            <label>
                                Nazwa użytkownika
                                <input
                                    type="text"
                                    value={form.username}
                                    placeholder="np. jkowalski"
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        username: event.target.value,
                                    }))}
                                />
                            </label>

                            {!editingUser && (
                                <label>
                                    Hasło
                                    <input
                                        type="password"
                                        value={form.password}
                                        placeholder="Minimum 8 znaków"
                                        onChange={(event) => setForm((current) => ({
                                            ...current,
                                            password: event.target.value,
                                        }))}
                                    />
                                </label>
                            )}

                            <label>
                                Rola
                                <select
                                    value={form.role}
                                    onChange={(event) => {
                                        const role = event.target.value as UserRole;

                                        setForm((current) => ({
                                            ...current,
                                            role,
                                            assignedBuildingIds: role === 'Admin'
                                                ? []
                                                : current.assignedBuildingIds,
                                        }));
                                    }}
                                >
                                    <option value="Moderator">Moderator</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </label>

                            {form.role === 'Moderator' && (
                                <div className="users-admin-buildings">
                                    <div className="users-admin-buildings__title">
                                        <strong>Przypisane budynki</strong>
                                        <span>Możesz zaznaczyć kilka</span>
                                    </div>

                                    <div className="users-admin-buildings__grid">
                                        {buildings.map((building) => {
                                            const selected = form.assignedBuildingIds.includes(building.id);

                                            return (
                                                <label
                                                    key={building.id}
                                                    className={`users-admin-building ${
                                                        selected ? 'users-admin-building--selected' : ''
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => toggleBuilding(building.id)}
                                                    />
                                                    <span>{building.code}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {form.role === 'Admin' && (
                                <div className="users-admin-info">
                                    Admin ma dostęp do wszystkich budynków.
                                </div>
                            )}

                            {error && <div className="users-admin-error">{error}</div>}

                            <div className="users-admin-form__actions">
                                <button
                                    type="button"
                                    className="users-admin-secondary"
                                    disabled={saving}
                                    onClick={closeModal}
                                >
                                    Anuluj
                                </button>

                                <button type="submit" className="users-admin-primary" disabled={saving}>
                                    {saving
                                        ? 'Zapisywanie...'
                                        : editingUser
                                            ? 'Zapisz zmiany'
                                            : 'Utwórz konto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default UsersAdminSection;