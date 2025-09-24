import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type FirestoreError,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  mockIntakeData,
  type IntakeDashboardData,
  type IntakeOrder,
  type TechnicianLoad
} from '../data/mockOrders';
import type { OrderPriority, OrderStatus } from '../models/firestore';

const intakeStatuses: Array<'Ingreso' | 'Diagnóstico' | 'Presupuesto'> = [
  'Ingreso',
  'Diagnóstico',
  'Presupuesto'
];

const getHoursInQueue = (fechaIngreso: string | Date) => {
  const ingreso = fechaIngreso instanceof Date ? fechaIngreso : new Date(fechaIngreso);
  const diff = Date.now() - ingreso.getTime();
  return Math.max(diff / 1000 / 60 / 60, 0);
};

const mapOrderDoc = (doc: QuerySnapshot<DocumentData>['docs'][number]): IntakeOrder => {
  const data = doc.data();
  const equipo = data.equipo ?? {};

  const prioridad = (data.prioridad as OrderPriority) ?? 'media';
  const estado = (data.estado as OrderStatus) ?? 'Ingreso';

  const fechaIngreso = data.fechaIngreso?.toDate?.()
    ? data.fechaIngreso.toDate().toISOString()
    : typeof data.fechaIngreso === 'string'
    ? data.fechaIngreso
    : new Date().toISOString();

  return {
    ordenId: doc.id,
    cliente: data.clienteNombre ?? data.clienteId ?? 'Cliente sin nombre',
    equipo: [equipo.marca, equipo.modelo].filter(Boolean).join(' ') || 'Equipo sin datos',
    estado,
    prioridad,
    fechaIngreso,
    tiempoEnColaHoras: getHoursInQueue(fechaIngreso),
    tecnicoSugerido: data.asignadoANombre ?? data.asignadoA ?? undefined,
    canal: (data.canal as IntakeOrder['canal']) ?? 'Mostrador',
    tags: Array.isArray(data.tags) ? data.tags : [],
    fotos: Array.isArray(data.fotos) ? data.fotos.length : 0,
    accesorios: Array.isArray(equipo.accesoriosRecibidos) ? equipo.accesoriosRecibidos : []
  };
};

const mapTechnicianDoc = (doc: QuerySnapshot<DocumentData>['docs'][number]): TechnicianLoad => {
  const data = doc.data();
  return {
    uid: doc.id,
    nombre: data.nombre ?? 'Técnico sin nombre',
    especialidades: Array.isArray(data.skills) ? data.skills : [],
    ordenesAsignadas: 0,
    ordenesPendientesDiagnostico: 0
  };
};

const buildSummary = (orders: IntakeOrder[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summary = {
    totalHoy: 0,
    pendientesDiagnostico: 0,
    enPresupuesto: 0,
    prioridadAlta: 0,
    slaRiesgo: 0
  };

  for (const order of orders) {
    const ingreso = new Date(order.fechaIngreso);
    if (ingreso >= today) {
      summary.totalHoy += 1;
    }

    if (order.estado === 'Diagnóstico') {
      summary.pendientesDiagnostico += 1;
    }

    if (order.estado === 'Presupuesto') {
      summary.enPresupuesto += 1;
    }

    if (order.prioridad === 'alta') {
      summary.prioridadAlta += 1;
    }

    if (order.tiempoEnColaHoras >= 24 && intakeStatuses.includes(order.estado)) {
      summary.slaRiesgo += 1;
    }
  }

  return summary;
};

const computeTechnicianMetrics = (
  technicians: TechnicianLoad[],
  orders: IntakeOrder[]
): TechnicianLoad[] => {
  const counts = new Map<string, { asignadas: number; diagnostico: number }>();

  for (const order of orders) {
    if (!order.tecnicoSugerido) continue;
    const key = order.tecnicoSugerido;
    const current = counts.get(key) ?? { asignadas: 0, diagnostico: 0 };
    current.asignadas += 1;
    if (order.estado === 'Diagnóstico') {
      current.diagnostico += 1;
    }
    counts.set(key, current);
  }

  return technicians.map((technician) => {
    const metrics = counts.get(technician.nombre) ?? counts.get(technician.uid) ?? {
      asignadas: technician.ordenesAsignadas,
      diagnostico: technician.ordenesPendientesDiagnostico
    };

    return {
      ...technician,
      ordenesAsignadas: metrics.asignadas,
      ordenesPendientesDiagnostico: metrics.diagnostico
    };
  });
};

const extractTags = (orders: IntakeOrder[]): string[] => {
  const set = new Set<string>();
  orders.forEach((order) => order.tags.forEach((tag) => set.add(tag)));
  return Array.from(set);
};

export function useIntakeData() {
  const [orders, setOrders] = useState<IntakeOrder[]>(mockIntakeData.orders);
  const [technicians, setTechnicians] = useState<TechnicianLoad[]>(mockIntakeData.technicians);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [usingMock, setUsingMock] = useState<boolean>(!isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setUsingMock(true);
      return;
    }

    setUsingMock(false);
    setLoading(true);

    const ordersQuery = query(collection(db, 'ordenes'), orderBy('fechaIngreso', 'desc'), limit(100));
    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const mapped = snapshot.docs.map((doc) => mapOrderDoc(doc));
        setOrders(mapped.length > 0 ? mapped : mockIntakeData.orders);
        setUsingMock(mapped.length === 0);
        setLoading(false);
      },
      (err) => {
        console.error('Error al escuchar órdenes', err);
        setError(err);
        setUsingMock(true);
        setLoading(false);
      }
    );

    const techniciansQuery = query(collection(db, 'users'), where('rol', '==', 'tecnico'));
    const unsubscribeTechs = onSnapshot(
      techniciansQuery,
      (snapshot) => {
        const mapped = snapshot.docs.map((doc) => mapTechnicianDoc(doc));
        setTechnicians(mapped.length > 0 ? mapped : mockIntakeData.technicians);
      },
      (err) => {
        console.error('Error al escuchar técnicos', err);
        setError(err);
        setUsingMock(true);
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeTechs();
    };
  }, []);

  const data: IntakeDashboardData = useMemo(() => {
    const enrichedTechnicians = computeTechnicianMetrics(technicians, orders);
    return {
      summary: buildSummary(orders),
      orders,
      technicians: enrichedTechnicians,
      tagsDisponibles: extractTags(orders)
    };
  }, [orders, technicians]);

  return {
    data,
    loading,
    error,
    usingMock,
    isFirebaseConfigured
  } as const;
}
