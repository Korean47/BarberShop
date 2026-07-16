import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { PageSpinner } from './components/ui/Spinner';
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const BookAppointment = lazy(() => import('./pages/BookAppointment').then((module) => ({ default: module.BookAppointment })));
const ManageAppointment = lazy(() => import('./pages/ManageAppointment').then((module) => ({ default: module.ManageAppointment })));
const BarberDetails = lazy(() => import('./pages/BarberDetails').then((module) => ({ default: module.BarberDetails })));
const Contact = lazy(() => import('./pages/Contact').then((module) => ({ default: module.Contact })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then((module) => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminAppointments = lazy(() => import('./pages/AdminAppointments').then((module) => ({ default: module.AdminAppointments })));
const AdminBarbers = lazy(() => import('./pages/AdminBarbers').then((module) => ({ default: module.AdminBarbers })));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers').then((module) => ({ default: module.AdminCustomers })));
const AdminFinances = lazy(() => import('./pages/AdminFinances').then((module) => ({ default: module.AdminFinances })));
const AdminInventory = lazy(() => import('./pages/AdminInventory').then((module) => ({ default: module.AdminInventory })));
const AdminDocuments = lazy(() => import('./pages/AdminDocuments').then((module) => ({ default: module.AdminDocuments })));
const AdminSettings = lazy(() => import('./pages/AdminSettings').then((module) => ({ default: module.AdminSettings })));
const AdminBilling = lazy(() => import('./pages/AdminBilling').then((module) => ({ default: module.AdminBilling })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));

function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSpinner />;
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: '#17211d', color: '#fffdf8', borderRadius: '14px', fontSize: '14px' },
              success: { iconTheme: { primary: '#d39a5c', secondary: '#17211d' } },
            }}
          />
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<BookAppointment />} />
                <Route path="/manage/:token" element={<ManageAppointment />} />
                <Route path="/barbers/:id" element={<BarberDetails />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="finances" element={<AdminFinances />} />
                  <Route path="barbers" element={<AdminBarbers />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="billing" element={<AdminBilling />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TenantProvider>
  );
}
