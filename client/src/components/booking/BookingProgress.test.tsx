import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BookingProgress } from './BookingProgress';

describe('BookingProgress', () => {
  it('announces the current visible step', () => {
    render(<BookingProgress current={3} />);
    expect(screen.getByRole('navigation', { name: 'Progreso de la reserva' })).toBeInTheDocument();
    expect(screen.getByText('Horario').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Confirmación').closest('li')).not.toHaveAttribute('aria-current');
  });
});
