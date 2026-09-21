import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import type { ReactNode } from 'react';
import type { User } from '../types/User';

interface AdminRouteProps {
    children: ReactNode;
}

function AdminRoute({ children }: AdminRouteProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi.getCurrentUser()
            .then(setUser)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'Admin') {
        return <Navigate to="/lecturer" replace />;
    }

    return children;
}

export default AdminRoute;