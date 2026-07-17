import { ArrowLeft, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="section-container grid min-h-[70vh] place-items-center py-20 text-center">
      <div><span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-[var(--brand)] text-[var(--brand-soft)]"><Scissors className="h-8 w-8" /></span><p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-[var(--accent)]">Error 404</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Esta página tomó otro camino.</h1><p className="mx-auto mt-4 max-w-md text-[#587078]">El enlace puede estar vencido o la dirección no existe.</p><Link to="/" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--brand)] px-6 font-black text-white"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link></div>
    </div>
  );
}
