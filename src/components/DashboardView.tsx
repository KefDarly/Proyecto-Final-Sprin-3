/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Monitoreo, Vehiculo, Ruta, ConsumoCombustible } from '../types';

interface DashboardViewProps {
  monitoreos: Monitoreo[];
  vehiculos: Vehiculo[];
  rutas: Ruta[];
  consumos: ConsumoCombustible[];
}

export default function DashboardView({
  monitoreos,
  vehiculos,
  rutas,
  consumos
}: DashboardViewProps) {
  // Calculator states
  const [calcDistance, setCalcDistance] = useState('500');
  const [calcPlaca, setCalcPlaca] = useState('');
  const [calcResult, setCalcResult] = useState<{ gallons: number; cost: number } | null>(null);

  // Active Map telemetry state
  const [selectedMapTripId, setSelectedMapTripId] = useState<number | null>(1);

  // Dynamic calculations
  const totalCost = consumos.reduce((acc, c) => acc + c.costo_total, 0);
  const totalDistance = monitoreos.reduce((acc, m) => {
    const rut = rutas.find(r => r.id_ruta === m.id_ruta);
    return acc + (rut?.distancia_km || 0);
  }, 0);

  const activeTripsList = monitoreos.filter(m => m.estado === 'En Ruta');
  const efficiencyPercent = 94.6; // High standard compliance rate

  // Map coordinates matrix
  const cityCoords: Record<string, { lat: string; lng: string; x: number; y: number }> = {
    'Lima': { lat: '-12.0463', lng: '-77.0427', x: 200, y: 180 },
    'Callao': { lat: '-12.0508', lng: '-77.1259', x: 170, y: 172 },
    'Arequipa': { lat: '-16.4090', lng: '-71.5375', x: 380, y: 320 },
    'Cusco': { lat: '-13.5319', lng: '-71.9675', x: 420, y: 240 },
    'Piura': { lat: '-5.1945', lng: '-80.6328', x: 80, y: 50 },
    'Chiclayo': { lat: '-6.7711', lng: '-79.8441', x: 110, y: 80 },
    'Ica': { lat: '-14.0782', lng: '-75.7290', x: 230, y: 230 },
    'Pisco': { lat: '-13.7000', lng: '-76.1333', x: 215, y: 210 },
    'Juliaca': { lat: '-15.4975', lng: '-70.1300', x: 440, y: 300 },
    'Lurín': { lat: '-12.2700', lng: '-76.8700', x: 210, y: 195 },
    'Huancayo': { lat: '-12.0651', lng: '-75.2048', x: 260, y: 185 },
    'Trujillo': { lat: '-8.1116', lng: '-79.0286', x: 140, y: 110 }
  };

  // Perform quick fuel estimation
  const handleCalculateFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const distanceVal = parseFloat(calcDistance);
    if (!distanceVal) {
      alert('Favor ingrese un kilometraje válido.');
      return;
    }

    // Default rate: 3.5 KM per gallon for heavy trucks
    let rate = 3.5;
    if (calcPlaca) {
      const selectedV = vehiculos.find(v => v.placa === calcPlaca);
      // Adjust consumption rate based on capacity
      if (selectedV) {
        if (selectedV.capacidad_toneladas > 40) rate = 2.8; // burns more
        else if (selectedV.capacidad_toneladas < 30) rate = 4.2; // burns less
      }
    }

    const calculatedGallons = parseFloat((distanceVal / rate).toFixed(1));
    const estimatedCost = parseFloat((calculatedGallons * 16.5).toFixed(2)); // average price S/ 16.5 per Gallon

    setCalcResult({
      gallons: calculatedGallons,
      cost: estimatedCost
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end select-none">
        <div>
          <h2 className="font-sans text-3xl font-black text-on-surface tracking-tight mb-1">Dashboard Ejecutivo</h2>
          <p className="text-xs text-on-surface-variant font-medium">Visualización de costos operativos terrestres, rendimiento térmico de flota y cobertura satelital.</p>
        </div>
      </div>

      {/* Counter widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl hover:shadow-lg transition-all relative overflow-hidden group">
          <div className="absolute right-4 top-4 p-2 text-on-surface-variant opacity-10">
            <span className="material-symbols-outlined text-4xl">payments</span>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1">Costo Acumulado Combustible</p>
          <h3 className="text-3xl font-sans font-black text-secondary">S/ {totalCost.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-[11px] text-on-surface-variant mt-1.5">Acumulado en tiempo real por cisternas autorizadas.</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl hover:shadow-lg transition-all relative overflow-hidden group">
          <div className="absolute right-4 top-4 p-2 text-on-surface-variant opacity-10">
            <span className="material-symbols-outlined text-4xl">map</span>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1 font-sans">Kilómetros Corridos</p>
          <h3 className="text-3xl font-sans font-black text-primary">{totalDistance.toLocaleString()} KM</h3>
          <p className="text-[11px] text-on-surface-variant mt-1.5">Tramos concluidos y rutas bajo despacho activo.</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl hover:shadow-lg transition-all relative overflow-hidden group">
          <div className="absolute right-4 top-4 p-2 text-on-surface-variant opacity-10">
            <span className="material-symbols-outlined text-4xl">energy_savings_leaf</span>
          </div>
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1">Eficacia Operativa General</p>
          <h3 className="text-3xl font-sans font-black text-[#10B981]">{efficiencyPercent}%</h3>
          <p className="text-[11px] text-on-surface-variant mt-1.5">Mantenimiento preventivo a tiempo y optimización vial.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Interactive map matrix layout */}
        <div className="col-span-12 xl:col-span-7 bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-sm font-bold text-on-surface mb-1">Servidor Satelital de Cobertura</h3>
            <p className="text-xs text-on-surface-variant mb-4 font-sans">Identifique la geolocalización aproximada de las unidades en ruta sobre el mapa de autopistas.</p>
          </div>

          <div className="relative h-[340px] bg-[#0e0e10] border border-outline-variant rounded-lg overflow-hidden flex items-center justify-center p-4">
            {/* Grid pattern mock */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 select-none pointer-events-none" style={{ backgroundImage: 'radial-gradient(#44474d 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

            {/* Custom styled vector plot representing Peru Autopista map */}
            <div className="relative w-full h-full max-w-[500px]">
              {/* Route lines rendering between cities */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-40">
                <path d="M 200,180 L 380,320" stroke="#8f9097" strokeWidth="1" strokeDasharray="4" fill="none" />
                <path d="M 170,172 L 420,240" stroke="#ffb95f" strokeWidth="1.5" strokeDasharray="4" fill="none" />
                <path d="M 80,50 L 110,80" stroke="#8f9097" strokeWidth="1" fill="none" />
                <path d="M 230,230 L 200,180" stroke="#8f9097" strokeWidth="1" fill="none" />
                <path d="M 140,110 L 110,80" stroke="#ffb95f" strokeWidth="1.5" fill="none" />
              </svg>

              {/* Render city pins */}
              {Object.entries(cityCoords).map(([name, coords]) => {
                // If this city is the destination or origin of the selected trip, light it up!
                let isHighlighted = false;
                if (selectedMapTripId) {
                  const activeT = monitoreos.find(m => m.id_monitoreo === selectedMapTripId);
                  const activeR = activeT ? rutas.find(r => r.id_ruta === activeT.id_ruta) : null;
                  if (activeR && (activeR.origen === name || activeR.destino === name)) {
                    isHighlighted = true;
                  }
                }

                return (
                  <div
                    key={name}
                    style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                  >
                    <span className={`w-3 h-3 rounded-full border border-black shadow transition-all duration-300 ${
                      isHighlighted 
                        ? 'bg-secondary scale-125 ring-2 ring-secondary/50' 
                        : 'bg-outline-variant hover:bg-secondary'
                    }`}></span>
                    <span className={`text-[9px] font-bold font-sans mt-1 p-0.5 rounded shadow-lg transition-all ${
                      isHighlighted
                        ? 'text-secondary bg-[#131315]/95 scale-110 font-extrabold'
                        : 'text-on-surface-variant bg-[#131315]/80 opacity-60'
                    }`}>
                      {name}
                    </span>
                  </div>
                );
              })}

              {/* Live truck position pulsing indicator representing real coordinates */}
              {selectedMapTripId && (() => {
                const activeT = monitoreos.find(m => m.id_monitoreo === selectedMapTripId);
                if (activeT) {
                  const activeR = rutas.find(r => r.id_ruta === activeT.id_ruta);
                  const v = vehiculos.find(veh => veh.id_vehiculo === activeT.id_vehiculo);
                  
                  if (activeR) {
                    const originC = cityCoords[activeR.origen];
                    const destC = cityCoords[activeR.destino];
                    
                    if (originC && destC) {
                      // Estimate halfway position for live truck plot
                      const tx = (originC.x + destC.x) / 2;
                      const ty = (originC.y + destC.y) / 2;
                      
                      return (
                        <div
                          style={{ left: `${tx}px`, top: `${ty}px` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 animate-bounce"
                        >
                          <span className="absolute -top-1 w-2.5 h-2.5 bg-error rounded-full animate-ping"></span>
                          <span className="material-symbols-outlined text-error text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                            local_shipping
                          </span>
                          <div className="bg-[#0e0e10] text-[#ffdad6] border border-error text-[8px] font-mono px-1 py-0.5 rounded shrink-0 pointer-events-none select-none uppercase font-extrabold shadow-md">
                            {v?.placa} ({activeT.estado})
                          </div>
                        </div>
                      );
                    }
                  }
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        {/* Dynamic Calculator & live selectors block Column */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          {/* Quick Telemetry list selector */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
            <h3 className="font-sans text-sm font-bold text-on-surface mb-1">Rutas en Seguimiento Activo</h3>
            <p className="text-[11px] text-on-surface-variant mb-3">Haga clic en un viaje para enfocar su posición satelital y ver coordenadas.</p>

            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
              {activeTripsList.map(trip => {
                const v = vehiculos.find(veh => veh.id_vehiculo === trip.id_vehiculo);
                const r = rutas.find(rut => rut.id_ruta === trip.id_ruta);
                const isSelected = selectedMapTripId === trip.id_monitoreo;

                return (
                  <button
                    key={trip.id_monitoreo}
                    onClick={() => setSelectedMapTripId(trip.id_monitoreo)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 flex justify-between items-center ${
                      isSelected
                        ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                        : 'bg-surface-container-high border-outline-variant/60 text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <div className="text-xs">
                      <p className="font-sans font-extrabold">{v?.placa} ({v?.marca} {v?.modelo})</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{r?.origen} → {r?.destino}</p>
                    </div>
                    <span className="material-symbols-outlined text-sm">
                      {isSelected ? 'radar' : 'gps_fixed'}
                    </span>
                  </button>
                );
              })}
              {activeTripsList.length === 0 && (
                <p className="text-xs text-on-surface-variant italic text-center py-4">No hay unidades en ruta actualmente.</p>
              )}
            </div>
          </div>

          {/* Interactive Fuel and Cost Estimator Calculator */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
            <h3 className="font-sans text-sm font-bold text-on-surface mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-sm">local_gas_station</span>
              Calculadora Logística de Consumo
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Planifique sus despachos estimando gasto y combustible.</p>

            <form onSubmit={handleCalculateFuel} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Tramo (Distancia en KM)</label>
                  <input
                    type="number"
                    required
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant rounded p-2 text-xs text-on-surface font-mono"
                    placeholder="Distancia en KM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Asignar Vehículo (Opcional)</label>
                  <select
                    value={calcPlaca}
                    onChange={(e) => setCalcPlaca(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant rounded p-2 text-xs text-on-surface"
                  >
                    <option value="">Seleccione placa...</option>
                    {vehiculos.map(v => (
                      <option key={v.placa} value={v.placa}>
                        {v.placa} ({v.capacidad_toneladas} TN)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-secondary text-on-secondary font-black py-2.5 rounded hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer uppercase text-[10px]"
              >
                Ejecutar Estimación Logística
              </button>
            </form>

            {calcResult && (
              <div className="mt-4 p-3 bg-surface-container-high rounded-lg border border-outline-variant space-y-2 select-none animate-in fade-in duration-150">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Galonaje Estimado:</span>
                  <span className="font-mono font-bold text-secondary text-sm">{calcResult.gallons} Glns</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Presupuesto Estimado (Cisternas):</span>
                  <span className="font-mono font-black text-[#10B981] text-sm">S/ {calcResult.cost.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
