import { useMemo, useState } from 'react';
import type { IntakeDashboardData, IntakeOrder } from '../data/mockOrders';
import { useIntakeData } from '../hooks/useIntakeData';
import type { OrderPriority, OrderStatus } from '../models/firestore';

export type IntakeSectionKey = 'overview' | 'orders' | 'technicians' | 'checklists';

const statusLabels: Record<OrderStatus, string> = {
  Ingreso: 'Ingreso',
  Diagnóstico: 'Diagnóstico',
  Presupuesto: 'Presupuesto',
  Aprobado: 'Aprobado',
  Reparando: 'Reparando',
  QA: 'QA',
  Listo: 'Listo',
  Entregado: 'Entregado',
  'No Reparado': 'No Reparado'
};

const priorityLabels: Record<OrderPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja'
};

const priorityColors: Record<OrderPriority, string> = {
  alta: '#dc2626',
  media: '#f97316',
  baja: '#16a34a'
};

const intakeStatuses: Array<'Todos' | 'Ingreso' | 'Diagnóstico' | 'Presupuesto'> = [
  'Todos',
  'Ingreso',
  'Diagnóstico',
  'Presupuesto'
];

const priorityFilters: Array<'Todas' | OrderPriority> = ['Todas', 'alta', 'media', 'baja'];

