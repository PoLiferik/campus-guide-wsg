import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';
import CampusPage from './pages/CampusPage';
import LoginPage from './pages/login/LoginPage';
import LecturerPage from './pages/lecturer/LecturerPage';
import AdminPage from './pages/admin/AdminPage';
import AccountMenu from './components/AccountMenu/AccountMenu';
import AdminRoute from './components/AdminRoute';
import './App.css';

function App() {
    return (
        <>
            <AccountMenu/>

            <Routes>
                <Route
                    path="/"
                    element={
                        <CampusPage/>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <LoginPage/>
                    }
                />
                <Route
                    path="/lecturer"
                    element={
                        <LecturerPage/>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
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