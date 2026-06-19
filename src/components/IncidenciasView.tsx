/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Incidencia, Monitoreo, Vehiculo } from '../types';

interface IncidenciasViewProps {
  incidencias: Incidencia[];
  monitoreos: Monitoreo[];
  vehiculos: Vehiculo[];
  searchTerm: string;
  onSolveIncident: (id: number) => void;
  onAddIncidencia: (inc: Omit<Incidencia, 'id_incidencia' | 'fecha_hora'>) => void;
}

export default function IncidenciasView({
  incidencias,
  monitoreos,
  vehiculos,
  searchTerm,
  onSolveIncident,
  onAddIncidencia
}: IncidenciasViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMonitoreo, setSelectedMonitoreo] = useState('');
  const [tipo, setTipo] = useState('Pérdida de señal GPS');
  const [descripcion, setDescripcion] = useState('');

  // Search filter
  const filtered = incidencias.filter(i => {
    const term = searchTerm.toLowerCase();
    const trip = monitoreos.find(m => m.id_monitoreo === i.id_monitoreo);
    const veh = trip ? vehiculos.find(v => v.id_vehiculo === trip.id_vehiculo) : null;
    return (
      i.tipo.toLowerCase().includes(term) ||
      i.descripcion.toLowerCase().includes(term) ||
      i.estado_alerta.toLowerCase().includes(term) ||
      (veh?.placa || '').toLowerCase().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonitoreo || !descripcion) {
      alert('Por favor complete todos lo campos requeridos.');
      return;
    }
    onAddIncidencia({
      id_monitoreo: parseInt(selectedMonitoreo),
      tipo,
      descripcion,
      reportado_por: 1, // Kefren Admin
      estado_alerta: 'Pendiente'
    });
    alert('Log de incidencia registrado en base de datos.');
    setSelectedMonitoreo('');
    setDescripcion('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end select-none">
        <div>
          <h2 className="font-sans text-3xl font-black text-on-surface tracking-tight mb-1">Registro de Incidencias</h2>
          <p className="text-xs text-on-surface-variant font-medium">Historial y estado de sucesos críticos en carreteras, pérdida de telemetría y bloqueos.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-error text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:brightness-115 active:scale-95 transition-all shadow-lg text-xs"
        >
          <span className="material-symbols-outlined text-sm font-black">report</span>
          <span>{showAdd ? 'Cerrar Reporte' : 'Registrar Incidencia Vial'}</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {showAdd && (
          <form onSubmit={handleSubmit} className="col-span-12 md:col-span-4 bg-surface-container border border-outline-variant p-5 rounded-xl space-y-4 text-xs">
            <p className="text-xs font-black text-error uppercase tracking-widest flex items-center gap-1.5 leading-none">
              <span className="material-symbols-outlined text-xs">warning</span>
              Reportar Incidente Crítico
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase">Viaje Relacionado (ID Log)</label>
              <select
                required
                value={selectedMonitoreo}
                onChange={(e) => setSelectedMonitoreo(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant rounded p-2.5 text-xs text-on-surface"
              >
                <option value="">Seleccione despacho activo...</option>
                {monitoreos.map(m => {
                  const veh = vehiculos.find(v => v.id_vehiculo === m.id_vehiculo);
                  return (
                    <option key={m.id_monitoreo} value={m.id_monitoreo}>
                      TRK-{1000 + m.id_monitoreo} - {veh?.placa} ({m.tipo_carga})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase">Gravedad / Tipo</label>
              <select
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant rounded p-2.5 text-xs text-on-surface"
              >
                <option value="Pérdida de señal GPS">Pérdida de señal GPS</option>
                <option value="Desvío de Ruta Autorizada">Desvío de Ruta Autorizada</option>
                <option value="Retraso por Bloqueo">Retraso por Bloqueo Vial</option>
                <option value="Falla de Presión Aire">Falla de Presión Neumáticos</option>
                <option value="Falla Mecánica de Tracción">Falla de Motor / Tracción</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase">Descripción Sucinta</label>
              <textarea
                required
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Señale las medidas de control inmediato..."
                className="w-full bg-surface-container-highest border border-outline-variant rounded p-2.5 text-xs text-on-surface resize-none"
              />
            </div>

            <button type="submit" className="w-full bg-error text-white font-bold py-3 rounded-lg text-xs tracking-wider uppercase">
              Emitir Alerta Crítica
            </button>
          </form>
        )}

        <div className={`col-span-12 ${showAdd ? 'md:col-span-8' : ''} bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-2xl`}>
          <div className="p-4 bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-sans text-sm font-bold text-on-surface">Historial de Alertas Emitidas</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none text-xs">
              <thead>
                <tr className="bg-surface uppercase text-on-surface-variant font-bold border-b border-outline-variant">
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">ID ALERTA</th>
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">TIPO</th>
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">CISTERNA</th>
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">DESCRIPCIÓN</th>
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">ESTADO</th>
                  <th className="px-6 py-3 font-extrabold text-right text-[#8f9097]">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filtered.map(i => {
                  const trip = monitoreos.find(m => m.id_monitoreo === i.id_monitoreo);
                  const veh = trip ? vehiculos.find(v => v.id_vehiculo === trip.id_vehiculo) : null;

                  return (
                    <tr key={i.id_incidencia} className="hover:bg-surface-container-highest/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-error">
                        ALT-{200 + i.id_incidencia}
                      </td>
                      <td className="px-6 py-4 font-sans text-xs font-bold text-on-surface">
                        {i.tipo}
                      </td>
                      <td className="px-6 py-4 font-mono text-secondary-fixed-dim font-bold">
                        {veh ? veh.placa : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-on-surface-variant max-w-xs truncate">
                        {i.descripcion}
                      </td>
                      <td className="px-6 py-4">
                        {i.estado_alerta === 'Pendiente' ? (
                          <span className="bg-error/10 border border-error/30 text-error px-2 py-0.5 rounded text-[10px] font-bold">
                            PENDIENTE
                          </span>
                        ) : (
                          <span className="bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] px-2 py-0.5 rounded text-[10px] font-bold">
                            RESUELTO
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {i.estado_alerta === 'Pendiente' ? (
                          <button
                            onClick={() => onSolveIncident(i.id_incidencia)}
                            className="bg-error-container text-on-error-container hover:brightness-110 font-bold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
                          >
                            Resolver Alerta
                          </button>
                        ) : (
                          <span className="text-on-surface-variant font-mono font-medium text-[10px]">Cerrado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
