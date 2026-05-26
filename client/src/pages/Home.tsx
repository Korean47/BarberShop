import { useEffect, useState } from 'react';
import { Hero } from '../components/landing/Hero';
import { Services } from '../components/landing/Services';
import { Team } from '../components/landing/Team';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { getBarbers } from '../services/api';
import type { Barber } from '../types';

import toast from 'react-hot-toast';

export function Home() {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    getBarbers()
      .then(setBarbers)
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load team data');
      });
  }, []);

  return (
    <>
      <Hero />
      <Services />
      <Team barbers={barbers} />
      <Testimonials />
      <Pricing />
    </>
  );
}
