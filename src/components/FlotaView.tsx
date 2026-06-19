/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vehiculo, Mantenimiento, Incidencia, Monitoreo } from '../types';

interface FlotaViewProps {
  vehiculos: Vehiculo[];
  mantenimientos: Mantenimiento[];
  incidencias: Incidencia[];
  monitoreos: Monitoreo[];
  onAddVehiculo: (v: Omit<Vehiculo, 'id_vehiculo'>) => void;
  onAddMantenimiento: (m: Omit<Mantenimiento, 'id_mantenimiento'>) => void;
  onAddIncidencia: (inc: Omit<Incidencia, 'id_incidencia' | 'fecha_hora'>) => void;
  onUpdateMonitoreoStatus: (id: number, status: 'En Ruta' | 'Completado' | 'Incidencia') => void;
  searchTerm: string;
}

export default function FlotaView({
  vehiculos,
  mantenimientos,
  incidencias,
  monitoreos,
  onAddVehiculo,
  onAddMantenimiento,
  onAddIncidencia,
  onUpdateMonitoreoStatus,
  searchTerm
}: FlotaViewProps) {
  // Navigation layout mode: 'list' or 'register'
  const [viewMode, setViewMode] = useState<'list' | 'register'>('list');
  const [formTab, setFormTab] = useState<'vehiculo' | 'incidencia'>('vehiculo');

  // Filter category: 'todos' | 'cisterna' | 'remolque'
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'cisterna' | 'remolque'>('todos');

  // Modal for scheduling maintenance
  const [activeMaintVehiculo, setActiveMaintVehiculo] = useState<Vehiculo | null>(null);
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCosto, setMaintCosto] = useState('1200');
  const [maintFecha, setMaintFecha] = useState(new Date().toISOString().substring(0, 10));

  // Form New Vehicle
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('Volvo');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('2026');
  const [capacidad, setCapacidad] = useState('32');

  // Form New Incident
  const [mId, setMId] = useState('');
  const [incTipo, setIncTipo] = useState('Falla Mecánica');
  const [incDesc, setIncDesc] = useState('');

  // Calculations for KPI
  const totalFleetCount = vehiculos.length;
  const enRutaCount = monitoreos.filter(m => m.estado === 'En Ruta').length;
  const inWorkshopCount = vehiculos.filter(v => v.estado_mantenimiento === 'En Taller').length;
  const availabilityPercent = Math.round(((totalFleetCount - inWorkshopCount) / totalFleetCount) * 100) || 100;

  // Filter vehicles
  const filteredVehicles = vehiculos.filter(v => {
    // Search keyword
    const matchSearch =
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.estado_mantenimiento.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter mock (All high ton can be considered cisterna for simplicity)
    const matchesCategory =
      selectedCategory === 'todos' ||
      (selectedCategory === 'cisterna' && v.capacidad_toneladas < 40) ||
      (selectedCategory === 'remolque' && v.capacidad_toneladas >= 40);

    return matchSearch && matchesCategory;
  });

  // Handle vehicle submission
  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa) {
      alert('Por favor complete la placa de rodaje.');
      return;
    }
    // Validation plate format
    const cleanPlaca = placa.trim().toUpperCase();
    
    onAddVehiculo({
      id_empresa: 1,
      placa: cleanPlaca,
      marca,
      modelo: modelo || 'Cabina Heavy Duty',
      anio: parseInt(anio) || 2026,
      capacidad_toneladas: parseFloat(capacidad) || 32.0,
      estado_mantenimiento: 'Operativo',
      fecha_mantenimiento: new Date().toISOString().substring(0, 10)
    });

    alert('Registro Exitoso: Se ha dado de alta la unidad en el inventario logístico.');
    setPlaca('');
    setModelo('');
    setViewMode('list');
  };

  // Handle inline incident submission
  const handleRegisterIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mId) {
      alert('Por favor ingrese el ID de monitoreo del viaje.');
      return;
    }
    const cleanMId = parseInt(mId);
    const tripExists = monitoreos.some(m => m.id_monitoreo === cleanMId);
    
    if (!tripExists) {
      alert(`No se encontró ningún viaje con el código TRK-${cleanMId}. Por favor verifique el identificador.`);
      return;
    }

    onAddIncidencia({
      id_monitoreo: cleanMId,
      tipo: incTipo,
      descripcion: incDesc || 'Falla imprevista reportada durante el trayecto.',
      reportado_por: 1,
      estado_alerta: 'Pendiente'
    });

    // Update state to Incident
    onUpdateMonitoreoStatus(cleanMId, 'Incidencia');

    alert(`Registro Exitoso: Alerta crítica notificada y vinculada al viaje TRK-${cleanMId}. Central informada.`);
    setMId('');
    setIncDesc('');
    setViewMode('list');
  };

  // Submit maintenance scheduler
  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMaintVehiculo) return;

    onAddMantenimiento({
      id_vehiculo: activeMaintVehiculo.id_vehiculo,
      descripcion: maintDesc || 'Mantenimiento preventivo programado.',
      fecha: maintFecha,
      costo: parseFloat(maintCosto) || 1200.0
    });

    alert(`Mantenimiento agendado para la placa ${activeMaintVehiculo.placa} el día ${maintFecha}.`);
    
    // Update vehicle's maintenance state or date (mock)
    activeMaintVehiculo.fecha_mantenimiento = maintFecha;
    activeMaintVehiculo.estado_mantenimiento = 'Operativo'; // cleared

    setActiveMaintVehiculo(null);
    setMaintDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Action header bar */}
      <div className="flex justify-between items-end select-none">
        <div>
          <h2 className="font-sans text-3xl font-black text-on-surface tracking-tight mb-1">
            {viewMode === 'list' ? 'Inventario de Vehículos' : 'Registro de Operaciones'}
          </h2>
          <p className="text-xs text-on-surface-variant font-medium">
            {viewMode === 'list'
              ? 'Control de flota pesada y programa de mantenimientos preventivos.'
              : 'Ingrese los datos para dar de alta nuevas unidades pesadas o reportar eventualidades en ruta.'}
          </p>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'register' : 'list')}
          className="bg-secondary text-on-secondary font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-lg">
            {viewMode === 'list' ? 'add_box' : 'list'}
          </span>
          <span className="font-sans text-sm font-bold">
            {viewMode === 'list' ? 'Registrar Operaciones' : 'Ver Inventario'}
          </span>
        </button>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Quick KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
            <div className="bg-surface-container border border-outline-variant p-5 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1">Flota Total</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-sans font-black text-secondary">{totalFleetCount}</span>
                <span className="text-xs text-on-surface-variant">Unidades</span>
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant p-5 rounded-lg">
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1">En Ruta Activos</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-sans font-black text-primary">{enRutaCount}</span>
                <span className="text-xs text-on-surface-variant">En carretera</span>
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant p-5 rounded-lg text-error">
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1">En Taller</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-sans font-black text-error">{inWorkshopCount}</span>
                <span className="text-xs text-on-surface-variant">Mantenimiento</span>
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant p-5 rounded-lg text-[#10B981]">
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1">Disponibilidad</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-sans font-black text-[#10B981]">{availabilityPercent}%</span>
                <span className="text-xs text-on-surface-variant">Operativos</span>
              </div>
            </div>
          </div>

          {/* MAIN DATA GRID PANEL */}
          <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high selector-none">
              <div className="flex items-center gap-4">
                <span className="font-sans text-sm font-bold text-on-surface">Filtros de Flota</span>
                <div className="flex bg-surface-container-highest p-0.5 rounded-lg gap-1 border border-outline-variant">
                  <button
                    onClick={() => setSelectedCategory('todos')}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                      selectedCategory === 'todos' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedCategory('cisterna')}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                      selectedCategory === 'cisterna' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Cisterna
                  </button>
                  <button
                    onClick={() => setSelectedCategory('remolque')}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                      selectedCategory === 'remolque' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Remolque Max
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse select-none">
                <thead className="bg-surface-container-highest">
                  <tr className="text-xs font-bold text-on-surface-variant">
                    <th className="px-6 py-3.5 tracking-wider uppercase">PLACA</th>
                    <th className="px-6 py-3.5 tracking-wider uppercase">MARCA</th>
                    <th className="px-6 py-3.5 tracking-wider uppercase">MODELO</th>
                    <th className="px-6 py-3.5 tracking-wider uppercase text-center">AÑO</th>
                    <th className="px-6 py-3.5 tracking-wider uppercase text-right">CAPACIDAD (TN)</th>
                    <th className="px-6 py-3.5 tracking-wider uppercase">MANTENIMIENTO</th>
                    <th className="px-6 py-3.5 tracking-wider text-right uppercase">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant text-sm font-sans">
                        No se encontraron unidades registradas para este filtro o búsqueda...
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((v) => {
                      // Calculate mock visual warning status for maintenance due
                      let alertColor = 'text-[#10B981]';
                      let alertText = 'ÓPTIMO';
                      if (v.estado_mantenimiento === 'En Taller') {
                        alertColor = 'text-primary';
                        alertText = 'EN TALLER';
                      } else if (v.estado_mantenimiento === 'Falla Mecánica') {
                        alertColor = 'text-error';
                        alertText = 'URGENTE';
                      } else if (parseInt(v.placa.charAt(v.placa.length - 1)) % 3 === 0) {
                        alertColor = 'text-[#ffb95f]';
                        alertText = 'PRÓXIMO 15D';
                      }

                      return (
                        <tr key={v.id_vehiculo} className="hover:bg-surface-container-highest/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-secondary font-bold text-sm">
                            {v.placa}
                          </td>
                          <td className="px-6 py-4 text-on-surface font-sans text-sm">
                            {v.marca}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant font-sans text-xs font-medium">
                            {v.modelo}
                          </td>
                          <td className="px-6 py-4 text-center text-on-surface-variant font-sans text-xs">
                            {v.anio}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-on-surface tracking-wider text-sm font-bold">
                            {v.capacidad_toneladas.toFixed(1)} TN
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-on-surface font-bold">{v.fecha_mantenimiento || 'Sin registro'}</span>
                              <span className={`text-[9px] font-extrabold uppercase mt-0.5 tracking-wider ${alertColor}`}>
                                {alertText}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setMaintFecha(new Date().toISOString().substring(0, 10));
                                setMaintDesc('');
                                setActiveMaintVehiculo(v);
                              }}
                              className="text-secondary hover:text-secondary-fixed border border-secondary/20 hover:border-secondary font-sans font-bold text-xs px-3 py-1.5 rounded transition-all active:scale-95 inline-flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm font-black">event_repeat</span>
                              Agendar Mantenimiento
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container flex justify-between items-center text-on-surface-variant font-sans text-xs">
              <span>Mostrando {filteredVehicles.length} de {vehiculos.length} unidades registradas</span>
              <div className="flex gap-1.5 select-none">
                <button className="px-2.5 py-1.5 bg-secondary text-on-secondary font-bold rounded text-xs">1</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* REGISTER OPERATION TABS BENTO CONTAINER (2nd mockup) */
        <div className="max-w-[1024px] mx-auto space-y-6">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-2xl">
            {/* Tabs selector */}
            <div className="flex border-b border-outline-variant px-6 select-none bg-surface-container-high">
              <button
                onClick={() => setFormTab('vehiculo')}
                className={`px-6 py-4 font-sans text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  formTab === 'vehiculo' ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                <span>Nuevo Vehículo</span>
              </button>
              <button
                onClick={() => setFormTab('incidencia')}
                className={`px-6 py-4 font-sans text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                  formTab === 'incidencia' ? 'border-error text-error' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Reportar Incidencia</span>
              </button>
            </div>

            {/* Forms body */}
            <div className="p-6">
              {formTab === 'vehiculo' ? (
                <form onSubmit={handleRegisterVehicle} className="space-y-6 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Placa de Rodaje</label>
                      <input
                        type="text"
                        required
                        value={placa}
                        onChange={(e) => setPlaca(e.target.value)}
                        placeholder="ABC-123"
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface font-mono uppercase tracking-widest text-sm focus:border-secondary"
                      />
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-none">Formato estándar: LLL-NNN (Guion automático en visualización)</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Marca del Vehículo</label>
                      <select
                        value={marca}
                        onChange={(e) => setMarca(e.target.value)}
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:border-secondary"
                      >
                        <option value="Volvo">Volvo</option>
                        <option value="Scania">Scania</option>
                        <option value="Mercedes-Benz">Mercedes-Benz</option>
                        <option value="Kenworth">Kenworth</option>
                        <option value="International">International</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Modelo de Tracto</label>
                      <input
                        type="text"
                        required
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        placeholder="Ej: FH16 2026 Heavy Duty"
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:border-secondary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Año</label>
                        <input
                          type="number"
                          required
                          value={anio}
                          onChange={(e) => setAnio(e.target.value)}
                          placeholder="2026"
                          className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Capacidad (TN)</label>
                        <input
                          type="number"
                          required
                          value={capacidad}
                          onChange={(e) => setCapacidad(e.target.value)}
                          placeholder="32"
                          className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary-container/20 border border-primary/20 rounded-lg flex gap-2.5">
                    <span className="material-symbols-outlined text-primary text-sm">info</span>
                    <p className="text-xs text-[#b9c7e4]">
                      Los vehículos nuevos se registrarán inicialmente en estado operativo y requieren una validación de ruta por parte del supervisor antes de su primer despacho.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 select-none bg-surface-container-high -mx-6 -mb-6 p-4">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="px-5 py-2 text-xs text-on-surface-variant hover:text-on-surface font-sans font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-secondary text-on-secondary font-bold px-6 py-2 rounded-lg text-xs hover:brightness-105 active:scale-97 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      <span>Guardar Registro</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* INCIDENCIA SUBMISSION (Tab block) */
                <form onSubmit={handleRegisterIncident} className="space-y-6 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">ID Monitoreo Activo (Viaje)</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          value={mId}
                          onChange={(e) => setMId(e.target.value)}
                          placeholder="Ingrese número de viaje, ej: 1"
                          className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs font-mono focus:border-error"
                        />
                        {monitoreos.some(m => m.id_monitoreo === parseInt(mId)) && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-green-500/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30 uppercase select-none font-bold">
                            Vínculo OK
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Tipo de Incidencia</label>
                      <select
                        value={incTipo}
                        onChange={(e) => setIncTipo(e.target.value)}
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:border-error"
                      >
                        <option value="Falla Mecánica">Falla Mecánica</option>
                        <option value="Accidente de Tránsito">Accidente vial</option>
                        <option value="Retraso por Bloqueo">Retraso vial / Huelga / Bloqueo</option>
                        <option value="Pérdida de señal GPS">Pérdida de señal GPS</option>
                        <option value="Incumplimiento de Ruta">Desvío de ruta autorizada</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Descripción Detallada de Sucesos</label>
                      <textarea
                        rows={4}
                        required
                        value={incDesc}
                        onChange={(e) => setIncDesc(e.target.value)}
                        placeholder="Describa los hechos detalladamente, indicando tramo de la autopista y si el tripulante se encuentra a resguardo..."
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-on-surface text-xs focus:border-error resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-error-container/20 border border-error/20 rounded-lg flex gap-2.5">
                    <span className="material-symbols-outlined text-error text-sm">priority_high</span>
                    <p className="text-xs text-error">
                      Este reporte alarmará instantáneamente al supervisor en turno y activará el registro de control crítico en la página de monitoreo.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-outline-variant flex justify-end gap-3 select-none bg-surface-container-high -mx-6 -mb-6 p-4">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="px-5 py-2 text-xs text-on-surface-variant hover:text-on-surface font-sans font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-error text-white font-bold px-6 py-2 rounded-lg text-xs hover:brightness-110 active:scale-97 flex items-center gap-1.5 shadow-lg shadow-error/15"
                    >
                      <span className="material-symbols-outlined text-sm">error</span>
                      <span>Notificar Incidencia</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGENDA PREVENTATIVE MAINTENANCE OVERLAY */}
      {activeMaintVehiculo && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
          <div className="bg-surface border border-outline-variant w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-sans text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">build</span>
                Agendar Orden de Trabajo ({activeMaintVehiculo.placa})
              </h3>
              <button onClick={() => setActiveMaintVehiculo(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitMaintenance} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Unidad asignada</label>
                <p className="font-bold text-sm text-on-surface">{activeMaintVehiculo.placa} ({activeMaintVehiculo.marca} {activeMaintVehiculo.modelo})</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Fecha Programada</label>
                <input
                  type="date"
                  required
                  value={maintFecha}
                  onChange={(e) => setMaintFecha(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded p-2 text-xs text-on-surface w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Costo de Taller (Est. S/)</label>
                  <input
                    type="number"
                    required
                    value={maintCosto}
                    onChange={(e) => setMaintCosto(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded p-2 text-xs text-on-surface w-full font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Estado Programación</label>
                  <span className="bg-secondary/15 text-secondary border border-secondary/20 p-2 text-[10px] uppercase font-bold tracking-wider rounded text-center block leading-none">
                    PREVENTIVO AGENDADO
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">Instrucciones de Reparación</label>
                <textarea
                  rows={3}
                  required
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  placeholder="Ej: Cambio de lubricante sintético, rotación del tren delantero..."
                  className="bg-surface-container border border-outline-variant rounded p-2 text-xs text-on-surface w-full"
                />
              </div>

              <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveMaintVehiculo(null)}
                  className="px-4 py-2 uppercase tracking-wide text-xs text-on-surface-variant hover:text-on-surface font-sans"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 uppercase tracking-wide text-xs bg-secondary text-on-secondary font-bold rounded"
                >
                  Generar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
