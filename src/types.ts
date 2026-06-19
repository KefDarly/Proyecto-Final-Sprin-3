/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Empresa {
  id_empresa: number;
  razon_social: string;
  ruc: string;
  direccion: string | null;
  telefono: string | null;
}

export interface Personal {
  id_personal: number;
  nombre_completo: string;
  usuario: string;
  correo: string;
  contrasena: string; // Plaintext or Bcrypt mock
  rol: string; // E.g. 'Administradores (Full Acceso)', 'Supervisor de Control', etc.
  estado: number; // 1 = Activo, 0 = Inactivo
}

export interface Modulo {
  id_modulo: number;
  nombre_modulo: string;
}

export interface PermisoModulo {
  id_personal: number;
  id_modulo: number;
}

export interface Conductor {
  id_conductor: number;
  nombre: string;
  apellido: string;
  licencia: string;
  telefono: string | null;
}

export interface Vehiculo {
  id_vehiculo: number;
  id_empresa: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidad_toneladas: number;
  estado_mantenimiento: 'Operativo' | 'En Taller' | 'Falla Mecánica';
  fecha_mantenimiento: string | null; // DATE (YYYY-MM-DD)
}

export interface Ruta {
  id_ruta: number;
  origen: string;
  destino: string;
  distancia_km: number;
}

export interface Monitoreo {
  id_monitoreo: number;
  id_vehiculo: number;
  id_conductor: number;
  id_ruta: number;
  fecha_salida: string; // DATETIME
  fecha_llegada: string | null; // DATETIME
  estado: 'En Ruta' | 'Completado' | 'Incidencia';
  tipo_carga: string | null;
  createdAt: string;
}

export interface ConsumoCombustible {
  id_consumo: number;
  id_monitoreo: number;
  cantidad_litros: number;
  costo_total: number;
  fecha_registro: string;
}

export interface Mantenimiento {
  id_mantenimiento: number;
  id_vehiculo: number;
  descripcion: string;
  fecha: string;
  costo: number;
}

export interface Incidencia {
  id_incidencia: number;
  id_monitoreo: number;
  tipo: string;
  descripcion: string;
  fecha_hora: string;
  reportado_por: number; // Current worker ID
  estado_alerta: 'Pendiente' | 'Resuelto';
}
