import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function withLayout(children) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={<ProtectedRoute>{withLayout(<Dashboard />)}</ProtectedRoute>}
          />
          <Route
            path="/doctors"
            element={<ProtectedRoute>{withLayout(<Doctors />)}</ProtectedRoute>}
          />
          <Route
            path="/patients"
            element={<ProtectedRoute>{withLayout(<Patients />)}</ProtectedRoute>}
          />
          <Route
            path="/appointments"
            element={<ProtectedRoute>{withLayout(<Appointments />)}</ProtectedRoute>}
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                {withLayout(<Billing />)}
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={<ProtectedRoute>{withLayout(<Reports />)}</ProtectedRoute>}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
