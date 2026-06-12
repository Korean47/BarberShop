import { useState } from 'react';
import { Bell, Building2, CalendarClock, CreditCard, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';

const tabs = [
  { id: 'business', label: 'Negocio', icon: Building2 },
  { id: 'schedule', label: 'Horarios', icon: CalendarClock },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck },
];

const fieldClass = 'admin-input mt-2';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('business');
  const [reminders, setReminders] = useState(true);
  const [confirmations, setConfirmations] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const save = () => toast.success('Configuración guardada');

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Preferencias del sistema"
        title="Configuración"
        description="Ajusta los datos del negocio, reglas de agenda, mensajes y permisos desde un solo lugar."
        action={
          <Button onClick={save}>
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="admin-card h-fit p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-500/10 font-medium text-brand-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <article className="admin-card p-5 lg:p-7">
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Información del negocio</h3>
                <p className="mt-1 text-sm text-slate-500">Datos visibles para clientes, comprobantes y comunicación.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm text-slate-300">
                  Nombre comercial
                  <input className={fieldClass} defaultValue="Blades Barbería" />
                </label>
                <label className="text-sm text-slate-300">
                  Teléfono
                  <input className={fieldClass} defaultValue="(662) 123 4567" />
                </label>
                <label className="text-sm text-slate-300">
                  Correo
                  <input className={fieldClass} defaultValue="hola@blades.mx" />
                </label>
                <label className="text-sm text-slate-300">
                  Zona horaria
                  <select className={fieldClass} defaultValue="America/Hermosillo">
                    <option value="America/Hermosillo">Hermosillo (GMT-7)</option>
                    <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300 sm:col-span-2">
                  Dirección
                  <input className={fieldClass} defaultValue="Blvd. Morelos 123, Col. Centro, Hermosillo, Son." />
                </label>
                <label className="text-sm text-slate-300">
                  Moneda
                  <select className={fieldClass} defaultValue="MXN">
                    <option value="MXN">Peso mexicano (MXN)</option>
                    <option value="USD">Dólar estadounidense (USD)</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  Impuesto
                  <input className={fieldClass} defaultValue="16%" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Reglas de agenda</h3>
                <p className="mt-1 text-sm text-slate-500">Define cómo y con cuánta anticipación pueden reservar tus clientes.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm text-slate-300">
                  Anticipación mínima
                  <select className={fieldClass} defaultValue="2">
                    <option value="1">1 hora</option>
                    <option value="2">2 horas</option>
                    <option value="4">4 horas</option>
                    <option value="24">24 horas</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  Ventana máxima de reserva
                  <select className={fieldClass} defaultValue="90">
                    <option value="30">30 días</option>
                    <option value="60">60 días</option>
                    <option value="90">90 días</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  Tiempo entre citas
                  <select className={fieldClass} defaultValue="10">
                    <option value="0">Sin espacio adicional</option>
                    <option value="10">10 minutos</option>
                    <option value="15">15 minutos</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  Política de cancelación
                  <select className={fieldClass} defaultValue="4">
                    <option value="2">2 horas antes</option>
                    <option value="4">4 horas antes</option>
                    <option value="24">24 horas antes</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Mensajes automáticos</h3>
                <p className="mt-1 text-sm text-slate-500">Reduce ausencias y mantén informado al cliente durante todo el proceso.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Confirmación al reservar', description: 'Envía los datos de la cita al cliente.', value: confirmations, setValue: setConfirmations },
                  { label: 'Recordatorio automático', description: 'Envía un aviso 24 horas antes.', value: reminders, setValue: setReminders },
                  { label: 'Campañas y promociones', description: 'Permite enviar novedades a clientes que aceptaron recibirlas.', value: marketing, setValue: setMarketing },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 p-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                    </div>
                    <button
                      onClick={() => item.setValue(!item.value)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${item.value ? 'bg-brand-500' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${item.value ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Métodos de pago</h3>
                <p className="mt-1 text-sm text-slate-500">Define qué opciones se registran en caja y cuáles estarán disponibles en línea.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {['Efectivo', 'Tarjeta', 'Transferencia'].map((method) => (
                  <div key={method} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                    <p className="mt-3 text-sm font-medium text-white">{method}</p>
                    <p className="mt-1 text-xs text-emerald-400">Activo</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                <p className="text-sm font-medium text-white">Pagos en línea</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Esta integración permitiría solicitar anticipos, reducir cancelaciones y liquidar desde el flujo de reserva.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => toast.success('Integración marcada para revisión')}>
                  Revisar integración
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Usuarios y seguridad</h3>
                <p className="mt-1 text-sm text-slate-500">Controla quién puede consultar ingresos, editar citas o administrar personal.</p>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/5">
                {[
                  ['Alejandro Ruiz', 'Administrador', 'Acceso completo'],
                  ['Marcus Chen', 'Barbero', 'Agenda y clientes propios'],
                  ['Laura Gómez', 'Recepción', 'Agenda, caja y clientes'],
                ].map(([name, role, access]) => (
                  <div key={name} className="flex items-center gap-4 border-b border-white/5 p-4 last:border-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sm font-semibold text-slate-300">
                      {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="text-xs text-slate-500">{access}</p>
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs text-brand-400">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
