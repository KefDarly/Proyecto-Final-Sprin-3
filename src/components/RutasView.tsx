/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ruta } from '../types';

interface RutasViewProps {
  rutas: Ruta[];
  onAddRuta: (r: Omit<Ruta, 'id_ruta'>) => void;
  searchTerm: string;
}

export default function RutasView({
  rutas,
  onAddRuta,
  searchTerm
}: RutasViewProps) {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [distancia, setDistancia] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Filter routes based on search term
  const filtered = rutas.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.origen.toLowerCase().includes(term) ||
      r.destino.toLowerCase().includes(term) ||
      r.distancia_km.toString().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origen || !destino || !distancia) {
      alert('Por favor complete origen, destino y distancia.');
      return;
    }
    onAddRuta({
      origen,
      destino,
      distancia_km: parseFloat(distancia) || 120
    });
    alert(`Ruta registrada con éxito: ${origen} a ${destino}`);
    setOrigen('');
    setDestino('');
    setDistancia('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end select-none">
        <div>
          <h2 className="font-sans text-3xl font-black text-on-surface tracking-tight mb-1">Rutas Autorizadas</h2>
          <p className="text-xs text-on-surface-variant font-medium">Gestión de tramos viales, kilometraje total y control de distancias corporativas.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary text-on-secondary font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-lg text-xs tracking-wider"
        >
          <span className="material-symbols-outlined text-sm font-black">add_road</span>
          <span>{showForm ? 'Cerrar Formulario' : 'Nueva Ruta Vial'}</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Form Column */}
        {showForm && (
          <div className="col-span-12 md:col-span-4 bg-surface-container border border-outline-variant p-5 rounded-xl space-y-4">
            <p className="text-xs font-black text-secondary uppercase tracking-widest">Registrar Nuevo Tramo</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-on-surface-variant">Lugar De Origen</label>
                <input
                  type="text"
                  required
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ej: Callao"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded p-2 text-xs text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-on-surface-variant">Lugar De Destino</label>
                <input
                  type="text"
                  required
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ej: Tacna"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded p-2 text-xs text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-on-surface-variant">Distancia Total (KM)</label>
                <input
                  type="number"
                  required
                  value={distancia}
                  onChange={(e) => setDistancia(e.target.value)}
                  placeholder="Ej: 1250"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded p-2 text-xs text-on-surface font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-secondary text-on-secondary font-black rounded-lg text-xs uppercase cursor-pointer"
              >
                Guardar Tramo De Ruta
              </button>
            </form>
          </div>
        )}

        {/* Routes data display */}
        <div className={`col-span-12 ${showForm ? 'md:col-span-8' : ''} bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-2xl`}>
          <div className="p-4 bg-surface-container-high border-b border-outline-variant">
            <h3 className="font-sans text-sm font-bold text-on-surface">Índice de Tramos Logísticos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none text-xs">
              <thead>
                <tr className="bg-surface uppercase text-on-surface-variant font-bold border-b border-outline-variant">
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">CÓDIGO DE TRAMO</th>
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">ORIGEN</th>
                  <th className="px-6 py-3 font-extrabold text-[#8f9097]">DESTINO</th>
                  <th className="px-6 py-3.5 tracking-wider uppercase text-right font-extrabold text-[#8f9097]">DISTANCIA (KM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filtered.map((r) => (
                  <tr key={r.id_ruta} className="hover:bg-surface-container-highest/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-secondary">
                      RUT-{500 + r.id_ruta}
                    </td>
                    <td className="px-6 py-4 font-sans text-sm text-on-surface">
                      {r.origen}
                    </td>
                    <td className="px-6 py-4 font-sans text-sm text-on-surface">
                      {r.destino}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-on-surface text-sm font-extrabold tracking-wider">
                      {r.distancia_km.toLocaleString()} KM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
