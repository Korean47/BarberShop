import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { BookAppointment } from './pages/BookAppointment';
import { BarberDetails } from './pages/BarberDetails';
import { Contact } from './pages/Contact';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { AdminAppointments } from './pages/AdminAppointments';
import { AdminBarbers } from './pages/AdminBarbers';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminFinances } from './pages/AdminFinances';
import { AdminInventory } from './pages/AdminInventory';
import { AdminDocuments } from './pages/AdminDocuments';
import { AdminSettings } from './pages/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#f59e0b', secondary: '#1e293b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/barbers/:id" element={<BarberDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="finances" element={<AdminFinances />} />
          <Route path="barbers" element={<AdminBarbers />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
