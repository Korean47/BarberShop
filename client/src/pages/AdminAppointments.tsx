import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  Filter,
  X,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointments, getBarbers, cancelAppointment, updateAppointment } from '../services/api';
import {
  formatDateToAPI,
  formatDateLong,
  formatDateShort,
  formatTime,
  formatPrice,
  isToday,
} from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import type { Appointment, Barber, AppointmentStatus } from '../types';

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState(formatDateToAPI(new Date()));
  const [filterBarber, setFilterBarber] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal state
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<AppointmentStatus>('confirmed');
  const [editNotes, setEditNotes] = useState('');

  // View mode
  const [view, setView] = useState<'table' | 'timeline'>('table');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appts, barbersList] = await Promise.all([
        getAppointments({
          date: filterDate || undefined,
          barberId: filterBarber || undefined,
          status: filterStatus || undefined,
        }),
        getBarbers(),
      ]);
      setAppointments(appts);
      setBarbers(barbersList);
    } catch (err) {
      console.error(err);
      toast.error('No pudimos cargar la agenda');
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterBarber, filterStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleCancel = async (id: string) => {
    if (!confirm('¿Deseas cancelar esta cita?')) return;
    try {
      await cancelAppointment(id);
      toast.success('Cita cancelada');
      fetchData();
    } catch {
      toast.error('No pudimos cancelar la cita');
    }
  };

  const handleEdit = (appt: Appointment) => {
    setSelectedAppt(appt);
    setEditStatus(appt.status);
    setEditNotes(appt.notes || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAppt) return;
    try {
      await updateAppointment(selectedAppt.id, {
        status: editStatus,
        notes: editNotes,
      });
      toast.success('Cita actualizada');
      setEditModalOpen(false);
      fetchData();
    } catch {
      toast.error('No pudimos actualizar la cita');
    }
  };

  const handleViewDetail = (appt: Appointment) => {
    setSelectedAppt(appt);
    setDetailModalOpen(true);
  };

  // Navigate date
  const changeDate = (delta: number) => {
    const d = new Date(filterDate);
    d.setDate(d.getDate() + delta);
    setFilterDate(formatDateToAPI(d));
  };

  // Stats
  const todayAppts = appointments.filter(
    (a) => a.status !== 'cancelled'
  );
  const totalRevenue = todayAppts.reduce((sum, a) => sum + a.service.price, 0);
  const confirmedCount = todayAppts.filter((a) => a.status === 'confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  // Timeline hours
  const timelineHours = Array.from({ length: 13 }, (_, i) => i + 8); // 8am - 8pm

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operación diaria"
        title="Agenda y citas"
        description="Organiza el día, confirma asistencias y consulta los detalles de cada servicio."
        action={
          <Button onClick={() => window.open('/book', '_blank')}>
            <Calendar className="h-4 w-4" />
            Nueva cita
          </Button>
        }
      />
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Citas del día',
            value: todayAppts.length,
            icon: Calendar,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Confirmadas',
            value: confirmedCount,
            icon: Users,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Pendientes',
            value: pendingCount,
            icon: Clock,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
          {
            label: 'Ingreso del día',
            value: formatPrice(totalRevenue),
            icon: DollarSign,
            color: 'text-brand-400',
            bg: 'bg-brand-500/10',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters bar */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date navigation */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
            <button
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-sm font-medium text-white min-w-[120px] text-center">
              {isToday(new Date(filterDate + 'T00:00:00'))
                ? 'Today'
                : formatDateShort(new Date(filterDate + 'T00:00:00'))}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date picker */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark]"
          />

          {/* Barber filter */}
          <select
            value={filterBarber}
            onChange={(e) => setFilterBarber(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark]"
          >
            <option value="">Todos los barberos</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark]"
          >
            <option value="">Todos los estados</option>
            <option value="confirmed">Confirmada</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelada</option>
            <option value="completed">Completada</option>
          </select>

          {/* Clear filters */}
          {(filterBarber || filterStatus) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilterBarber(''); setFilterStatus(''); }}
            >
              <X className="w-3 h-3" />
              Limpiar
            </Button>
          )}

          <div className="ml-auto flex gap-1">
            <Button
              variant={view === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('table')}
            >
              <Filter className="w-3 h-3" />
              Lista
            </Button>
            <Button
              variant={view === 'timeline' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('timeline')}
            >
              <Clock className="w-3 h-3" />
              Horario
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <PageSpinner />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="Sin citas"
          description="No encontramos citas con los filtros seleccionados."
          icon="calendar"
        />
      ) : view === 'table' ? (
        /* Table view */
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Horario</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Barbero</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Servicio</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">{appt.customer.name}</div>
                      <div className="text-xs text-slate-500">{appt.customer.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={appt.barber.photo}
                          alt={appt.barber.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-sm text-slate-300">{appt.barber.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-300">{appt.service.name}</div>
                      <div className="text-xs text-brand-400">{formatPrice(appt.service.price)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={appt.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(appt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(appt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(appt.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Cancel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline view */
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Agenda del día · {formatDateLong(new Date(filterDate + 'T00:00:00'))}
          </h3>
          <div className="space-y-0">
            {timelineHours.map((hour) => {
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
              const hourAppts = appointments.filter((a) => {
                const h = parseInt(a.startTime.split(':')[0]);
                return h === hour && a.status !== 'cancelled';
              });

              return (
                <div key={hour} className="flex gap-4 min-h-[60px] group">
                  {/* Time label */}
                  <div className="w-16 flex-shrink-0 text-xs text-slate-600 pt-1 text-right">
                    {formatTime(timeStr)}
                  </div>

                  {/* Timeline line */}
                  <div className="relative flex-shrink-0 w-px bg-slate-800 group-first:mt-2">
                    <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-slate-700 group-hover:bg-brand-500 transition-colors" />
                  </div>

                  {/* Appointments */}
                  <div className="flex-1 pb-4">
                    {hourAppts.length > 0 ? (
                      <div className="space-y-2">
                        {hourAppts.map((appt) => (
                          <div
                            key={appt.id}
                            onClick={() => handleViewDetail(appt)}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 cursor-pointer hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">
                                {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                              </span>
                              <Badge status={appt.status} />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <img
                                src={appt.barber.photo}
                                alt={appt.barber.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span>{appt.barber.name}</span>
                              <span>•</span>
                              <span>{appt.customer.name}</span>
                              <span>•</span>
                              <span>{appt.service.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar cita"
      >
        {selectedAppt && (
          <div className="space-y-4">
            <div className="text-sm text-slate-400">
              {selectedAppt.customer.name} — {selectedAppt.service.name}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Estado</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as AppointmentStatus)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white [color-scheme:dark]"
              >
                <option value="confirmed">Confirmada</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Notas</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200 resize-none"
                placeholder="Agrega una nota..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>Guardar cambios</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detalle de la cita"
      >
        {selectedAppt && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
              <img
                src={selectedAppt.barber.photo}
                alt={selectedAppt.barber.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-white">{selectedAppt.barber.name}</h3>
                <p className="text-xs text-slate-400">Barbero</p>
              </div>
              <div className="ml-auto">
                <Badge status={selectedAppt.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Cliente</span>
                <p className="text-white">{selectedAppt.customer.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Correo</span>
                <p className="text-white">{selectedAppt.customer.email}</p>
              </div>
              <div>
                <span className="text-slate-500">Servicio</span>
                <p className="text-white">{selectedAppt.service.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Precio</span>
                <p className="text-brand-400 font-semibold">{formatPrice(selectedAppt.service.price)}</p>
              </div>
              <div>
                <span className="text-slate-500">Fecha</span>
                <p className="text-white">{formatDateLong(new Date(selectedAppt.date))}</p>
              </div>
              <div>
                <span className="text-slate-500">Horario</span>
                <p className="text-white">{formatTime(selectedAppt.startTime)} – {formatTime(selectedAppt.endTime)}</p>
              </div>
            </div>

            {selectedAppt.notes && (
              <div className="pt-3 border-t border-slate-700">
                <span className="text-sm text-slate-500">Notas</span>
                <p className="text-sm text-slate-300 mt-1">{selectedAppt.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDetailModalOpen(false)}>
                Cerrar
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleEdit(selectedAppt);
                }}
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
