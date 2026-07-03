import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Theme } from '@astryxdesign/core/theme';
import { butterTheme } from '@astryxdesign/theme-butter/built';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Admin from './pages/Admin';
import Apply from './pages/Apply';
import AuthCallback from './pages/AuthCallback';
import Book from './pages/Book';
import Buddies from './pages/Buddies';
import Dashboard from './pages/Dashboard';
import Home from './pages/HomeAstryx';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import SignupClient from './pages/SignupClient';
import Stylists from './pages/Stylists';
import StylistDashboard from './pages/StylistDashboard';

export default function App() {
  return (
    <Theme theme={butterTheme} mode="light">
      <AuthProvider>
        <Router>
          <div className="rack-astryx-shell min-h-screen">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stylists" element={<Stylists />} />
              <Route path="/stylists/apply" element={<Navigate to="/apply" replace />} />
              <Route path="/buddies" element={<Buddies />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signup/client" element={<SignupClient />} />
              <Route path="/apply" element={<Apply />} />
              <Route
                path="/book/:stylistId"
                element={
                  <ProtectedRoute role="client">
                    <Book />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute role="client">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stylist-dashboard"
                element={
                  <ProtectedRoute role="stylist">
                    <StylistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer theme="light" position="top-center" autoClose={3500} />
          </div>
        </Router>
      </AuthProvider>
    </Theme>
  );
}
