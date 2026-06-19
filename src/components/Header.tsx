/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Personal, Incidencia } from '../types';

interface HeaderProps {
  title: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  currentUser: Personal | null;
  activeIncidents: Incidencia[];
  onSolveIncident?: (id: number) => void;
  onProfileClick?: () => void;
}

export default function Header({
  title,
  searchTerm,
  onSearchChange,
  currentUser,
  activeIncidents,
  onSolveIncident,
  onProfileClick
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Avatar matching the corporate roles
  const getAvatar = () => {
    if (currentUser?.usuario === 'Kefren') {
      // Operations Supervisor / Admin
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuClgsHSwnA2iXpykne4AhcaAsEdPoRPegMfc4UkJQ37mRD-RY_4zWBMpIHpbaP6g-wf4ST7-htnPk9MX_KRoX_GI9WIYCHsuRsLsc8OxV46whzoxMrPso5_lfUHatQQyaG0_EfXehZohSboXk3Kti2SoJM7QqdvQDI5P-RKUiO6tnU27FIbRCl4ueGMXFvVB-860bNolhYGK6DFJWFbrt7WLAp2t1JmkaunmXO9aehYsW_1ZRwk3KyYjPXIKJYdPOwdSXqwrz1WipU';
    } else if (currentUser?.rol === 'Administrador') {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuChbMzCPFDi_0yFD5SuE0t5Wu20suMqRHg_ZCjc0Z-hVomj4E3u9rFKuK92DFE40JS26MfCMlj7bT5qyn9_kP1iFkvVhO54MNSSmCMBtBUzKqzBk7Tp4CGXj-b4HzCdOrDx7KGRm58FSRGrsOCzxljb_vjxKfUNpLyszbdUKVWyEmOgxBRSFNVlq5FGqi5FfCE0RRA7ZC-vhAPEycb7ONo9zOp36UFch3OAAq0BJyw3kdP5P3aZw5WQmTuP0pA-22gm2ldkl4CUX-Y';
    } else {
      // Worker
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMkZ8GLWQ-o47DsOvgFLoFBQ6DA17R6SGyWZpr3MznnLE5sZg9gtd4qJJqrR2uI7n9MF18CKiQXy9jM8uXyBnrNt0zD7_vo8wRBDTxlYyEvFY6BcLgQ2--vp2NdSDcCYS8flcq_rbDN9AYSrbYFd1Z8V_2a3VRlM_0pNk15D-tc6LEx3iZmrVMyvyXaaeibynwfWhLPSkmNy25Jy9w_92DYVI6waitAL8MQp-HRx7npYb4qgdnBI-YnbjNDLsbr-ajDIlGDe2TYC8';
    }
  };

  return (
    <header className="h-14 flex justify-between items-center px-6 bg-slate-900/40 backdrop-blur-md border-b border-slate-800 fixed top-0 right-0 left-64 z-40 select-none">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10b981] transition-colors text-base">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#10b981]/50 rounded pl-8 pr-4 py-1.5 text-slate-200 placeholder:text-slate-500 font-mono text-xs focus:outline-none transition-all"
            placeholder="Filtrar por placa, conductor, alerta..."
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 text-xs"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        {/* Network and Corporate Status Labels */}
        <div className="hidden lg:flex items-center gap-6 text-left border-r border-slate-800 pr-6 mr-2">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase text-slate-500 tracking-wider">Estado de Red</span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Sincronizado DB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase text-slate-500 tracking-wider">Empresa</span>
            <span className="text-[10px] text-slate-300 font-mono font-medium">Petro Mapi S.A.C.</span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Active alarms badge */}
          {activeIncidents.length > 0 && (
            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black tracking-widest rounded uppercase">
              {activeIncidents.length} ALERTAS ACTIVAS
            </span>
          )}

          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-400 hover:text-primary transition-colors relative cursor-pointer active:opacity-80 flex items-center"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            {activeIncidents.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#f43f5e] rounded-full animate-ping"></span>
            )}
            {activeIncidents.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#f43f5e] rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-secondary">
                  Alertas de Operaciones ({activeIncidents.length})
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-on-surface-variant hover:text-on-surface text-xs"
                >
                  Cerrar
                </button>
              </div>
              {activeIncidents.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">
                  No hay alertas críticas pendientes
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeIncidents.map((inc) => (
                    <div
                      key={inc.id_incidencia}
                      className="p-2.5 rounded-lg bg-error/10 border-l-4 border-error flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-on-surface line-clamp-1">{inc.tipo}</p>
                          <span className="text-[9px] text-error font-extrabold uppercase ml-2 select-none">
                            {inc.estado_alerta}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1">
                          {inc.descripcion}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-error/20">
                        <span className="text-[9px] text-on-surface-variant font-mono">
                          {new Date(inc.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {onSolveIncident && (
                          <button
                            onClick={() => {
                              onSolveIncident(inc.id_incidencia);
                            }}
                            className="bg-error/20 hover:bg-error/30 text-error font-sans font-bold text-[10px] px-2 py-0.5 rounded transition-colors"
                          >
                            Resolver
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Help Button */}
          <button
            onClick={() => alert(`Sistema Operacional Petro Mapi.\nLicence Active\nContacto de soporte: soporte@petromapi.com`)}
            className="p-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:opacity-80 flex items-center"
          >
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>
        </div>

        <div className="h-8 w-px bg-outline-variant"></div>

        {/* User Card */}
        <button
          onClick={onProfileClick}
          type="button"
          className="flex items-center gap-2 text-left cursor-pointer hover:bg-slate-800/40 p-1 px-2 rounded-lg transition-all active:scale-95"
          title="Ver o editar mi perfil personal"
        >
          <div className="text-right">
            <p className="font-sans text-xs font-bold text-slate-200">
              {currentUser ? currentUser.nombre_completo.split(' ')[0] + ' ' + (currentUser.nombre_completo.split(' ')[1] || '') : 'Invitado'}
            </p>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-primary mt-0.5">
              {currentUser?.rol.replace(' (Full Acceso)', '') || 'INVITADO'}
            </p>
          </div>
          <img
            alt="User portrait file"
            className="w-8 h-8 rounded-full border border-slate-700 object-cover select-none"
            src={getAvatar()}
          />
        </button>
      </div>
    </header>
  );
}