const priorityWeight: Record<OrderPriority, number> = {
  alta: 3,
  media: 2,
  baja: 1
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

const sortOrders = (orders: IntakeOrder[]) =>
  [...orders].sort((a, b) => {
    if (a.prioridad === b.prioridad) {
      return b.tiempoEnColaHoras - a.tiempoEnColaHoras;
    }

    return priorityWeight[b.prioridad] - priorityWeight[a.prioridad];
  });

type StatusFilter = (typeof intakeStatuses)[number];
type PriorityFilter = (typeof priorityFilters)[number];

type FilterState = {
  status: StatusFilter;
  priority: PriorityFilter;
  search: string;
};

const initialFilters: FilterState = {
  status: 'Todos',
  priority: 'Todas',
  search: ''
};

interface IntakeDashboardProps {
  section: IntakeSectionKey;
}

export function IntakeDashboard({ section }: IntakeDashboardProps) {
  const { data, loading, error, usingMock } = useIntakeData();

  if (loading) {
    return (
      <div className="page-loading">
        <span className="spinner" aria-hidden /> Cargando datos de Firebase…
      </div>
    );
  }

  const banner = (error || usingMock) && (
    <div className={`data-source-banner ${error ? 'error' : 'warning'}`}>
      {error ? (
        <p>
          Ocurrió un problema al obtener datos de Firebase. Se muestran los datos de ejemplo para
          continuar trabajando.
        </p>
      ) : (
        <p>
          Aún no hay datos en Firebase para la recepción. Se muestran los datos mock mientras
          configuras el proyecto.
        </p>
      )}
    </div>
  );

  let content: JSX.Element | null = null;

  switch (section) {
    case 'overview':
      content = <OverviewSection data={data} />;
      break;
    case 'orders':
      content = <OrdersSection data={data} />;
      break;
    case 'technicians':
      content = <TechniciansSection data={data} />;
      break;
    case 'checklists':
      content = <ChecklistsSection />;
      break;
    default:
      content = null;
  }

  return (
    <>
      {banner}
      {content}
    </>
  );
}

function OverviewSection({ data }: { data: IntakeDashboardData }) {
  const sortedOrders = useMemo(() => sortOrders(data.orders), [data.orders]);
  const statusBreakdown = useMemo(() => {
    const draft: Record<string, number> = {};
    for (const order of data.orders) {
      draft[order.estado] = (draft[order.estado] ?? 0) + 1;
    }
    return Object.entries(draft)
      .filter(([status]) => ['Ingreso', 'Diagnóstico', 'Presupuesto'].includes(status))
      .map(([status, count]) => ({ status: status as OrderStatus, count }));
  }, [data.orders]);

  const channelBreakdown = useMemo(() => {
    const draft: Record<string, number> = {};
    for (const order of data.orders) {
      draft[order.canal] = (draft[order.canal] ?? 0) + 1;
    }
    return Object.entries(draft)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count);
  }, [data.orders]);

  const topTags = useMemo(() => {
    const draft: Record<string, number> = {};
    for (const order of data.orders) {
      for (const tag of order.tags) {
        draft[tag] = (draft[tag] ?? 0) + 1;
      }
    }
    return Object.entries(draft)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [data.orders]);

  const nextActions = sortedOrders.slice(0, 3);

  return (
    <div className="page-section intake-overview">
      <section className="summary-grid">
        <SummaryCard label="Ingresos hoy" value={data.summary.totalHoy} highlight />
        <SummaryCard label="Pendientes de diagnóstico" value={data.summary.pendientesDiagnostico} />
        <SummaryCard label="En presupuesto" value={data.summary.enPresupuesto} />
        <SummaryCard label="Prioridad alta" value={data.summary.prioridadAlta} emphasize />
        <SummaryCard label="Riesgo SLA" value={data.summary.slaRiesgo} warn />
      </section>

      <section className="overview-grid">
        <div className="panel next-actions">
          <header className="panel-header">
            <h3>Siguientes acciones</h3>
            <span className="hint">Prioriza estos diagnósticos</span>
          </header>
          <ol>
            {nextActions.map((order) => (
              <li key={order.ordenId}>
                <div className="action-head">
                  <strong>{order.ordenId}</strong>
                  <span className="priority-pill" style={{ backgroundColor: priorityColors[order.prioridad] }}>
                    {priorityLabels[order.prioridad]}
                  </span>
                </div>
                <p>
                  {order.equipo} — {order.cliente}
                </p>
                <span className="action-meta">
                  {statusLabels[order.estado]} · {order.canal} · {order.tiempoEnColaHoras.toFixed(1)}h en cola
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="panel overview-distribution">
          <header className="panel-header">
            <h3>Distribución actual</h3>
            <span className="hint">Estados y canales de ingreso</span>
          </header>
          <div className="distribution-columns">
            <div>
              <h4>Por estado</h4>
              <ul className="metric-list">
                {statusBreakdown.map(({ status, count }) => (
                  <li key={status}>
                    <span>{statusLabels[status]}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Por canal</h4>
              <ul className="metric-list">
                {channelBreakdown.map(({ channel, count }) => (
                  <li key={channel}>
                    <span>{channel}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="panel overview-tags">
          <header className="panel-header">
            <h3>Tags más frecuentes</h3>
            <span className="hint">Top 6 del día</span>
          </header>
          <div className="tag-cloud">
            {topTags.map(({ tag, count }) => (
              <span key={tag} className="tag">
                {tag} · {count}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function OrdersSection({ data }: { data: IntakeDashboardData }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const filteredOrders = useMemo(() => {
    return data.orders.filter((order) => {
      if (filters.status !== 'Todos' && order.estado !== filters.status) {
        return false;
      }

      if (filters.priority !== 'Todas' && order.prioridad !== filters.priority) {
        return false;
      }

      if (filters.search.trim()) {
        const needle = filters.search.toLowerCase();
        const haystack = [order.ordenId, order.cliente, order.equipo, order.tags.join(' ')]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(needle)) {
          return false;
        }
      }

      return true;
    });
  }, [data.orders, filters]);

  const orderedItems = useMemo(() => sortOrders(filteredOrders), [filteredOrders]);

  return (
    <div className="page-section intake-orders">
      <section className="filters-section">
        <div className="search-box">
          <label htmlFor="search">Buscar</label>
          <input
            id="search"
            type="search"
            placeholder="Orden, cliente o equipo"
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                search: event.target.value
              }))
            }
          />
        </div>
        <div className="select-control">
          <label htmlFor="status-filter">Estado</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status: event.target.value as StatusFilter
              }))
            }
          >
            {intakeStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="select-control">
          <label htmlFor="priority-filter">Prioridad</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                priority: event.target.value as PriorityFilter
              }))
            }
          >
            {priorityFilters.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="orders-panel">
        <header className="panel-header">
          <h2>Órdenes en recepción ({orderedItems.length})</h2>
          <span className="hint">Ordenadas por prioridad y tiempo en cola</span>
        </header>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Cliente</th>
              <th>Equipo</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Tiempo</th>
              <th>Canal</th>
              <th>Tags</th>
              <th>Técnico sugerido</th>
              <th>Accesorios</th>
            </tr>
          </thead>
          <tbody>
            {orderedItems.length === 0 && (
              <tr>
                <td colSpan={10} className="empty-state">
                  No hay órdenes con los filtros seleccionados.
                </td>
              </tr>
            )}
            {orderedItems.map((order) => (
              <tr key={order.ordenId}>
                <td>
                  <span className="order-id">{order.ordenId}</span>
                  <span className="order-time">{formatTime(order.fechaIngreso)}</span>
                </td>
                <td>{order.cliente}</td>
                <td>{order.equipo}</td>
                <td>
                  <span className={`status-badge status-${order.estado.toLowerCase()}`}>
                    {statusLabels[order.estado]}
                  </span>
                </td>
                <td>
                  <span
                    className="priority-pill"
                    style={{ backgroundColor: priorityColors[order.prioridad] }}
                  >
                    {priorityLabels[order.prioridad]}
                  </span>
                </td>
                <td>
                  <strong>{order.tiempoEnColaHoras.toFixed(1)}h</strong>
                </td>
                <td>{order.canal}</td>
                <td>
                  <div className="tag-list">
                    {order.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="technician-cell">
                    <span>{order.tecnicoSugerido ?? 'Por asignar'}</span>
                    <button type="button" className="btn tiny">Asignar</button>
                  </div>
                </td>
                <td>
                  <div className="accessory-list">
                    {order.accesorios.length > 0 ? (
                      order.accesorios.map((item) => (
                        <span key={item} className="accessory">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="muted">Sin accesorios</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function TechniciansSection({ data }: { data: IntakeDashboardData }) {
  const totals = useMemo(() => {
    return data.technicians.reduce(
      (acc, technician) => {
        acc.asignadas += technician.ordenesAsignadas;
        acc.pendientes += technician.ordenesPendientesDiagnostico;
        return acc;
      },
      { asignadas: 0, pendientes: 0 }
    );
  }, [data.technicians]);

  return (
    <div className="page-section intake-technicians">
      <section className="technician-summary">
        <div className="metric-badge">
          <span>Órdenes asignadas</span>
          <strong>{totals.asignadas}</strong>
        </div>
        <div className="metric-badge warn">
          <span>Pendientes de diagnóstico</span>
          <strong>{totals.pendientes}</strong>
        </div>
        <div className="metric-badge ghost">
          <span>Técnicos activos</span>
          <strong>{data.technicians.length}</strong>
        </div>
      </section>

      <section className="panel technician-board">
        <header className="panel-header">
          <h3>Detalle por técnico</h3>
          <span className="hint">Carga y especialidades</span>
        </header>
        <ul className="technician-list">
          {data.technicians.map((technician) => (
            <li key={technician.uid}>
              <div className="technician-info">
                <div className="technician-info__head">
                  <strong>{technician.nombre}</strong>
                  {technician.especialidades[0] && (
                    <span className="skill-pill">{technician.especialidades[0]}</span>
                  )}
                </div>
                <span className="muted">
                  {technician.especialidades.length
                    ? technician.especialidades.join(' • ')
                    : 'Sin especialidades registradas'}
                </span>
              </div>
              <div className="technician-metrics">
                <span className="metric">
                  <label>Asignadas</label>
                  <span>{technician.ordenesAsignadas}</span>
                </span>
                <span className="metric">
                  <label>Por diagnóstico</label>
                  <span>{technician.ordenesPendientesDiagnostico}</span>
                </span>
              </div>
              <div className="technician-actions">
                <button type="button" className="btn secondary small">
                  Asignar siguiente
                </button>
                <button type="button" className="btn ghost small">
                  Ver historial
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ChecklistsSection() {
  return (
    <div className="page-section intake-checklists">
      <section className="panel">
        <header className="panel-header">
          <h3>Checklist operativo</h3>
          <span className="hint">Aplicar en cada ingreso</span>
        </header>
        <ul className="checklist">
          <li>Confirmar identidad y datos de contacto del cliente.</li>
          <li>Verificar estado del equipo, anotar golpes, rayas y accesorios.</li>
          <li>Registrar contraseña/patrón de acceso o anotar no entregada.</li>
          <li>Tomar 3 fotos mínimas (frente, reverso, puntos dañados).</li>
          <li>Etiquetar equipo y accesorios con QR generado.</li>
          <li>Cargar observaciones en el log de la orden (subcolección logs).</li>
        </ul>
      </section>

      <section className="panel resource-panel">
        <header className="panel-header">
          <h3>Plantillas y recursos</h3>
        </header>
        <ul className="resource-list">
          <li>
            <span className="resource-title">Formulario ingreso express</span>
            <span className="muted">Google Forms · captura rápida en mostrador</span>
          </li>
          <li>
            <span className="resource-title">Manual fotográfico para recepción</span>
            <span className="muted">PDF · pasos y ejemplos por categoría</span>
          </li>
          <li>
            <span className="resource-title">Checklist imprimible</span>
            <span className="muted">Hoja A5 · firma del cliente</span>
          </li>
        </ul>
      </section>

      <section className="panel">
        <header className="panel-header">
          <h3>Notas operativas</h3>
        </header>
        <ul className="notes-list">
          <li>Repuestos solicitados en diagnóstico deben registrarse en el movimiento de inventario.</li>
          <li>
            Si el cliente rechaza presupuesto, cerrar la orden como "No Reparado" y adjuntar informe breve.
          </li>
          <li>Garantía estándar: 90 días salvo aviso; registrar fecha exacta en el campo garantía.</li>
        </ul>
      </section>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  highlight?: boolean;
  emphasize?: boolean;
  warn?: boolean;
};

function SummaryCard({ label, value, highlight, emphasize, warn }: SummaryCardProps) {
  const classes = ['summary-card'];
  if (highlight) classes.push('highlight');
  if (emphasize) classes.push('emphasize');
  if (warn) classes.push('warn');

  return (
    <article className={classes.join(' ')}>
      <span className="summary-value">{value}</span>
      <span className="summary-label">{label}</span>
    </article>
  );
}
