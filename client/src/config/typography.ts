export const typographyPackages = {
  contemporary: {
    id: 'contemporary',
    name: 'Carácter contemporáneo',
    description: 'Bricolage Grotesque para identidad e Instrument Sans para la interfaz.',
    display: '"Bricolage Grotesque Variable", "Bricolage Grotesque Fallback", sans-serif',
    interface: '"Instrument Sans Variable", "Instrument Sans Fallback", system-ui, sans-serif',
  },
  technical: {
    id: 'technical',
    name: 'Directo y técnico',
    description: 'Martian Grotesk en anchos controlados para una identidad más firme.',
    display: '"Martian Grotesk Variable", "Martian Grotesk Fallback", sans-serif',
    interface: '"Martian Grotesk Variable", "Martian Grotesk Fallback", system-ui, sans-serif',
  },
  signage: {
    id: 'signage',
    name: 'Señalética limpia',
    description: 'Barlow para títulos e Instrument Sans para contenido y operación.',
    display: '"Barlow", "Barlow Fallback", sans-serif',
    interface: '"Instrument Sans Variable", "Instrument Sans Fallback", system-ui, sans-serif',
  },
} as const;

export type TypographyPackageId = keyof typeof typographyPackages;

export function normalizeTypographyPackage(value?: string | null): TypographyPackageId {
  return value && value in typographyPackages ? value as TypographyPackageId : 'contemporary';
}
