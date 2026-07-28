import type { CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@fontsource-variable/geologica/wght.css';
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css';
import '@fontsource-variable/funnel-display/wght.css';
import '@fontsource-variable/funnel-sans/wght.css';
import './typography-lab.css';

const candidates = [
  { id: 'a', short: 'A', name: 'Bricolage + Instrument', display: '"Bricolage Grotesque Variable"', interface: '"Instrument Sans Variable"', displayWidth: 100, interfaceWidth: 100 },
  { id: 'b', short: 'B', name: 'Martian Grotesk', display: '"Martian Grotesk Variable"', interface: '"Martian Grotesk Variable"', displayWidth: 112, interfaceWidth: 96 },
  { id: 'c', short: 'C', name: 'Barlow + Instrument', display: 'Barlow', interface: '"Instrument Sans Variable"', displayWidth: 100, interfaceWidth: 100 },
  { id: 'd', short: 'D', name: 'Geologica + Atkinson Next', display: '"Geologica Variable"', interface: '"Atkinson Hyperlegible Next Variable"', displayWidth: 100, interfaceWidth: 100 },
  { id: 'e', short: 'E', name: 'Funnel Display + Funnel Sans', display: '"Funnel Display Variable"', interface: '"Funnel Sans Variable"', displayWidth: 100, interfaceWidth: 100 },
] as const;

const services = [
  ['Corte clásico', '/images/corte-clasico.webp', 'Desde $200 MXN'],
  ['Degradado', '/images/degradado.webp', '$250 MXN'],
  ['Corte y barba', '/images/corte-barba.webp', '$300 MXN'],
  ['Corte infantil', '/images/corte-infantil.webp', '$200 MXN'],
  ['Corte personalizado', '/images/corte-personalizado.webp', 'Precio por confirmar'],
] as const;

const days = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] as const;

