/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getDB, saveDB, resetDB } from './db';
import { Personal, Modulo, PermisoModulo, Monitoreo, Vehiculo, Conductor, Ruta, Incidencia, Mantenimiento } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import MonitoreoView from './components/MonitoreoView';
import FlotaView from './components/FlotaView';
import RutasView from './components/RutasView';
import IncidenciasView from './components/IncidenciasView';
import PersonalView from './components/PersonalView';

export default function App() {
  // Database active simulated state reactive
  const [db, setDb] = useState(() => getDB());

  // Logged user profile session
  const [currentUser, setCurrentUser] = useState<Personal | null>(() => {
    const raw = localStorage.getItem('petromapi_session_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Navigation tab route state
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Search filter terms
  const [searchTerm, setSearchTerm] = useState('');

  // Persist session state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('petromapi_session_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('petromapi_session_user');
    }
  }, [currentUser]);

  // Keep db synced to storage
  const updateDBState = (updater: (prev: typeof db) => typeof db) => {
    setDb((prev) => {
      const next = updater(prev);
      saveDB(next);
      return next;
    });
  };

  const handleLoginSuccess = (user: Personal) => {
    setCurrentUser(user);
    // Redirect to permitted modules
    if (user.rol === 'Administrador' || user.rol === 'Administradores (Full Acceso)') {
      setCurrentTab('dashboard');
    } else {
      // Find what modules worker is allowed
      const allowedModuleIds = db.permisos_modulo
        .filter((pm) => pm.id_personal === user.id_personal)
        .map((pm) => pm.id_modulo);
      
      const firstAllowed = db.modulos.find((m) => allowedModuleIds.includes(m.id_modulo));
      if (firstAllowed) {
        if (firstAllowed.nombre_modulo.includes('Monitoreo')) setCurrentTab('monitoreo');
        else if (firstAllowed.nombre_modulo.includes('Flota')) setCurrentTab('flota');
        else if (firstAllowed.nombre_modulo.includes('Dashboard')) setCurrentTab('dashboard');
        else setCurrentTab('monitoreo');
      } else {
        setCurrentTab('monitoreo'); // fallback
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
    setSearchTerm('');
  };

  // Add cross-relational operations
  const handleAddMonitoreo = (trip: Omit<Monitoreo, 'id_monitoreo' | 'createdAt'>) => {
    updateDBState((prev) => {
      const nextId = prev.monitoreos.reduce((max, m) => Math.max(max, m.id_monitoreo), 0) + 1;
      const newTrip: Monitoreo = {
        ...trip,
        id_monitoreo: nextId,
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        monitoreos: [newTrip, ...prev.monitoreos]
      };
    });
  };

  const handleUpdateMonitoreoStatus = (id: number, status: 'En Ruta' | 'Completado' | 'Incidencia') => {
    updateDBState((prev) => {
      const updated = prev.monitoreos.map((m) => {
        if (m.id_monitoreo === id) {
          return {
            ...m,
            estado: status,
            fecha_llegada: status === 'Completado' ? new Date().toISOString() : null
          };
        }
        return m;
      });
      return {
        ...prev,
        monitoreos: updated
      };
    });
  };

  const handleAddIncidencia = (inc: Omit<Incidencia, 'id_incidencia' | 'fecha_hora'>) => {
    updateDBState((prev) => {
      const nextId = prev.incidencias.reduce((max, i) => Math.max(max, i.id_incidencia), 0) + 1;
      const newInc: Incidencia = {
        ...inc,
        id_incidencia: nextId,
        fecha_hora: new Date().toISOString()
      };
      return {
        ...prev,
        incidencias: [newInc, ...prev.incidencias]
      };
    });
  };

  const handleAddVehiculo = (veh: Omit<Vehiculo, 'id_vehiculo'>) => {
    updateDBState((prev) => {
      const nextId = prev.vehiculos.reduce((max, v) => Math.max(max, v.id_vehiculo), 0) + 1;
      const newVeh: Vehiculo = {
        ...veh,
        id_vehiculo: nextId
      };
      return {
        ...prev,
        vehiculos: [...prev.vehiculos, newVeh]
      };
    });
  };

  const handleAddMantenimiento = (maint: Omit<Mantenimiento, 'id_mantenimiento'>) => {
    updateDBState((prev) => {
      const nextId = prev.mantenimientos.reduce((max, m) => Math.max(max, m.id_mantenimiento), 0) + 1;
      const newMaint: Mantenimiento = {
        ...maint,
        id_mantenimiento: nextId
      };
      return {
        ...prev,
        mantenimientos: [...prev.mantenimientos, newMaint]
      };
    });
  };

  const handleAddRuta = (route: Omit<Ruta, 'id_ruta'>) => {
    updateDBState((prev) => {
      const nextId = prev.rutas.reduce((max, r) => Math.max(max, r.id_ruta), 0) + 1;
      const newRoute: Ruta = {
        ...route,
        id_ruta: nextId
      };
      return {
        ...prev,
        rutas: [...prev.rutas, newRoute]
      };
    });
  };

  const handleAddPersonal = (worker: Omit<Personal, 'id_personal'>, selectedModuleIds: number[]) => {
    updateDBState((prev) => {
      const nextId = prev.personales.reduce((max, p) => Math.max(max, p.id_personal), 0) + 1;
      const newPersonal: Personal = {
        ...worker,
        id_personal: nextId
      };
      
      // Setup modules permissions records as requested by database interlocks
      const newPermissions = selectedModuleIds.map((mId) => ({
        id_personal: nextId,
        id_modulo: mId
      }));

      return {
        ...prev,
        personales: [...prev.personales, newPersonal],
        permisos_modulo: [...prev.permisos_modulo, ...newPermissions]
      };
    });
  };

  const handleEditPersonal = (id: number, updated: Partial<Personal>, selectedModuleIds?: number[]) => {
    updateDBState((prev) => {
      const updatedPersonales = prev.personales.map((p) => {
        if (p.id_personal === id) {
          return {
            ...p,
            ...updated
          };
        }
        return p;
      });

      let updatedPermisos = prev.permisos_modulo;
      if (selectedModuleIds !== undefined) {
        const otherPermisos = prev.permisos_modulo.filter(pm => pm.id_personal !== id);
        const newPermisos = selectedModuleIds.map((mId) => ({
          id_personal: id,
          id_modulo: mId
        }));
        updatedPermisos = [...otherPermisos, ...newPermisos];
      }

      return {
        ...prev,
        personales: updatedPersonales,
        permisos_modulo: updatedPermisos
      };
    });

    // Also sync the currentUser if editing themselves!
    if (currentUser && currentUser.id_personal === id) {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          ...updated
        };
      });
    }
  };

  // Profile editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileNombre, setProfileNombre] = useState('');
  const [profileUsuario, setProfileUsuario] = useState('');
  const [profileCorreo, setProfileCorreo] = useState('');
  const [profileContrasena, setProfileContrasena] = useState('');

  const handleOpenProfileModal = () => {
    if (!currentUser) return;
    setProfileNombre(currentUser.nombre_completo);
    setProfileUsuario(currentUser.usuario);
    setProfileCorreo(currentUser.correo);
    setProfileContrasena(currentUser.contrasena);
    setShowProfileModal(true);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!profileNombre || !profileUsuario || !profileCorreo || !profileContrasena) {
      alert('Por favor llene todos los campos del perfil.');
      return;
    }

    handleEditPersonal(currentUser.id_personal, {
      nombre_completo: profileNombre,
      usuario: profileUsuario.trim(),
      correo: profileCorreo.trim(),
      contrasena: profileContrasena,
    });

    alert('Tu perfil personal ha sido actualizado exitosamente.');
    setShowProfileModal(false);
  };

  const handleToggleStatus = (id: number) => {
    updateDBState((prev) => {
      const updated = prev.personales.map((p) => {
        if (p.id_personal === id) {
          return {
            ...p,
            estado: p.estado === 1 ? 0 : 1
          };
        }
        return p;
      });
      return {
        ...prev,
        personales: updated
      };
    });
  };

  const handleDeletePersonal = (id: number) => {
    if (currentUser?.id_personal === id) {
      alert('Error: No se puede dar de baja su propio usuario activo.');
      return;
    }
    updateDBState((prev) => {
      return {
        ...prev,
        personales: prev.personales.filter((p) => p.id_personal !== id),
        permisos_modulo: prev.permisos_modulo.filter((pm) => pm.id_personal !== id)
      };
    });
    alert('Operador dado de baja del sistema exitosamente.');
  };

  const handleSolveIncident = (id: number) => {
    updateDBState((prev) => {
      // Find the incident
      const incident = prev.incidencias.find((i) => i.id_incidencia === id);
      if (!incident) return prev;

      // Mark incident as solved
      const updatedIncidents = prev.incidencias.map((i) => {
        if (i.id_incidencia === id) {
          return {
            ...i,
            estado_alerta: 'Resuelto' as const
          };
        }
        return i;
      });

      // Update associated trip back to 'En Ruta'
      const updatedMonitoreo = prev.monitoreos.map((m) => {
        if (m.id_monitoreo === incident.id_monitoreo) {
          return {
            ...m,
            estado: 'En Ruta' as const
          };
        }
        return m;
      });

      return {
        ...prev,
        incidencias: updatedIncidents,
        monitoreos: updatedMonitoreo
      };
    });
    alert('Alerta solucionada. La cisterna de tramo asociada reanudó operaciones normales.');
  };

  // If not logged, present the credentials gate
  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        personales={db.personales}
      />
    );
  }

  // Find user modules permissions
  const userPermissions = db.modulos.filter((m) => 
    db.permisos_modulo.some((pm) => pm.id_personal === currentUser.id_personal && pm.id_modulo === m.id_modulo)
  );

  // Active alarms list count
  const activeIncidentsList = db.incidencias.filter((i) => i.estado_alerta === 'Pendiente');

  return (
    <div id="application-layout" className="min-h-screen bg-background text-[#cbd5e1] antialiased">
      {/* LEFT DRAWER MENU PANEL Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        userPermissions={userPermissions}
      />

      {/* RIGHT DISPLAY STAGE */}
      <div id="content-stage" className="pl-64 pt-16">
        <Header
          title={currentTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentUser={currentUser}
          activeIncidents={activeIncidentsList}
          onSolveIncident={handleSolveIncident}
          onProfileClick={handleOpenProfileModal}
        />

        <main className="p-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
          {currentTab === 'dashboard' && (
            <DashboardView
              monitoreos={db.monitoreos}
              vehiculos={db.vehiculos}
              rutas={db.rutas}
              consumos={db.consumos}
            />
          )}

          {currentTab === 'monitoreo' && (
            <MonitoreoView
              monitoreos={db.monitoreos}
              vehiculos={db.vehiculos}
              conductores={db.conductores}
              rutas={db.rutas}
              incidencias={db.incidencias}
              consumos={db.consumos}
              currentUser={currentUser}
              searchTerm={searchTerm}
              onAddMonitoreo={handleAddMonitoreo}
              onUpdateMonitoreoStatus={handleUpdateMonitoreoStatus}
              onAddIncidencia={handleAddIncidencia}
            />
          )}

          {currentTab === 'flota' && (
            <FlotaView
              vehiculos={db.vehiculos}
              mantenimientos={db.mantenimientos}
              incidencias={db.incidencias}
              monitoreos={db.monitoreos}
              onAddVehiculo={handleAddVehiculo}
              onAddMantenimiento={handleAddMantenimiento}
              onAddIncidencia={handleAddIncidencia}
              onUpdateMonitoreoStatus={handleUpdateMonitoreoStatus}
              searchTerm={searchTerm}
            />
          )}

          {currentTab === 'rutas' && (
            <RutasView
              rutas={db.rutas}
              onAddRuta={handleAddRuta}
              searchTerm={searchTerm}
            />
          )}

          {currentTab === 'incidencias' && (
            <IncidenciasView
              incidencias={db.incidencias}
              monitoreos={db.monitoreos}
              vehiculos={db.vehiculos}
              searchTerm={searchTerm}
              onAddIncidencia={handleAddIncidencia}
              onSolveIncident={handleSolveIncident}
            />
          )}

          {currentTab === 'usuarios' && (
            <PersonalView
              personales={db.personales}
              modulos={db.modulos}
              permisos_modulo={db.permisos_modulo}
              currentUser={currentUser}
              onAddPersonal={handleAddPersonal}
              onEditPersonal={handleEditPersonal}
              onToggleStatus={handleToggleStatus}
              onDeletePersonal={handleDeletePersonal}
              searchTerm={searchTerm}
            />
          )}

          {currentTab === 'ajustes' && (
            <div className="bg-surface-container border border-outline-variant p-6 rounded-xl max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-bold font-sans">Ajustes del Sistema</h3>
              <p className="text-xs text-on-surface-variant font-medium">Control de bases de datos simétrica y restauración de valores de fábrica.</p>
              
              <div className="pt-4 border-t border-outline-variant space-y-3">
                <button
                  onClick={() => {
                    if (confirm('¿Seguro que desea resetear la base de datos a los valores de fábrica de Petro Mapi SAC? Se perderán los registros creados.')) {
                      resetDB();
                      setDb(getDB());
                      alert('Base de Datos restaurada.');
                    }
                  }}
                  className="bg-error/15 hover:bg-error/25 text-error px-4 py-2 rounded text-xs font-bold uppercase transition-all"
                >
                  Restaurar Base de Datos Original
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* GLOBAL PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-sans text-sm font-black text-slate-100 uppercase tracking-wider">Mi Perfil de Usuario</h3>
                <p className="text-[10px] text-slate-400 font-mono">Gestione sus credenciales de acceso personales.</p>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={profileNombre}
                  onChange={(e) => setProfileNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#10b981] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Usuario (Login ID)</label>
                  <input
                    type="text"
                    required
                    value={profileUsuario}
                    onChange={(e) => setProfileUsuario(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={profileCorreo}
                    onChange={(e) => setProfileCorreo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Contraseña de Acceso</label>
                <input
                  type="text"
                  required
                  value={profileContrasena}
                  onChange={(e) => setProfileContrasena(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#10b981] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Rol de Sistema (No Editable)</label>
                <div className="w-full bg-slate-950/60 border border-slate-850 rounded px-3 py-2 text-xs text-slate-400 font-mono">
                  {currentUser?.rol}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 -mx-5 -mb-5 bg-slate-950/60 p-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-3.5 py-1.5 uppercase text-slate-500 hover:text-slate-200 font-bold tracking-tight text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 uppercase bg-primary text-slate-950 font-black rounded hover:bg-[#6ee7b7] transition-all cursor-pointer text-xs"
                >
                  Actualizar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
