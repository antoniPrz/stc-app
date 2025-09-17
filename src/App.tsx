import { useMemo, useState } from 'react';
import { DataModelOverview } from './pages/DataModelOverview';
import { IntakeDashboard } from './pages/IntakeDashboard';

type ViewKey =
  | 'intake-overview'
  | 'intake-orders'
  | 'intake-technicians'
  | 'intake-checklists'
  | 'model';

type NavSection = {
  title: string;
  items: Array<{
    id: ViewKey;
    label: string;
    description?: string;
  }>;
};

type HeaderAction = {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

type ViewConfig = {
  badge: string;
  title: string;
  description: string;
  actions?: HeaderAction[];
  render: () => JSX.Element;
};

const navSections: NavSection[] = [
  {
    title: 'Recepción',
    items: [
      {
        id: 'intake-overview',
        label: 'Resumen general',
        description: 'Métricas clave, acciones sugeridas y panorama del día.'
      },
      {
        id: 'intake-orders',
        label: 'Cola de órdenes',
        description: 'Filtros y priorización para diagnósticos y presupuestos.'
      },
      {
        id: 'intake-technicians',
        label: 'Carga de técnicos',
        description: 'Disponibilidad, asignaciones recientes y especialidades.'
      },
      {
        id: 'intake-checklists',
        label: 'Checklist de ingreso',
        description: 'Procedimientos y recordatorios para recepción segura.'
      }
    ]
  },
  {
    title: 'Documentación',
    items: [
      {
        id: 'model',
        label: 'Modelo de datos',
        description: 'Colecciones, campos e índices definidos en la etapa 1.'
      }
    ]
  }
];

const viewConfig: Record<ViewKey, ViewConfig> = {
  'intake-overview': {
    badge: 'Dashboard',
    title: 'Recepción · Resumen general',
    description:
      'Visualiza el estado del día en recepción: ingresos, prioridades y próximas acciones recomendadas para mantener el flujo.',
    actions: [
      { label: '+ Nuevo ingreso', variant: 'primary' },
      { label: 'Ver etiquetas QR', variant: 'ghost' }
    ],
    render: () => <IntakeDashboard section="overview" />
  },
  'intake-orders': {
    badge: 'Dashboard',
    title: 'Cola de órdenes y filtros',
    description:
      'Filtra, ordena y prioriza las órdenes en recepción para garantizar diagnósticos y presupuestos dentro del SLA.',
    actions: [
      { label: '+ Nuevo ingreso', variant: 'primary' },
      { label: 'Exportar CSV', variant: 'ghost' }
    ],
    render: () => <IntakeDashboard section="orders" />
  },
  'intake-technicians': {
    badge: 'Dashboard',
    title: 'Carga y disponibilidad de técnicos',
    description:
      'Consulta la carga actual de cada técnico, sus especialidades y asigna la siguiente orden según prioridad y skills.',
    actions: [{ label: 'Asignar automáticamente', variant: 'secondary' }],
    render: () => <IntakeDashboard section="technicians" />
  },
  'intake-checklists': {
    badge: 'Dashboard',
    title: 'Checklist y protocolos de ingreso',
    description:
      'Guía operativa para recepción segura: datos críticos, adjuntos obligatorios y trazabilidad para QA.',
    actions: [{ label: 'Descargar plantilla PDF', variant: 'ghost' }],
    render: () => <IntakeDashboard section="checklists" />
  },
  model: {
    badge: 'Documentación',
    title: 'Modelo de datos · Firestore',
    description:
      'Colecciones, campos, subcolecciones e índices sugeridos para soportar el MVP con consistencia y costos controlados.',
    actions: [{ label: 'Compartir guía', variant: 'ghost' }],
    render: () => <DataModelOverview />
  }
};

export default function App() {
  const [view, setView] = useState<ViewKey>('intake-overview');

  const currentView = useMemo(() => viewConfig[view], [view]);

  return (
    <div className="app-shell">
      <aside className="sidebar-nav">
        <div className="sidebar-brand">
          <span className="logo">Servicio TecAPP</span>
          <span className="version-pill">MVP</span>
        </div>
        {navSections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <span className="sidebar-section__title">{section.title}</span>
            <ul>
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`sidebar-item ${view === item.id ? 'active' : ''}`}
                    onClick={() => setView(item.id)}
                  >
                    <span className="sidebar-item__label">{item.label}</span>
                    {item.description && (
                      <span className="sidebar-item__description">{item.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <footer className="sidebar-footer">
          <button type="button" className="btn ghost small">
            Feedback rápido
          </button>
        </footer>
      </aside>

      <main className="app-main">
        <header className="page-header">
          <div className="page-header__text">
            <span className="badge page-badge">{currentView.badge}</span>
            <h1>{currentView.title}</h1>
            <p>{currentView.description}</p>
          </div>
          {currentView.actions && currentView.actions.length > 0 && (
            <div className="page-header__actions">
              {currentView.actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={`btn ${action.variant ?? 'primary'}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="page-content">{currentView.render()}</div>
      </main>
    </div>
  );
}
