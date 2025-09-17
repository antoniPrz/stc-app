export type UserRole = 'admin' | 'tecnico' | 'recepcion';
export type DeviceCategory = 'computador' | 'telefono' | 'tablet' | 'otro';
export type OrderPriority = 'baja' | 'media' | 'alta';
export type OrderStatus =
  | 'Ingreso'
  | 'Diagnóstico'
  | 'Presupuesto'
  | 'Aprobado'
  | 'Reparando'
  | 'QA'
  | 'Listo'
  | 'Entregado'
  | 'No Reparado';

export type InventoryMovementType =
  | 'ingreso'
  | 'egreso'
  | 'ajuste'
  | 'uso-reparacion';

export type EquipmentSaleState = 'nuevo' | 'usado' | 'refurb';

export interface UserDocument {
  uid: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClienteDocument {
  clienteId: string;
  nombre: string;
  telefono: string;
  email?: string;
  rut?: string;
  direccion?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipoCatalogoDocument {
  equipoId: string;
  categoria: DeviceCategory;
  marca: string;
  modelo: string;
  variantes?: string[];
  notasTecnicas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdenEquipoInfo {
  categoria: DeviceCategory;
  marca: string;
  modelo: string;
  serial?: string;
  imei?: string;
  password?: string;
  accesoriosRecibidos?: string[];
}

export interface OrdenFechas {
  ingreso: string;
  diagnostico?: string;
  presupuesto?: string;
  aprobado?: string;
  inicioReparacion?: string;
  qa?: string;
  listo?: string;
  entrega?: string;
}

export interface OrdenPresupuesto {
  monto?: number;
  aprobado: boolean;
  observaciones?: string;
}

export interface OrdenGarantia {
  dias: number;
  vence?: string;
}

export interface OrdenDocument {
  ordenId: string;
  clienteId: string;
  ingresadoPor: string;
  fechaIngreso: string;
  equipo: OrdenEquipoInfo;
  fallaReportada: string;
  estado: OrderStatus;
  prioridad: OrderPriority;
  asignadoA?: string;
  fechas: OrdenFechas;
  presupuesto?: OrdenPresupuesto;
  garantia?: OrdenGarantia;
  fotos?: string[];
  tags?: string[];
  ordenOrigen?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrdenLogType = 'estado' | 'nota' | 'adjunto' | 'usoRepuesto';

export interface OrdenLogDocument {
  logId: string;
  timestamp: string;
  actorUid: string;
  tipo: OrdenLogType;
  mensaje?: string;
  adjuntos?: string[];
  repuestoId?: string;
  cantidad?: number;
}

export interface RepuestoDocument {
  repuestoId: string;
  sku: string;
  categoria: string;
  descripcion: string;
  compatibilidad?: string[];
  stock: number;
  stockMinimo: number;
  costo: number;
  precio: number;
  ubicacion?: string;
  proveedor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovimientoInventarioDocument {
  movId: string;
  repuestoId: string;
  tipo: InventoryMovementType;
  cantidad: number;
  actorUid: string;
  fecha: string;
  referenciaOrdenId?: string;
  nota?: string;
  createdAt: string;
}

export interface EquipoVentaDocument {
  itemId: string;
  tipo: DeviceCategory;
  marca: string;
  modelo: string;
  estado: EquipmentSaleState;
  precio: number;
  stock: number;
  fotos?: string[];
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipoTallerDocument {
  activoId: string;
  tipo: DeviceCategory;
  marca: string;
  modelo: string;
  identificador: string;
  estado: string;
  notas?: string;
  mantenimiento?: {
    proximo?: string;
    historial?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreIndex {
  collection: string;
  fields: string[];
  description: string;
}

export const suggestedIndexes: FirestoreIndex[] = [
  {
    collection: 'ordenes',
    fields: ['estado'],
    description: 'Permite listar órdenes por estado para tableros Kanban.'
  },
  {
    collection: 'ordenes',
    fields: ['asignadoA', 'estado'],
    description: 'Filtra órdenes activas por técnico y estado.'
  },
  {
    collection: 'ordenes',
    fields: ['clienteId', 'fechaIngreso'],
    description: 'Consulta el historial de un cliente ordenado por fecha.'
  },
  {
    collection: 'ordenes',
    fields: ['equipo.marca', 'equipo.modelo'],
    description: 'Reportes por modelo/equipo.'
  },
  {
    collection: 'repuestos',
    fields: ['sku'],
    description: 'Búsqueda exacta por SKU.'
  },
  {
    collection: 'repuestos',
    fields: ['descripcion'],
    description: 'Búsqueda por descripción.'
  },
  {
    collection: 'movimientosInventario',
    fields: ['repuestoId', 'fecha'],
    description: 'Historial de movimientos por repuesto.'
  }
];

export interface CollectionDefinition {
  name: string;
  description: string;
  schema: Record<string, string>;
  subcollections?: CollectionDefinition[];
}

export const firestoreCollections: CollectionDefinition[] = [
  {
    name: 'users',
    description: 'Usuarios internos del taller con roles y habilidades.',
    schema: {
      uid: 'string',
      nombre: 'string',
      email: 'string',
      rol: "'admin'|'tecnico'|'recepcion'",
      activo: 'boolean',
      skills: 'string[]',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  {
    name: 'clientes',
    description: 'Clientes finales que registran equipos en el servicio técnico.',
    schema: {
      clienteId: 'string',
      nombre: 'string',
      telefono: 'string',
      email: 'string?',
      rut: 'string?',
      direccion: 'string?',
      notas: 'string?',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  {
    name: 'equipos',
    description: 'Catálogo opcional de modelos soportados.',
    schema: {
      equipoId: 'string',
      categoria: "'computador'|'telefono'|'tablet'|'otro'",
      marca: 'string',
      modelo: 'string',
      variantes: 'string[]',
      notasTecnicas: 'string?',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  {
    name: 'ordenes',
    description: 'Órdenes de servicio con ciclo de vida controlado.',
    schema: {
      ordenId: 'string',
      clienteId: 'string',
      ingresadoPor: 'string',
      fechaIngreso: 'timestamp',
      equipo: 'OrdenEquipoInfo',
      fallaReportada: 'string',
      estado:
        "'Ingreso'|'Diagnóstico'|'Presupuesto'|'Aprobado'|'Reparando'|'QA'|'Listo'|'Entregado'|'No Reparado'",
      prioridad: "'baja'|'media'|'alta'",
      asignadoA: 'string?',
      fechas: 'OrdenFechas',
      presupuesto: 'OrdenPresupuesto?',
      garantia: 'OrdenGarantia?',
      fotos: 'string[]',
      tags: 'string[]',
      ordenOrigen: 'string?',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    subcollections: [
      {
        name: 'logs',
        description: 'Historial de eventos, notas y movimientos dentro de la orden.',
        schema: {
          logId: 'string',
          timestamp: 'timestamp',
          actorUid: 'string',
          tipo: "'estado'|'nota'|'adjunto'|'usoRepuesto'",
          mensaje: 'string?',
          adjuntos: 'string[]',
          repuestoId: 'string?',
          cantidad: 'number?'
        }
      }
    ]
  },
  {
    name: 'repuestos',
    description: 'Inventario de repuestos administrado por el taller.',
    schema: {
      repuestoId: 'string',
      sku: 'string',
      categoria: 'string',
      descripcion: 'string',
      compatibilidad: 'string[]',
      stock: 'number',
      stockMinimo: 'number',
      costo: 'number',
      precio: 'number',
      ubicacion: 'string?',
      proveedor: 'string?',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  {
    name: 'movimientosInventario',
    description: 'Movimientos de inventario con trazabilidad completa.',
    schema: {
      movId: 'string',
      repuestoId: 'string',
      tipo: "'ingreso'|'egreso'|'ajuste'|'uso-reparacion'",
      cantidad: 'number',
      actorUid: 'string',
      fecha: 'timestamp',
      referenciaOrdenId: 'string?',
      nota: 'string?',
      createdAt: 'timestamp'
    }
  },
  {
    name: 'equiposVenta',
    description: 'Equipos listos para vender desde el taller.',
    schema: {
      itemId: 'string',
      tipo: "'computador'|'telefono'|'tablet'|'otro'",
      marca: 'string',
      modelo: 'string',
      estado: "'nuevo'|'usado'|'refurb'",
      precio: 'number',
      stock: 'number',
      fotos: 'string[]',
      notas: 'string?',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  {
    name: 'equiposTaller',
    description: 'Activos internos del taller y su mantenimiento.',
    schema: {
      activoId: 'string',
      tipo: "'computador'|'telefono'|'tablet'|'otro'",
      marca: 'string',
      modelo: 'string',
      identificador: 'string',
      estado: 'string',
      notas: 'string?',
      mantenimiento: '{ proximo?: timestamp; historial?: string[] }',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  }
];
