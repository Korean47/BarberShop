import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BookingProgress } from './BookingProgress';

describe('BookingProgress', () => {
  it('announces the current visible step', () => {
    render(<BookingProgress current={3} />);
    expect(screen.getByRole('navigation', { name: 'Progreso de la reservación' })).toBeInTheDocument();
    expect(screen.getByText('Fecha').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Datos').closest('li')).not.toHaveAttribute('aria-current');
  });
});
