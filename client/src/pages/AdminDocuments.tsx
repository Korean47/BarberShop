import { useState } from 'react';
import { Download, FileCheck2, FileText, FolderOpen, Search, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { documents } from '../data/adminDemo';

export function AdminDocuments() {
  const [query, setQuery] = useState('');
  const filtered = documents.filter((document) =>
    `${document.name} ${document.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Archivo digital"
        title="Documentos"
        description="Centraliza permisos, contratos, comprobantes y formatos administrativos para encontrarlos sin revisar carpetas físicas."
        action={
          <Button onClick={() => toast.success('Selector de archivo preparado')}>
            <Upload className="h-4 w-4" />
            Subir documento
          </Button>
        }
      />

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-200">
        Propuesta visual del expediente digital. Requiere definir almacenamiento, permisos de acceso y política de respaldos.
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="admin-card flex items-center gap-4 p-5">
          <div className="rounded-xl bg-blue-500/10 p-3"><FolderOpen className="h-5 w-5 text-blue-400" /></div>
          <div><p className="text-xl font-bold text-white">24</p><p className="text-sm text-slate-400">Documentos guardados</p></div>
        </article>
        <article className="admin-card flex items-center gap-4 p-5">
          <div className="rounded-xl bg-emerald-500/10 p-3"><FileCheck2 className="h-5 w-5 text-emerald-400" /></div>
          <div><p className="text-xl font-bold text-white">21</p><p className="text-sm text-slate-400">Vigentes y revisados</p></div>
        </article>
        <article className="admin-card flex items-center gap-4 p-5">
          <div className="rounded-xl bg-amber-500/10 p-3"><FileText className="h-5 w-5 text-amber-400" /></div>
          <div><p className="text-xl font-bold text-white">3</p><p className="text-sm text-slate-400">Pendientes de renovar</p></div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_260px]">
        <article className="admin-card overflow-hidden">
          <div className="border-b border-white/5 p-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar documento..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((document) => (
              <div key={document.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10">
                  <FileText className="h-5 w-5 text-brand-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{document.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{document.category} · Actualizado {document.updated}</p>
                </div>
                <span className={`hidden rounded-full px-2.5 py-1 text-xs sm:block ${document.status === 'Por renovar' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {document.status}
                </span>
                <button
                  onClick={() => toast.success(`Descargando ${document.name}`)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                  title="Descargar"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </article>

        <aside className="admin-card h-fit p-5">
          <h3 className="font-semibold text-white">Carpetas</h3>
          <div className="mt-4 space-y-2">
            {[
              ['Todos', 24],
              ['Permisos', 5],
              ['Finanzas', 8],
              ['Legal', 4],
              ['Seguros', 3],
              ['Operación', 4],
            ].map(([name, count], index) => (
              <button
                key={name}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm ${index === 0 ? 'bg-brand-500/10 text-brand-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{name}</span>
                <span className="text-xs">{count}</span>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
