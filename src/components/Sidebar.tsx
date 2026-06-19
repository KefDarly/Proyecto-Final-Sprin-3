/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Personal, Modulo } from '../types';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  currentUser: Personal | null;
  onLogout: () => void;
  userPermissions: Modulo[];
  cloudStatus: { connected: boolean; error: string | null; lastSync: string };
  dbDetails: { projectId: string; authDomain: string; firestoreDatabaseId: string; storageBucket: string };
}

export default function Sidebar({
  currentTab,
  onChangeTab,
  currentUser,
  onLogout,
  userPermissions,
  cloudStatus,
  dbDetails
}: SidebarProps) {
  
  // Check permission for a tab
  const hasPermission = (moduleName: string) => {
    if (!currentUser) return false;
    if (currentUser.rol === 'Administrador' || currentUser.rol === 'Administradores (Full Acceso)') return true;
    return userPermissions.some(m => m.nombre_modulo.toLowerCase().includes(moduleName.toLowerCase()));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', module: 'Dashboard Ejecutivo' },
    { id: 'monitoreo', label: 'Monitoreo', icon: 'location_searching', module: 'Monitoreo en Vivo' },
    { id: 'flota', label: 'Flota', icon: 'local_shipping', module: 'Gestión de Flota Vehicular' },
    { id: 'rutas', label: 'Rutas', icon: 'route', module: 'Monitoreo en Vivo' }, // general route support
    { id: 'incidencias', label: 'Incidencias', icon: 'warning', module: 'Administración de Flota y Reportes' },
    { id: 'usuarios', label: 'Usuarios', icon: 'group', module: 'Administración de Flota y Reportes', adminOnly: true }
  ];

  return (
    <aside id="sidebar-container" className="h-screen w-64 flex flex-col fixed left-0 top-0 bg-slate-900/50 border-r border-[#1e293b]/70 py-4 z-50 select-none">
      <div className="p-4 mb-4 border-b border-[#1e293b]/70">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-sans text-lg font-extrabold text-secondary tracking-tighter uppercase">
            PETROMAPI<span className="text-[#a7f3d0] font-light font-sans tracking-tighter text-sm">LOGISTICS</span>
          </h1>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Fleet Control v2.4</p>
      </div>

      <nav className="flex-1 flex flex-col space-y-1.5 px-3">
        {navItems.map((item) => {
          // If admin-only, restrict to admin role
          const isAdmin = currentUser?.rol === 'Administrador' || currentUser?.rol === 'Administradores (Full Acceso)';
          if (item.adminOnly && !isAdmin) return null;
          
          const isSelected = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex items-center px-3 py-2 rounded transition-all text-left w-full active:scale-95 duration-150 border text-xs gap-2.5 ${
                isSelected
                  ? 'bg-secondary/15 text-primary border-primary/20 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border-transparent'
              }`}
            >
              {isSelected ? (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse"></div>
              ) : (
                <span className="material-symbols-outlined text-base text-slate-500">
                  {item.icon}
                </span>
              )}
              <span className="font-sans font-semibold tracking-tight text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Report shortcut - Industrial Button */}
      <div className="px-3 mb-2">
        <button
          onClick={() => onChangeTab('incidencias')}
          className="w-full py-1.5 bg-secondary text-slate-950 font-extrabold rounded hover:opacity-90 active:scale-98 transition-all text-[11px] tracking-wider font-sans uppercase flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>NUEVO REPORTE</span>
        </button>
      </div>

      <div className="border-t border-[#1e293b]/70 pt-2 space-y-1 px-3">
        {(currentUser?.rol === 'Administrador' || currentUser?.rol === 'Administradores (Full Acceso)') && (
          <button
            onClick={() => onChangeTab('ajustes')}
            className={`flex items-center px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded transition-colors w-full text-left font-sans text-xs ${
              currentTab === 'ajustes' ? 'text-primary font-bold bg-secondary/15 border-l-2 border-primary' : ''
            }`}
          >
            <span className="material-symbols-outlined mr-2 text-base">settings</span>
            <span>Ajustes</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex items-center px-3 py-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors w-full text-left font-sans text-xs active:scale-95"
        >
          <span className="material-symbols-outlined mr-2 text-base">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Firebase Cloud Connection Monitor */}
      <div className="mt-auto px-3 pt-3 border-t border-[#1e293b]/70">
        <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded flex flex-col gap-1 font-mono text-[9px] text-left">
          <div className="flex items-center justify-between">
            <span className="text-slate-450 font-sans font-bold">BD CLOUD FIRESTORE:</span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${cloudStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className={`font-bold font-sans ${cloudStatus.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {cloudStatus.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </span>
          </div>
          <div className="space-y-0.5 text-slate-500">
            <div className="truncate"><span className="text-slate-400 font-semibold font-sans">Project:</span> {dbDetails.projectId}</div>
            <div className="truncate"><span className="text-slate-400 font-semibold font-sans">Database:</span> {dbDetails.firestoreDatabaseId}</div>
            <div><span className="text-slate-400 font-semibold font-sans font-medium">Last Sync:</span> <span className="text-slate-300">{cloudStatus.lastSync}</span></div>
          </div>
          {cloudStatus.error && (
            <div className="text-rose-400 text-[8px] border-t border-rose-500/10 pt-1 mt-0.5 truncate">
              {cloudStatus.error}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-2 text-[9px] text-slate-500 font-mono uppercase tracking-widest text-center">
        v2.4.0 Build 2026
      </div>
    </aside>
  );
}
