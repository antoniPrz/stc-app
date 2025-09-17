import type { CollectionDefinition } from '../models/firestore';

interface CollectionCardProps {
  definition: CollectionDefinition;
}

const formatFieldName = (field: string) => field.replace(/([A-Z])/g, ' $1');

export function CollectionCard({ definition }: CollectionCardProps) {
  const fields = Object.entries(definition.schema);

  return (
    <article className="collection-card">
      <header>
        <h2>{definition.name}</h2>
        <p>{definition.description}</p>
      </header>

      <table className="schema-table">
        <thead>
          <tr>
            <th>Campo</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(([key, value]) => (
            <tr key={key}>
              <td>{formatFieldName(key)}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {definition.subcollections?.map((subcollection) => (
        <div className="subcollections" key={subcollection.name}>
          <h3>Subcolección: {subcollection.name}</h3>
          <p>{subcollection.description}</p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(subcollection.schema).map(([key, value]) => (
                <tr key={key}>
                  <td>{formatFieldName(key)}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </article>
  );
}
