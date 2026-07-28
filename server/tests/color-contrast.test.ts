import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '../src/domain/color-contrast.js';

describe('tenant branding contrast', () => {
  it('calculates the WCAG black/white reference ratio', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('rejects invalid colors without producing NaN downstream', () => {
    expect(Number.isNaN(relativeLuminance('red'))).toBe(true);
    expect(contrastRatio('red', '#ffffff')).toBe(0);
  });
});
