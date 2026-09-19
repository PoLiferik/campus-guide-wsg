import {
    BrowserRouter,
    Route,
    Routes,
} from 'react-router-dom';

import CampusPage from './pages/CampusPage';
import LecturerPage from './pages/lecturer/LecturerPage';
import AdminPage from './pages/admin/AdminPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<CampusPage />}
                />
                <Route
                    path="/lecturer"
                    element={<LecturerPage />}
                />
                <Route
                    path="/admin"
                    element={<AdminPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}
export default App;