import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ServiceStep } from './ServiceStep';
import type { Service } from '../../types';

const service: Service = {
  id: 'service-1',
  name: 'Corte clásico',
  description: 'Máquina, tijera y peinado.',
  imageUrl: null,
  duration: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  price: 350,
  priceCents: 35000,
  category: 'Cabello',
  categoryId: 'category-1',
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('ServiceStep', () => {
  it('exposes selection state and invokes the selection contract', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ServiceStep services={[service]} selectedId={null} onSelect={onSelect} />);
    const button = screen.getByRole('button', { name: /Corte clásico/ });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(onSelect).toHaveBeenCalledWith('service-1');
  });
});
