import { useMemo, useState } from 'react';
import { mockIntakeData } from '../data/mockOrders';
import type { OrderPriority, OrderStatus } from '../models/firestore';

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

const tagOptions = ['Todos', ...mockIntakeData.tagsDisponibles];

type StatusFilter = (typeof intakeStatuses)[number];
type PriorityFilter = (typeof priorityFilters)[number];

type FilterState = {
  status: StatusFilter;
  priority: PriorityFilter;
  tag: string;
  search: string;
};

const initialFilters: FilterState = {
  status: 'Todos',
  priority: 'Todas',
  tag: 'Todos',
  search: ''
};

export function IntakeDashboard() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const filteredOrders = useMemo(() => {
    return mockIntakeData.orders.filter((order) => {
      if (filters.status !== 'Todos' && order.estado !== filters.status) {
        return false;
      }

      if (filters.priority !== 'Todas' && order.prioridad !== filters.priority) {
        return false;
      }

      if (filters.tag !== 'Todos' && !order.tags.includes(filters.tag)) {
        return false;
      }

      if (filters.search.trim()) {
        const needle = filters.search.toLowerCase();
        const haystack = [
          order.ordenId,
          order.cliente,
          order.equipo,
          order.tags.join(' ')
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(needle)) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const orderedItems = useMemo(() => {
    const priorityWeight: Record<OrderPriority, number> = {
      alta: 3,
      media: 2,
      baja: 1
    };

    return [...filteredOrders].sort((a, b) => {
      if (a.prioridad === b.prioridad) {
        return b.tiempoEnColaHoras - a.tiempoEnColaHoras;
      }

      return priorityWeight[b.prioridad] - priorityWeight[a.prioridad];
    });
  }, [filteredOrders]);

  const nextActions = useMemo(
    () => orderedItems.slice(0, 3).map((order) => order.ordenId),
    [orderedItems]
  );

  return (
    <div className="intake-dashboard">
      <div className="dashboard-header">
        <div className="badge primary">Dashboard · Ingreso de equipos</div>
        <h1>Recepción y triage del taller</h1>
        <p>
          Controla qué equipos entraron hoy, prioriza diagnósticos y asigna técnicos según la
          capacidad del taller. Todos los datos son mock para validar la interfaz.
        </p>
        <div className="header-actions">
          <button type="button" className="btn primary">
            + Recepcionar nuevo equipo
          </button>
          <button type="button" className="btn ghost">Imprimir etiquetas QR</button>
        </div>
      </div>

      <section className="summary-cards">
        <SummaryCard label="Ingresos hoy" value={mockIntakeData.summary.totalHoy} highlight />
        <SummaryCard label="Pendientes de diagnóstico" value={mockIntakeData.summary.pendientesDiagnostico} />
        <SummaryCard label="En presupuesto" value={mockIntakeData.summary.enPresupuesto} />
        <SummaryCard label="Prioridad alta" value={mockIntakeData.summary.prioridadAlta} emphasize />
        <SummaryCard label="Riesgo SLA" value={mockIntakeData.summary.slaRiesgo} warn />
      </section>

      <section className="filters-section">
        <div className="search-box">
          <label htmlFor="search">Buscar</label>
          <input
            id="search"
            type="search"
            placeholder="Orden, cliente, equipo o tag"
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                search: event.target.value
              }))
            }
          />
        </div>
        <FilterGroup
          label="Estado"
          options={intakeStatuses}
          active={filters.status}
          onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
        />
        <FilterGroup
          label="Prioridad"
          options={priorityFilters}
          active={filters.priority}
          onChange={(priority) => setFilters((prev) => ({ ...prev, priority }))}
        />
        <div className="tag-select">
          <label htmlFor="tag-filter">Tag</label>
          <select
            id="tag-filter"
            value={filters.tag}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                tag: event.target.value
              }))
            }
          >
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="layout">
        <div className="orders-panel">
          <header className="panel-header">
            <h2>Órdenes en recepción ({filteredOrders.length})</h2>
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
              {filteredOrders.length === 0 && (
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
                      <span className="order-time">
                        {new Date(order.fechaIngreso).toLocaleTimeString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
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
        </div>

        <aside className="sidebar">
          <div className="panel">
            <header className="panel-header">
              <h3>Carga de técnicos</h3>
              <span className="hint">Ordenes asignadas vs pendientes</span>
            </header>
            <ul className="technician-list">
              {mockIntakeData.technicians.map((technician) => (
                <li key={technician.uid}>
                  <div className="technician-info">
                    <strong>{technician.nombre}</strong>
                    <span className="muted">{technician.especialidades.join(' • ')}</span>
                  </div>
                  <div className="technician-metrics">
                    <span className="metric">
                      <label>Asignadas</label>
                      <span>{technician.ordenesAsignadas}</span>
                    </span>
                    <span className="metric">
                      <label>Por diag.</label>
                      <span>{technician.ordenesPendientesDiagnostico}</span>
                    </span>
                  </div>
                  <button type="button" className="btn secondary">Asignar siguiente</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel next-actions">
            <header className="panel-header">
              <h3>Siguientes acciones</h3>
              <span className="hint">Revisión manual recomendada</span>
            </header>
            <ol>
              {nextActions.map((orderId) => (
                <li key={orderId}>
                  <strong>{orderId}</strong>
                  <span>Completar diagnóstico inicial y adjuntar fotos internas.</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel checklists">
            <header className="panel-header">
              <h3>Checklist de ingreso</h3>
            </header>
            <ul>
              <li>Confirmar datos de contacto del cliente</li>
              <li>Registrar contraseña/patrón del equipo si aplica</li>
              <li>Adjuntar fotos de daños visibles y accesorios</li>
              <li>Etiquetar equipo y accesorios con QR</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

type FilterGroupProps<T extends string> = {
  label: string;
  options: T[];
  active: T;
  onChange: (value: T) => void;
};

function FilterGroup<T extends string>({ label, options, active, onChange }: FilterGroupProps<T>) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="filter-pills">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`pill ${option === active ? 'active' : ''}`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
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
