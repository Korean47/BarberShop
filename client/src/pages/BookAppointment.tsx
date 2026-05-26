import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Scissors,
  CalendarDays,
  Clock,
  ClipboardList,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getBarbers, getServices, getBarberAvailability, createAppointment } from '../services/api';
import { formatDateToAPI, formatDateLong, formatTime, formatPrice, formatDuration, parseSpecialties, isPastDate, isToday } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import type { Barber, Service, TimeSlot } from '../types';

const steps = [
  { id: 1, label: 'Barber', icon: User },
  { id: 2, label: 'Service', icon: Scissors },
  { id: 3, label: 'Date', icon: CalendarDays },
  { id: 4, label: 'Time', icon: Clock },
  { id: 5, label: 'Details', icon: ClipboardList },
  { id: 6, label: 'Confirm', icon: CheckCircle2 },
];

export function BookAppointment() {
  const [searchParams] = useSearchParams();
  const preselectedBarber = searchParams.get('barber');

  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  // Selections
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isDayOff, setIsDayOff] = useState(false);

  // Customer form
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Load barbers & services
  useEffect(() => {
    Promise.all([getBarbers(), getServices()])
      .then(([b, s]) => {
        setBarbers(b);
        setServices(s);
        if (preselectedBarber) {
          const found = b.find((barber) => barber.id === preselectedBarber);
          if (found) {
            setSelectedBarber(found);
            setStep(2);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load barbers and services');
      })
      .finally(() => setLoading(false));
  }, [preselectedBarber]);

  // Fetch availability when barber + service + date selected
  useEffect(() => {
    if (!selectedBarber || !selectedService || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    const dateStr = formatDateToAPI(selectedDate);
    getBarberAvailability(selectedBarber.id, dateStr, selectedService.duration)
      .then((data) => {
        setAvailableSlots(data.slots);
        setIsDayOff(data.dayOff);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load availability');
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedBarber, selectedService, selectedDate]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!customer.name.trim() || customer.name.trim().length < 2) e.name = 'Name is required (min 2 chars)';
    if (!customer.email.trim() || !/\S+@\S+\.\S+/.test(customer.email)) e.email = 'Valid email is required';
    if (!customer.phone.trim() || customer.phone.trim().length < 7) e.phone = 'Phone is required (min 7 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await createAppointment({
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        date: formatDateToAPI(selectedDate),
        startTime: selectedSlot.start,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        notes: customer.notes || undefined,
      });
      setBooked(true);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 5 && !validateForm()) return;
    setStep((s) => Math.min(s + 1, 6));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedBarber;
      case 2: return !!selectedService;
      case 3: return !!selectedDate;
      case 4: return !!selectedSlot;
      case 5: return true;
      default: return false;
    }
  };

  if (loading) return <PageSpinner />;

  // Success state
  if (booked) {
    return (
      <div className="section-container py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-3">
            Appointment Booked!
          </h2>
          <p className="text-slate-400 mb-2">
            Your appointment with <strong className="text-white">{selectedBarber?.name}</strong> is confirmed.
          </p>
          <p className="text-slate-400 mb-8">
            {selectedDate && formatDateLong(selectedDate)} at {selectedSlot && formatTime(selectedSlot.start)}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setBooked(false); setStep(1); setSelectedBarber(null); setSelectedService(null); setSelectedDate(null); setSelectedSlot(null); setCustomer({ name: '', email: '', phone: '', notes: '' }); }}>
              Book Another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calendar rendering
  const renderCalendar = () => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cells: React.ReactNode[] = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 3);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calYear, calMonth, day);
      const past = isPastDate(date) && !isToday(date);
      const tooFar = date > maxFutureDate;
      const disabled = past || tooFar;
      const todayHighlight = isToday(date);
      const selected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      cells.push(
        <button
          key={day}
          disabled={disabled}
          onClick={() => setSelectedDate(date)}
          className={`
            aspect-square rounded-xl text-sm font-medium transition-all duration-200
            ${disabled ? 'text-slate-700 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
            ${todayHighlight && !selected ? 'ring-1 ring-brand-500/50 text-brand-400' : ''}
            ${selected ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-300'}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            disabled={calMonth === today.getMonth() && calYear === today.getFullYear()}
            onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
              else setCalMonth(calMonth - 1);
            }}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-sm font-semibold text-white">
            {new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            disabled={new Date(calYear, calMonth) >= new Date(today.getFullYear(), today.getMonth() + 2)}
            onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
              else setCalMonth(calMonth + 1);
            }}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    );
  };

  return (
    <div className="section-container py-12">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Book Your Appointment
        </h1>
        <p className="text-slate-400">
          Choose your barber, service, and preferred time.
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800">
            <div
              className="h-full bg-brand-500 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="relative flex flex-col items-center z-10">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : ''}
                    ${isCompleted ? 'bg-brand-500/20 text-brand-400' : ''}
                    ${!isActive && !isCompleted ? 'bg-slate-800 text-slate-600' : ''}
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`
                    text-[10px] sm:text-xs mt-2 transition-colors whitespace-nowrap absolute top-10
                    ${isActive ? 'text-brand-400 font-medium block' : 'text-slate-600 hidden sm:block'}
                  `}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 1: Select Barber */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Choose Your Barber</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {barbers.map((barber) => {
                    const selected = selectedBarber?.id === barber.id;
                    const specialties = parseSpecialties(barber.specialties);
                    return (
                      <Card
                        key={barber.id}
                        hover
                        onClick={() => setSelectedBarber(barber)}
                        className={`flex items-center gap-4 ${
                          selected ? 'ring-2 ring-brand-500 bg-brand-500/5' : ''
                        }`}
                      >
                        <img
                          src={barber.photo}
                          alt={barber.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white">{barber.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {specialties.map((s) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        {selected && (
                          <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Service */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Choose a Service</h2>
                <div className="space-y-3">
                  {services.map((service) => {
                    const selected = selectedService?.id === service.id;
                    return (
                      <Card
                        key={service.id}
                        hover
                        onClick={() => setSelectedService(service)}
                        className={`flex items-center justify-between ${
                          selected ? 'ring-2 ring-brand-500 bg-brand-500/5' : ''
                        }`}
                      >
                        <div>
                          <h3 className="font-semibold text-white">{service.name}</h3>
                          <p className="text-sm text-slate-400 mt-0.5">{service.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="text-brand-400 font-semibold">{formatPrice(service.price)}</span>
                            <span className="text-slate-500">{formatDuration(service.duration)}</span>
                          </div>
                        </div>
                        {selected && (
                          <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 ml-4" />
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Select Date */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Pick a Date</h2>
                <div className="glass-card p-6 max-w-sm mx-auto">
                  {renderCalendar()}
                </div>
                {selectedDate && (
                  <p className="text-center text-sm text-brand-400 mt-4">
                    Selected: {formatDateLong(selectedDate)}
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Select Time */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Select a Time</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Available slots for {selectedBarber?.name} on{' '}
                  {selectedDate && formatDateLong(selectedDate)}
                </p>

                {slotsLoading ? (
                  <div className="py-10 text-center text-slate-500">Loading availability...</div>
                ) : isDayOff ? (
                  <div className="glass-card p-8 text-center">
                    <p className="text-slate-400">
                      {selectedBarber?.name} is not available on this day.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={prevStep}>
                      Pick Another Date
                    </Button>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <p className="text-slate-400">No available slots for this date.</p>
                    <Button variant="outline" className="mt-4" onClick={prevStep}>
                      Pick Another Date
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {availableSlots.map((slot) => {
                      const selected = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={slot.start}
                          onClick={() => setSelectedSlot(slot)}
                          className={`
                            py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200
                            ${
                              selected
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                            }
                          `}
                        >
                          {formatTime(slot.start)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Customer Details */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Your Details</h2>
                <div className="glass-card p-6 space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    error={errors.name}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    error={errors.email}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    error={errors.phone}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any special requests?"
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {step === 6 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Confirm Your Appointment</h2>
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                    <img
                      src={selectedBarber?.photo}
                      alt={selectedBarber?.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{selectedBarber?.name}</h3>
                      <p className="text-sm text-slate-400">Barber</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Service</span>
                      <p className="text-white font-medium">{selectedService?.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Price</span>
                      <p className="text-brand-400 font-semibold">
                        {selectedService && formatPrice(selectedService.price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Date</span>
                      <p className="text-white font-medium">
                        {selectedDate && formatDateLong(selectedDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Time</span>
                      <p className="text-white font-medium">
                        {selectedSlot && `${formatTime(selectedSlot.start)} – ${formatTime(selectedSlot.end)}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration</span>
                      <p className="text-white font-medium">
                        {selectedService && formatDuration(selectedService.duration)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Customer</span>
                      <p className="text-white font-medium">{customer.name}</p>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="pt-3 border-t border-white/5">
                      <span className="text-sm text-slate-500">Notes</span>
                      <p className="text-sm text-slate-300 mt-1">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 6 ? (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              <CheckCircle2 className="w-4 h-4" />
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
