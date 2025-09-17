import { useState } from 'react';
import { DataModelOverview } from './pages/DataModelOverview';
import { IntakeDashboard } from './pages/IntakeDashboard';

type ViewKey = 'intake' | 'model';

type ViewOption = {
  id: ViewKey;
  label: string;
  description: string;
};

const viewOptions: ViewOption[] = [
  {
    id: 'intake',
    label: 'Dashboard ingreso',
    description: 'Gestiona la recepción, priorización y asignación de equipos.'
  },
  {
    id: 'model',
    label: 'Modelo de datos',
    description: 'Referencias de colecciones e índices diseñados en la etapa 1.'
  }
];

function App() {
  const [view, setView] = useState<ViewKey>('intake');

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <span className="logo">Servicio TecAPP</span>
          <span className="version-pill">MVP</span>
        </div>
        <div className="nav-view-picker">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`nav-chip ${view === option.id ? 'active' : ''}`}
              onClick={() => setView(option.id)}
            >
              <span className="nav-chip__label">{option.label}</span>
              <span className="nav-chip__description">{option.description}</span>
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button type="button" className="btn ghost small">
            Compartir guía
          </button>
        </div>
      </nav>

      <main className="app-content">
        {view === 'intake' ? <IntakeDashboard /> : <DataModelOverview />}
      </main>
    </div>
  );
}

export default App;