export function TypographyLab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('candidate') ?? 'a';
  const candidate = candidates.find(({ id }) => id === selectedId) ?? candidates[0];
  const style = {
    '--lab-display': candidate.display,
    '--lab-interface': candidate.interface,
    '--lab-display-width': candidate.displayWidth,
    '--lab-interface-width': candidate.interfaceWidth,
  } as CSSProperties;

  return (
    <main className="type-lab" style={style} data-candidate={candidate.id}>
      <header className="lab-toolbar">
        <div className="lab-toolbar-inner">
          <p>Laboratorio tipográfico · sólo desarrollo</p>
          <nav className="lab-nav" aria-label="Sistemas tipográficos candidatos">
            {candidates.map((item) => (
              <button key={item.id} type="button" aria-pressed={candidate.id === item.id} title={item.name} onClick={() => setSearchParams({ candidate: item.id })}>
                {item.short} · {item.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="lab-content">
        <header className="lab-intro">
          <p className="lab-kicker">Sistema {candidate.short}</p>
          <h1>{candidate.name}</h1>
          <p>El contenido, color, composición y dimensiones son idénticos entre alternativas. Sólo cambian las familias y, en Martian Grotesk, anchos moderados para comprobar su rango variable.</p>
        </header>

        <section className="lab-hero" aria-label="Portada sobre video">
          <video autoPlay loop muted playsInline preload="metadata" poster="/images/hero-local.webp">
            <source src="/videos/Horizontal.mp4" type="video/mp4" />
          </video>
          <div className="lab-hero-copy">
            <p className="lab-kicker">Barbería Norte</p>
            <h2>Cortes y barba, con tiempo para hacerlo bien.</h2>
            <p>Elige servicio, barbero y horario. Tu cita queda lista en pocos pasos, desde cualquier dispositivo.</p>
            <div className="lab-actions">
              <button type="button" className="lab-button">Agendar cita</button>
              <button type="button" className="lab-button lab-button-secondary">Consultar mi cita</button>
            </div>
          </div>
        </section>

        <section className="lab-section" aria-labelledby="lab-services">
          <h2 id="lab-services">Servicios</h2>
          <div className="lab-grid lab-grid-3">
            {services.map(([name, image, price]) => (
              <article className="lab-card lab-service" key={name}>
                <img src={image} alt="" />
                <div><strong>{name}</strong><span>{price}</span><p className="lab-muted">Duración aproximada: 45 minutos.</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="lab-section lab-grid lab-grid-2" aria-label="Calendario y formulario">
          <article className="lab-card lab-calendar">
            <div className="lab-calendar-head"><h3>Selecciona una fecha</h3><strong>Julio de 2026</strong></div>
            <div className="lab-week"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div>
            <div className="lab-days">
              {days.map((day) => <button type="button" key={day} className={`lab-day ${day === 22 ? 'lab-day-selected' : ''} ${day === 19 ? 'lab-day-disabled' : ''}`} aria-pressed={day === 22}>{day}</button>)}
            </div>
            <p className="lab-muted">Lunes · Miércoles · Sábado</p>
            <div className="lab-slots">
              <button type="button" className="lab-slot">10:30 a. m.</button>
              <button type="button" className="lab-slot">12:00 p. m.</button>
              <button type="button" className="lab-slot lab-slot-selected">6:45 p. m.</button>
              <button type="button" className="lab-slot" disabled>No disponible</button>
            </div>
            <p><strong>Horario seleccionado:</strong> 6:45 p. m.</p>
          </article>

          <article className="lab-card">
            <h3>Datos de la cita</h3>
            <form className="lab-form" onSubmit={(event) => event.preventDefault()}>
              <label>Nombre<input value="María Fernanda Hernández Villaseñor" readOnly /></label>
              <label>Teléfono<input type="tel" value="662 123 4567" readOnly /></label>
              <label>Correo electrónico<input type="email" value="maria.hernandez@example.com" readOnly /></label>
              <label>Imagen de referencia<input type="text" value="corte-referencia-frontal.webp" readOnly /></label>
              <label>Forma de pago<select defaultValue="cash"><option value="cash">Pago en efectivo</option><option>Pago en línea</option></select></label>
              <p className="lab-error">Revisa el teléfono e ingresa diez dígitos válidos.</p>
              <div className="lab-actions"><button type="button" className="lab-button">Continuar</button><button type="submit" className="lab-button">Confirmar cita y método de pago</button></div>
            </form>
          </article>
        </section>

        <section className="lab-section lab-grid lab-grid-2" aria-label="Confirmación y administración">
          <article className="lab-card lab-confirmation">
            <p className="lab-kicker">Confirmación</p>
            <h3>Tu cita quedó registrada.</h3>
            <dl>
              <dt>Número de cita</dt><dd>BRB-20487</dd>
              <dt>Fecha</dt><dd>Miércoles 22 de julio</dd>
              <dt>Horario</dt><dd>5:30 p. m.</dd>
              <dt>Total</dt><dd>$250 MXN</dd>
              <dt>Forma de pago</dt><dd>Pago en efectivo</dd>
            </dl>
          </article>

          <article className="lab-card">
            <h3>Administración</h3>
            <div className="lab-grid lab-grid-3" style={{ marginTop: 18 }}>
              <div className="lab-metric"><span>Citas de hoy</span><strong>18</strong></div>
              <div className="lab-metric"><span>Ingreso del día</span><strong>$4,250</strong></div>
              <div className="lab-metric"><span>Próxima cita</span><strong>6:45</strong></div>
            </div>
            <div className="lab-table-wrap">
              <table className="lab-table">
                <thead><tr><th>Servicios</th><th>Barberos</th><th>Horarios</th><th>Cancelaciones</th></tr></thead>
                <tbody><tr><td>Corte personalizado</td><td>Alejandro Villaseñor Ramírez</td><td>10:30 a. m.</td><td>2</td></tr></tbody>
              </table>
            </div>
            <p className="lab-muted">Configuración · Facturación · Suscripción · Última actualización</p>
          </article>
        </section>

        <section className="lab-section" aria-labelledby="lab-stress">
          <h2 id="lab-stress">Prueba de idioma, longitud y ambigüedad</h2>
          <div className="lab-grid lab-grid-2">
            <article className="lab-card lab-stress">
              <p>Agenda tu cita. Consultar mi cita. Selecciona una fecha. Elige un horario disponible. Cualquier barbero disponible. Corte personalizado. Agrega una fotografía de referencia.</p>
              <p>Miércoles 29 de julio. Próxima cita: 6:45 p. m. Total: $250 MXN. Número de cita: BRB-20487.</p>
              <p>¿Deseas cancelar esta cita? La cita ya no puede modificarse. Comunícate con la barbería.</p>
            </article>
            <article className="lab-card">
              <p className="lab-glyphs">áéíóú ÁÉÍÓÚ ñÑ üÜ ¿? ¡! $ % / - 0123456789 0O 1Il</p>
              <p>Nombre largo: María José de los Ángeles Fernández Villaseñor.</p>
              <p>MAYÚSCULAS · minúsculas · Teléfono · Contraseña · Configuración · Facturación · Suscripción.</p>
              <button type="button" className="lab-button">Confirmar cita y conservar la forma de pago seleccionada</button>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
