import type { OrderPriority, OrderStatus } from '../models/firestore';

type IntakeQueueStatus = Extract<OrderStatus, 'Ingreso' | 'Diagnóstico' | 'Presupuesto'>;

type IntakeChannel = 'Mostrador' | 'Correo' | 'WhatsApp' | 'Derivado';

export interface IntakeOrder {
  ordenId: string;
  cliente: string;
  equipo: string;
  estado: IntakeQueueStatus;
  prioridad: OrderPriority;
  fechaIngreso: string;
  tiempoEnColaHoras: number;
  tecnicoSugerido?: string;
  canal: IntakeChannel;
  tags: string[];
  fotos: number;
  accesorios: string[];
}

export interface TechnicianLoad {
  uid: string;
  nombre: string;
  especialidades: string[];
  ordenesAsignadas: number;
  ordenesPendientesDiagnostico: number;
}

export interface IntakeSummary {
  totalHoy: number;
  pendientesDiagnostico: number;
  enPresupuesto: number;
  prioridadAlta: number;
  slaRiesgo: number;
}

export interface IntakeDashboardData {
  summary: IntakeSummary;
  orders: IntakeOrder[];
  technicians: TechnicianLoad[];
  tagsDisponibles: string[];
}

export const mockIntakeData: IntakeDashboardData = {
  summary: {
    totalHoy: 14,
    pendientesDiagnostico: 6,
    enPresupuesto: 3,
    prioridadAlta: 4,
    slaRiesgo: 2
  },
  tagsDisponibles: ['no enciende', 'mojado', 'pantalla rota', 'sin carga', 'lento'],
  technicians: [
    {
      uid: 'tec-01',
      nombre: 'Laura Díaz',
      especialidades: ['Apple', 'MacBook', 'Microsoldadura'],
      ordenesAsignadas: 5,
      ordenesPendientesDiagnostico: 2
    },
    {
      uid: 'tec-02',
      nombre: 'Carlos Pérez',
      especialidades: ['Android', 'Placas base'],
      ordenesAsignadas: 7,
      ordenesPendientesDiagnostico: 3
    },
    {
      uid: 'tec-03',
      nombre: 'María Torres',
      especialidades: ['Windows', 'Gaming PC'],
      ordenesAsignadas: 4,
      ordenesPendientesDiagnostico: 1
    }
  ],
  orders: [
    {
      ordenId: 'ST-10234',
      cliente: 'Javier Moreno',
      equipo: 'MacBook Air A1466',
      estado: 'Ingreso',
      prioridad: 'alta',
      fechaIngreso: '2024-03-04T09:20:00',
      tiempoEnColaHoras: 3,
      tecnicoSugerido: 'Laura Díaz',
      canal: 'Mostrador',
      tags: ['no enciende', 'mojado'],
      fotos: 4,
      accesorios: ['cargador original']
    },
    {
      ordenId: 'ST-10235',
      cliente: 'Lucía Fernández',
      equipo: 'Samsung Galaxy S21',
      estado: 'Diagnóstico',
      prioridad: 'media',
      fechaIngreso: '2024-03-04T08:45:00',
      tiempoEnColaHoras: 4.5,
      tecnicoSugerido: 'Carlos Pérez',
      canal: 'WhatsApp',
      tags: ['sin carga'],
      fotos: 3,
      accesorios: ['funda', 'cable usb']
    },
    {
      ordenId: 'ST-10236',
      cliente: 'Miguel Ángel Soto',
      equipo: 'Lenovo Legion 5',
      estado: 'Ingreso',
      prioridad: 'alta',
      fechaIngreso: '2024-03-04T10:10:00',
      tiempoEnColaHoras: 2,
      canal: 'Correo',
      tecnicoSugerido: 'María Torres',
      tags: ['lento'],
      fotos: 2,
      accesorios: ['cargador genérico']
    },
    {
      ordenId: 'ST-10237',
      cliente: 'Verónica Castillo',
      equipo: 'iPhone 13',
      estado: 'Diagnóstico',
      prioridad: 'alta',
      fechaIngreso: '2024-03-04T07:55:00',
      tiempoEnColaHoras: 5,
      canal: 'Mostrador',
      tecnicoSugerido: 'Laura Díaz',
      tags: ['pantalla rota'],
      fotos: 5,
      accesorios: ['caja', 'auriculares']
    },
    {
      ordenId: 'ST-10238',
      cliente: 'José Luis Rojas',
      equipo: 'ASUS TUF Gaming',
      estado: 'Presupuesto',
      prioridad: 'media',
      fechaIngreso: '2024-03-03T18:30:00',
      tiempoEnColaHoras: 16,
      canal: 'Derivado',
      tecnicoSugerido: 'María Torres',
      tags: ['no enciende'],
      fotos: 1,
      accesorios: ['cargador original']
    },
    {
      ordenId: 'ST-10239',
      cliente: 'Andrea Ramírez',
      equipo: 'iPad Pro 11"',
      estado: 'Ingreso',
      prioridad: 'baja',
      fechaIngreso: '2024-03-04T11:05:00',
      tiempoEnColaHoras: 1,
      canal: 'Mostrador',
      tags: ['pantalla rota'],
      fotos: 2,
      accesorios: ['apple pencil']
    }
  ]
};
