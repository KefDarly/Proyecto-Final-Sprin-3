/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Monitoreo,
  Vehiculo,
  Conductor,
  Ruta,
  Personal,
  Incidencia,
  ConsumoCombustible
} from '../types';

interface MonitoreoViewProps {
  monitoreos: Monitoreo[];
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  rutas: Ruta[];
  incidencias: Incidencia[];
  consumos: ConsumoCombustible[];
  currentUser: Personal | null;
  searchTerm: string;
  onAddMonitoreo: (m: Omit<Monitoreo, 'id_monitoreo' | 'createdAt'>) => void;
  onUpdateMonitoreoStatus: (id: number, status: 'En Ruta' | 'Completado' | 'Incidencia') => void;
  onAddIncidencia: (inc: Omit<Incidencia, 'id_incidencia' | 'fecha_hora'>) => void;
}

export default function MonitoreoView({
  monitoreos,
  vehiculos,
  conductores,
  rutas,
  incidencias,
  consumos,
  currentUser,
  searchTerm,
  onAddMonitoreo,
  onUpdateMonitoreoStatus,
  onAddIncidencia
}: MonitoreoViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showActionMenuId, setShowActionMenuId] = useState<number | null>(null);

  // Form states for New Monitoreo
  const [selectedVehiculoId, setSelectedVehiculoId] = useState('');
  const [selectedConductorId, setSelectedConductorId] = useState('');
  const [selectedRutaId, setSelectedRutaId] = useState('');
  const [tipoCarga, setTipoCarga] = useState('');
  const [fechaSalida, setFechaSalida] = useState(new Date().toISOString().substring(0, 16));

  // Form states for reporting an incident from a row action
  const [showReportIncidentModal, setShowReportIncidentModal] = useState(false);
  const [activeReportMonitoreoId, setActiveReportMonitoreoId] = useState<number | null>(null);
  const [incidentTipo, setIncidentTipo] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');

  // Status counters
  const enRutaCount = monitoreos.filter(m => m.estado === 'En Ruta').length;
  const incidenciasCount = monitoreos.filter(m => m.estado === 'Incidencia').length;

  // Filter monitoreos based on search term
  const filtered = monitoreos.filter(m => {
    const veh = vehiculos.find(v => v.id_vehiculo === m.id_vehiculo);
    const cond = conductores.find(c => c.id_conductor === m.id_conductor);
    const rut = rutas.find(r => r.id_ruta === m.id_ruta);

    const term = searchTerm.toLowerCase();
    return (
      m.id_monitoreo.toString().includes(term) ||
      (m.tipo_carga || '').toLowerCase().includes(term) ||
      m.estado.toLowerCase().includes(term) ||
      (veh?.placa || '').toLowerCase().includes(term) ||
      (veh?.marca || '').toLowerCase().includes(term) ||
      (veh?.modelo || '').toLowerCase().includes(term) ||
      (`${cond?.nombre} ${cond?.apellido}`).toLowerCase().includes(term) ||
      (rut?.origen || '').toLowerCase().includes(term) ||
      (rut?.destino || '').toLowerCase().includes(term)
    );
  });

  // Calculate dynamic fuel statistics
  const totalFuelLitres = consumos.reduce((acc, c) => acc + c.cantidad_litros, 0);
  const totalFuelGallons = Math.round(totalFuelLitres * 0.264172); // litres to gallons
  const totalFuelCost = consumos.reduce((acc, c) => acc + c.costo_total, 0);

  // Find latest active incidence report for bottom card Display
  const latestAlert = incidencias.find(i => i.estado_alerta === 'Pendiente');

  // New Monitoreo submission
  const handleSubmitMonitoreo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehiculoId || !selectedConductorId || !selectedRutaId) {
      alert('Por favor complete todos los datos del formulario de despacho.');
      return;
    }
    onAddMonitoreo({
      id_vehiculo: parseInt(selectedVehiculoId),
      id_conductor: parseInt(selectedConductorId),
      id_ruta: parseInt(selectedRutaId),
      fecha_salida: fechaSalida,
      fecha_llegada: null,
      estado: 'En Ruta',
      tipo_carga: tipoCarga || 'Combustible Regular'
    });

    // Reset fields & close
    setSelectedVehiculoId('');
    setSelectedConductorId('');
    setSelectedRutaId('');
    setTipoCarga('');
    setShowAddModal(false);
  };

  // Submit quick incident route anomaly report
  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReportMonitoreoId || !incidentTipo || !incidentDesc) {
      alert('Por favor describa el tipo y hechos del suceso.');
      return;
    }
    // Record incident
    onAddIncidencia({
      id_monitoreo: activeReportMonitoreoId,
      tipo: incidentTipo,
      descripcion: incidentDesc,
      reportado_por: currentUser?.id_personal || 1,
      estado_alerta: 'Pendiente'
    });

    // Update trip state mapping
    onUpdateMonitoreoStatus(activeReportMonitoreoId, 'Incidencia');

    // Reset & close
    setIncidentTipo('');
    setIncidentDesc('');
    setShowReportIncidentModal(false);
    setActiveReportMonitoreoId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header banner */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-sans text-3xl font-black text-on-surface tracking-tight mb-2">Monitoreo en Vivo</h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-on-surface-variant bg-surface-container px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              {enRutaCount} Unidades en Ruta
            </span>
            <span className="flex items-center gap-2 text-on-surface-variant bg-surface-container px-3 py-1 rounded-full text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${incidenciasCount > 0 ? 'bg-[#EF4444] animate-ping' : 'bg-outline-variant'}`}></span>
              {incidenciasCount} Incidencias Reportadas
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-secondary text-on-secondary font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span className="font-sans text-sm font-bold">Nuevo Monitoreo</span>
        </button>
      </div>

      {/* Main Monitoring grid */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-surface-container-high border-b border-outline-variant flex justify-between items-center select-none">
          <h3 className="font-sans text-base font-bold text-on-surface">Unidades Bajo Seguimiento</h3>
          <div className="flex gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant bg-surface px-2.5 py-1 rounded border border-outline-variant">
              OPERADOR: {currentUser?.nombre_completo.split(' ')[0] || 'ADMIN'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-surface-container uppercase text-on-surface-variant font-sans text-xs border-b border-outline-variant">
                <th className="px-6 py-3.5 font-extrabold text-[#8f9097]">ID LOG</th>
                <th className="px-6 py-3.5 font-extrabold text-[#8f9097]">Vehículo</th>
                <th className="px-6 py-3.5 font-extrabold text-[#8f9097]">Conductor</th>
                <th className="px-6 py-3.5 font-extrabold text-[#8f9097]">Ruta (Origen - Destino)</th>
                <th className="px-6 py-3.5 font-extrabold text-[#8f9097]">Carga / Despacho</th>
                <th className="px-6 py-3.5 font-extrabold text-[#8f9097]">Estado</th>
                <th className="px-6 py-3.5 font-extrabold text-right text-[#8f9097]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant text-sm font-sans">
                    Ningún monitoreo activo coincide con su búsqueda ...
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const veh = vehiculos.find(v => v.id_vehiculo === m.id_vehiculo);
                  const cond = conductores.find(c => c.id_conductor === m.id_conductor);
                  const rut = rutas.find(r => r.id_ruta === m.id_ruta);

                  return (
                    <tr key={m.id_monitoreo} className="group hover:bg-surface-container-highest/45 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-secondary-fixed-dim font-bold">
                        TRK-{1000 + m.id_monitoreo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface font-sans text-sm">{veh?.placa || 'Desconocido'}</span>
                          <span className="text-xs text-on-surface-variant font-sans">{veh?.marca} {veh?.modelo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-[10px] border border-primary/20">
                            {cond ? cond.nombre[0] + cond.apellido[0] : 'U'}
                          </div>
                          <span className="text-on-surface font-sans text-sm">
                            {cond ? `${cond.nombre} ${cond.apellido}` : 'Sin chofer'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-on-surface font-sans">
                          <span>{rut?.origen || 'No especificado'}</span>
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">trending_flat</span>
                          <span>{rut?.destino || 'No especificado'}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-mono block mt-1">
                          {rut ? `${rut.distancia_km} KM totales` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-on-surface-variant font-medium">
                        {m.tipo_carga || 'Combustibles generales'}
                      </td>
                      <td className="px-6 py-4">
                        {m.estado === 'En Ruta' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981]">
                            EN RUTA
                          </span>
                        )}
                        {m.estado === 'Incidencia' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#EF4444]">
                            INCIDENCIA
                          </span>
                        )}
                        {m.estado === 'Completado' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#3B82F6]/10 border border-[#3B82F6]/40 text-[#3B82F6]">
                            COMPLETADO
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              onUpdateMonitoreoStatus(m.id_monitoreo, m.estado === 'En Ruta' ? 'Completado' : 'En Ruta');
                            }}
                            title={m.estado === 'En Ruta' ? "Marcar como Entregado / Completado" : "Reestablecer En Ruta"}
                            className="bg-surface-container hover:bg-surface-container-highest p-1.5 rounded text-on-surface-variant hover:text-secondary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">
                              {m.estado === 'En Ruta' ? 'task_alt' : 'sync'}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveReportMonitoreoId(m.id_monitoreo);
                              setShowReportIncidentModal(true);
                            }}
                            title="Reportar Incidente Vial en Ruta"
                            className="bg-surface-container hover:bg-error/15 p-1.5 rounded text-on-surface-variant hover:text-error transition-colors ml-1"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">warning</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination mock visual */}
        <div className="p-4 bg-surface-container-high border-t border-outline-variant flex justify-between items-center text-xs text-on-surface-variant uppercase font-bold tracking-wider">
          <span>Mostrando {filtered.length} de {monitoreos.length} monitoreos activos</span>
          <div className="flex items-center gap-3">
            <button className="p-1 hover:text-secondary disabled:opacity-35" disabled>
              <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
            </button>
            <span className="text-on-surface font-sans text-xs">PÁGINA 1 / 1</span>
            <button className="p-1 hover:text-secondary disabled:opacity-35" disabled>
              <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Data Cards (Bento style) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low border border-outline-variant rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-2 right-2 p-3 text-on-surface-variant opacity-10 group-hover:opacity-20 transition-all">
            <span className="material-symbols-outlined text-6xl">local_gas_station</span>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1.5">Consumo Global Reciente</p>
          <h4 className="text-3xl font-black text-secondary mb-3">{totalFuelGallons.toLocaleString()} Galones</h4>
          <p className="text-xs text-on-surface-variant font-medium">
            Representado en costo total de: <span className="text-[#10B981] font-bold">S/ {totalFuelCost.toLocaleString()} COP/PEN</span>
          </p>
        </div>

        {/* Critical Alerts Indicator / Operations Protocol box */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant rounded-xl p-5 flex items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1.5">ALERTA CRÍTICA RECIENTE</p>
            {latestAlert ? (
              <>
                <h4 className="font-sans text-base font-bold text-error mb-1">{latestAlert.tipo}</h4>
                <p className="text-xs text-on-surface-variant font-sans font-medium">
                  {latestAlert.descripcion}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-sans text-base font-bold text-secondary mb-1">Sin Alteraciones en Carretera</h4>
                <p className="text-xs text-on-surface-variant font-sans font-medium">
                  Toda la flota de Petro Mapi reporta telemetría constante con el servidor de control.
                </p>
              </>
            )}
          </div>
          
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="bg-error-container text-on-error-container hover:brightness-110 active:scale-95 duration-100 font-extrabold px-4 py-2.5 text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 select-none"
          >
            <span className="material-symbols-outlined text-sm">emergency</span>
            <span>Protocolo de Emergencia</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: NUEVO MONITOREO / REGISTRO DE DESPACHO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
          <div className="bg-surface border border-outline-variant w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="font-sans text-xl font-bold text-on-surface">Despachar Nueva Unidad</h3>
                <p className="text-xs text-on-surface-variant mt-1">Registre la carga pesada, conductor asignado y el destino logístico.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitMonitoreo} className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Vehiculo Option select */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Unidad de Flota (Placa)</label>
                  <select
                    value={selectedVehiculoId}
                    onChange={(e) => setSelectedVehiculoId(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:ring-1 focus:ring-secondary"
                  >
                    <option value="">Seleccione vehículo operativo...</option>
                    {vehiculos.filter(v => v.estado_mantenimiento === 'Operativo').map(v => (
                      <option key={v.id_vehiculo} value={v.id_vehiculo}>
                        {v.placa} - {v.marca} {v.modelo} (Cap: {v.capacidad_toneladas} TN)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Tipo de Carga</label>
                  <input
                    type="text"
                    required
                    value={tipoCarga}
                    onChange={(e) => setTipoCarga(e.target.value)}
                    placeholder="Ej: Combustible Premium 97 Oct"
                    className="bg-surface-container border border-outline-variant rounded-lg p-2 text-on-surface text-xs focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Conductor select */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Conductor Asignado</label>
                <select
                  value={selectedConductorId}
                  onChange={(e) => setSelectedConductorId(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:ring-1 focus:ring-secondary"
                >
                  <option value="">Seleccionar tripulante logístico...</option>
                  {conductores.map(c => (
                    <option key={c.id_conductor} value={c.id_conductor}>
                      {c.nombre} {c.apellido} - Lic: {c.licencia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ruta select */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Ruta Autorizada</label>
                  <select
                    value={selectedRutaId}
                    onChange={(e) => setSelectedRutaId(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:ring-1 focus:ring-secondary"
                  >
                    <option value="">Seleccione origen-destino...</option>
                    {rutas.map(r => (
                      <option key={r.id_ruta} value={r.id_ruta}>
                        {r.origen} → {r.destino} ({r.distancia_km} KM)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Fecha y Hora de Despacho</label>
                  <input
                    type="datetime-local"
                    value={fechaSalida}
                    onChange={(e) => setFechaSalida(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded-lg p-2 text-on-surface text-xs focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-primary-container/20 border border-primary/20 rounded-lg flex gap-2">
                <span className="material-symbols-outlined text-primary text-sm">info</span>
                <p className="text-[11px] text-[#b9c7e4]">
                  Al registrar este despacho, el estado del vehículo cambiará automáticamente para reflejar que se encuentra &quot;En Ruta&quot;.
                </p>
              </div>

              <div className="p-4 border-t border-outline-variant flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-bold hover:brightness-105 transition-all"
                >
                  Confirmar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT AN INCIDENT FORM */}
      {showReportIncidentModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
          <div className="bg-[#1b1b1d] border border-outline-variant w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined">warning</span>
                <h3 className="font-sans text-base font-bold text-on-surface">Reportar Anomalía de Ruta</h3>
              </div>
              <button
                onClick={() => {
                  setShowReportIncidentModal(false);
                  setActiveReportMonitoreoId(null);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="p-6 space-y-4">
              <p className="text-xs text-on-surface-variant">
                Se registrará una incidencia crítica vinculada al viaje seleccionado. Notificará de inmediato a la central.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Asunto / Tipo de Incidente</label>
                <select
                  value={incidentTipo}
                  onChange={(e) => setIncidentTipo(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:border-error focus:ring-error"
                >
                  <option value="">Seleccione gravedad...</option>
                  <option value="Pérdida de señal GPS">Pérdida de señal GPS</option>
                  <option value="Retraso por Clima / Bloqueo">Retraso vial por clima / Bloqueo</option>
                  <option value="Falla Mecánica Grave">Falla Mecánica de Tracción</option>
                  <option value="Incidente con Carga">Detención o daño de cisternas</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Descripción de Hechos</label>
                <textarea
                  rows={4}
                  required
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Señale punto kilométrico, estado físico del tripulante y medidas preliminares..."
                  className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:border-error focus:ring-error"
                />
              </div>

              <div className="p-4 border-t border-outline-variant flex justify-end gap-3 pt-4 bg-surface-container-high -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportIncidentModal(false);
                    setActiveReportMonitoreoId(null);
                  }}
                  className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs text-white bg-error hover:brightness-110 rounded-lg uppercase font-bold"
                >
                  Registrar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PROTOCOLO DE EMERGENCIA - INTERACTIVE TIMELINE SCREEN */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 select-none animate-in zoom-in-95 duration-200">
          <div className="bg-[#0e0e10] border-2 border-error w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[85vh]">
            <div className="p-5 bg-error-container/20 border-b border-error/30 flex justify-between items-center">
              <div className="flex items-center gap-3 animate-pulse">
                <span className="material-symbols-outlined text-error text-2xl">emergency_home</span>
                <div>
                  <h3 className="font-sans text-lg font-black text-error uppercase tracking-wider">Centro de Control de Crisis - Petro Mapi</h3>
                  <p className="text-[10px] text-white/50 tracking-widest font-mono">ENCRYPTED TELEMETRY PIPELINE ACTIVE</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="bg-error/20 hover:bg-error text-white p-2 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm font-black">close</span>
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline layout Column */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs uppercase tracking-widest text-[#ffdad6] font-bold">Respuesta a Evento Reciente</p>
                
                <div className="relative border-l border-error/50 pl-4 py-1 ml-2 space-y-5">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-error border border-black animate-ping"></span>
                    <span className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-error border border-black"></span>
                    <p className="text-xs font-black text-error">HACE 2 MINUTOS</p>
                    <p className="text-sm font-bold text-on-surface">Validación de Ubicación por Antena Celular alternativa</p>
                    <p className="text-xs text-on-surface-variant">Se recibe ping indirecto de torre de transmisión del Km 452. Posicionamiento aproximado confirmado.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-secondary border border-black"></span>
                    <p className="text-xs font-black text-secondary">HACE 8 MINUTOS</p>
                    <p className="text-sm font-bold text-on-surface">Llamada de Radiofrecuencia de Emergencia</p>
                    <p className="text-xs text-on-surface-variant">Intento fallido de comunicación VHF. Frecuencias saturadas en la zona montañosa.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full bg-outline border border-black"></span>
                    <p className="text-xs font-black text-on-surface-variant">HACE 12 MINUTOS</p>
                    <p className="text-sm font-bold text-on-surface">Alerta automatizada por pérdida de señal satelital</p>
                    <p className="text-xs text-on-surface-variant">Pérdida de señal reportada oficialmente. Se detecta Unidad B4X-112 sin transmisión.</p>
                  </div>
                </div>
              </div>

              {/* Action form Side layout */}
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-error uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    Despacho de Auxilio
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Gestione contacto inmediato con cuadrilla policial o inspectores de seguridad vial de Petro Mapi más cercanos.
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase">Enviar Alerta A:</label>
                      <select className="bg-surface-container-high border border-outline-variant rounded p-2 text-xs text-on-surface w-full">
                        <option>DINOES / Policía Nacional del Perú</option>
                        <option>Cuadrilla de Rescate Petro Mapi Ica</option>
                        <option>Defensa Civil / Ambulancias</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase">Instrucciones de Crisis</label>
                      <textarea rows={3} className="bg-surface-container-high border border-outline-variant rounded p-2 text-xs text-on-surface w-full" placeholder="Mensaje rápido para la tripulación..." />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert('PROTOCOLO DISPARADO: Se envió la alerta satelital a policía nacional y inspectores cercanos.');
                    setShowEmergencyModal(false);
                  }}
                  className="w-full bg-error hover:brightness-105 transition-all text-white font-extrabold py-3.5 rounded-lg text-xs uppercase tracking-wider"
                >
                  DISPARAR PROTOCOLO ENLACE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
