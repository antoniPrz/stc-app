import { CollectionCard } from '../components/CollectionCard';
import { firestoreCollections, suggestedIndexes } from '../models/firestore';

export function DataModelOverview() {
  return (
    <div className="app-container data-model-overview">
      <header>
        <span className="badge">Etapa 1 · Modelo de datos</span>
        <h1>Servicio TecAPP · Diseño de Firestore</h1>
        <p>
          Esta vista resume las colecciones, campos y relaciones necesarias para soportar el
          MVP del servicio técnico. El objetivo es tener una guía clara antes de implementar las
          reglas de seguridad, la interfaz y los flujos operativos.
        </p>
      </header>

      <section>
        <h2 className="subtitle">Colecciones principales</h2>
        <div className="grid">
          {firestoreCollections.map((collection) => (
            <CollectionCard key={collection.name} definition={collection} />
          ))}
        </div>
      </section>

      <section className="indexes-section">
        <h2 className="subtitle">Índices sugeridos</h2>
        <p>
          Los índices permiten que las consultas críticas respondan en menos de un segundo para
          dashboards, reportes y filtros por técnico o modelo.
        </p>
        <ul className="index-list">
          {suggestedIndexes.map((index) => (
            <li key={`${index.collection}-${index.fields.join('-')}`}>
              <strong>{index.collection}</strong>: {index.fields.join(', ')} — {index.description}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
