import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Admin from './pages/Admin';
import Apply from './pages/Apply';
import Book from './pages/Book';
import Buddies from './pages/Buddies';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupClient from './pages/SignupClient';
import Stylists from './pages/Stylists';
import StylistDashboard from './pages/StylistDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-riotBg text-riotText">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stylists" element={<Stylists />} />
              <Route path="/buddies" element={<Buddies />} />
              <Route path="/login" element={<Login />} />
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
          <ToastContainer theme="dark" position="bottom-right" autoClose={2300} />
        </div>
      </Router>
    </AuthProvider>
  );
}
