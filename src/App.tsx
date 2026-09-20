import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import CampusPage from './pages/CampusPage';

import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';

import LecturerPage from './pages/lecturer/LecturerPage';
import AdminPage from './pages/admin/AdminPage';

import AccountMenu from './components/AccountMenu/AccountMenu';

import './App.css';

function App() {
    return (
        <>
            <AccountMenu />

            <Routes>
                <Route
                    path="/"
                    element={
                        <CampusPage />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <LoginPage />
                    }
                />

                <Route
                    path="/register"
                    element={
                        <RegisterPage />
                    }
                />

                <Route
                    path="/lecturer"
                    element={
                        <LecturerPage />
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminPage />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}

export default App;