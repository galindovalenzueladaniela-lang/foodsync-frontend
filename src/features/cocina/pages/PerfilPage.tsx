import { NOMBRE_AREA } from '../../../services/estadosPedido';
import { Encabezado, Reloj } from '../components/Encabezado';
import { listaNombres } from '../components/Sidebar';
import { useSesion } from '../hooks/useSesion';

/* Mi perfil: nombre, rol, área asignada y turno del personal (RF2). */
export function PerfilPage() {
  const { personal } = useSesion();
  const p = personal!;
  const iniciales = p.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('');
  const datos: Array<[string, string]> = [
    ['Rol', p.rol],
    ['Área asignada', p.area === 'todas' ? 'Todas las áreas (pase)' : NOMBRE_AREA[p.area]],
    ['Turno', `${p.turno.nombre} · ${p.turno.horario}`],
    ['Equipo del turno', listaNombres(p.turno.equipo)],
    ['Cuenta', `${p.correo} · Original Auth`],
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 py-5">
      <Encabezado titulo="Mi perfil"><div className="flex-1" /><Reloj /></Encabezado>
      <section className="kds-tarjeta flex max-w-[760px] flex-col gap-6 p-7 text-ink">
        <div className="flex items-center gap-5">
          <span aria-hidden="true" className="display inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-[34px] text-on-primary">{iniciales}</span>
          <div className="flex flex-col gap-1">
            <h2 className="display text-[40px] leading-10">{p.nombre}</h2>
            <span className="text-base text-ink-secondary">{p.rol} · {p.area === 'todas' ? 'Pase' : NOMBRE_AREA[p.area]}</span>
          </div>
        </div>
        <dl className="grid gap-x-8 gap-y-4 border-t border-dashed border-line-dashed pt-5 sm:grid-cols-2">
          {datos.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{k}</dt>
              <dd className="text-[17px] leading-6">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
