import { ArrowLeft, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="section-container grid min-h-[70vh] place-items-center py-20 text-center">
      <div><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--brand-dark)] text-[var(--brand-soft)]"><Scissors className="h-8 w-8" /></span><p className="mt-7 text-xs font-bold uppercase tracking-[.25em] text-[var(--brand)]">Error 404</p><h1 className="mt-3 font-display text-5xl font-semibold">Esta página tomó otro camino.</h1><p className="mx-auto mt-4 max-w-md text-[#657069]">El enlace puede estar vencido o la dirección no existe.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 py-3 font-semibold text-white"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link></div>
    </div>
  );
}
