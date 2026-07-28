import { typographyPackages, type TypographyPackageId } from '../../config/typography';

interface TypographyPackagePickerProps {
  value: TypographyPackageId;
  onChange: (value: TypographyPackageId) => void;
}

export function TypographyPackagePicker({ value, onChange }: TypographyPackagePickerProps) {
  return (
    <section className="mb-7" aria-labelledby="typography-package-heading">
      <h2 id="typography-package-heading" className="type-heading-4">Paquete tipográfico</h2>
      <p className="type-body-small mt-1 text-slate-500">Cada paquete controla familias, pesos, escala, fallbacks y rendimiento. No se admiten fuentes arbitrarias.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Object.values(typographyPackages).map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={value === item.id}
            onClick={() => onChange(item.id)}
            className={`min-h-32 rounded-2xl border p-4 text-left transition ${value === item.id ? 'border-[#183A44] bg-[#E9F1F2] ring-2 ring-[#183A44]/10' : 'border-slate-200 bg-white hover:border-slate-400'}`}
            style={{ fontFamily: item.interface }}
          >
            <strong className="block text-lg" style={{ fontFamily: item.display }}>{item.name}</strong>
            <span className="mt-2 block text-sm leading-5 text-slate-600">{item.description}</span>
            <span className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[#B8543C]">Agenda · 6:45 p. m. · $250</span>
          </button>
        ))}
      </div>
    </section>
  );
}
