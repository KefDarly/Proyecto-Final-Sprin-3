/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Personal, Modulo, PermisoModulo } from '../types';

interface PersonalViewProps {
  personales: Personal[];
  modulos: Modulo[];
  permisos_modulo: PermisoModulo[];
  currentUser: Personal | null;
  onAddPersonal: (p: Omit<Personal, 'id_personal'>, selectedModuleIds: number[]) => void;
  onEditPersonal: (id: number, updated: Partial<Personal>, selectedModuleIds?: number[]) => void;
  onToggleStatus: (id: number) => void;
  onDeletePersonal: (id: number) => void;
  searchTerm: string;
}

export default function PersonalView({
  personales,
  modulos,
  permisos_modulo,
  currentUser,
  onAddPersonal,
  onEditPersonal,
  onToggleStatus,
  onDeletePersonal,
  searchTerm
 }: PersonalViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('Petro2026');
  const [rol, setRol] = useState<string>('Supervisor de Control');
  const [selectedModules, setSelectedModules] = useState<number[]>([1, 4]);

  // Editing state
  const [editingWorker, setEditingWorker] = useState<Personal | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editUsuario, setEditUsuario] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editContrasena, setEditContrasena] = useState('');
  const [editRol, setEditRol] = useState('');
  const [editSelectedModules, setEditSelectedModules] = useState<number[]>([]);

  // Search filter
  const filtered = personales.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.nombre_completo.toLowerCase().includes(term) ||
      p.usuario.toLowerCase().includes(term) ||
      p.correo.toLowerCase().includes(term) ||
      p.rol.toLowerCase().includes(term)
    );
  });

  const handleToggleModule = (id: number) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleToggleEditModule = (id: number) => {
    if (editSelectedModules.includes(id)) {
      setEditSelectedModules(editSelectedModules.filter(m => m !== id));
    } else {
      setEditSelectedModules([...editSelectedModules, id]);
    }
  };

  const handleStartEdit = (p: Personal) => {
    setEditingWorker(p);
    setEditNombre(p.nombre_completo);
    setEditUsuario(p.usuario);
    setEditCorreo(p.correo);
    setEditContrasena(p.contrasena);
    setEditRol(p.rol);
    
    const currentModuleIds = permisos_modulo
      .filter((pm) => pm.id_personal === p.id_personal)
      .map((pm) => pm.id_modulo);
    setEditSelectedModules(currentModuleIds);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    if (!editNombre || !editUsuario || !editCorreo || !editContrasena) {
      alert('Por favor complete todos los datos.');
      return;
    }

    onEditPersonal(editingWorker.id_personal, {
      nombre_completo: editNombre,
      usuario: editUsuario.trim(),
      correo: editCorreo.trim(),
      contrasena: editContrasena,
      rol: editRol
    }, editSelectedModules);

    alert(`Ficha del trabajador ${editNombre} actualizada exitosamente.`);
    setEditingWorker(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !usuario || !correo || !contrasena) {
      alert('Por favor complete todos los datos.');
      return;
    }
    // Prevent duplicate usernames or emails
    const collisionUser = personales.some(p => p.usuario.toLowerCase() === usuario.trim().toLowerCase());
    if (collisionUser) {
      alert(`El nombre de usuario "${usuario}" ya se encuentra registrado. Pruebe otra combinación.`);
      return;
    }

    onAddPersonal({
      nombre_completo: nombre,
      usuario: usuario.trim(),
      correo: correo.trim(),
      contrasena,
      rol,
      estado: 1
    }, selectedModules);

    alert(`Operador logístico ${nombre} añadido exitosamente.`);
    
    // Reset forms
    setNombre('');
    setUsuario('');
    setCorreo('');
    setContrasena('Petro2026');
    setRol('Supervisor de Control');
    setSelectedModules([1, 4]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end select-none">
        <div>
          <h2 className="font-sans text-3xl font-black text-on-surface tracking-tight mb-1">Personal de Control</h2>
          <p className="text-xs text-on-surface-variant font-medium">
            Administración del personal técnico e inspectores de ruta. Configure credenciales y asigne accesos específicos.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary text-slate-950 font-black px-4 py-2.5 rounded flex items-center gap-2 hover:bg-[#6ee7b7] active:scale-95 transition-all shadow-lg text-xs"
        >
          <span className="material-symbols-outlined text-sm font-black text-slate-950">person_add</span>
          <span>Registrar Trabajador (nuevo)</span>
        </button>
      </div>

      {/* Grid of operators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => {
          // Find modules allowed for this user
          const userModuleIds = permisos_modulo.filter(pm => pm.id_personal === p.id_personal).map(pm => pm.id_modulo);
          const userModules = modulos.filter(m => userModuleIds.includes(m.id_modulo));
          const isAdmin = p.rol === 'Administrador' || p.rol === 'Administradores (Full Acceso)';
          const currentUserIsAdmin = currentUser?.rol === 'Administrador' || currentUser?.rol === 'Administradores (Full Acceso)';
          const canEditThisWorker = currentUserIsAdmin;

          return (
            <div
              key={p.id_personal}
              className={`bg-slate-900/90 border rounded p-4 flex flex-col justify-between transition-all duration-200 relative ${
                p.estado === 1
                  ? 'border-slate-800 hover:border-[#10b981]/50 shadow-md'
                  : 'border-rose-500/20 opacity-70 bg-slate-950'
              }`}
            >
              {/* Header card role */}
              <div>
                <div className="flex justify-between items-start mb-3 select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center font-bold text-xs text-[#10b981] font-mono tracking-wider">
                      {p.usuario.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-sans text-xs font-bold text-slate-100">{p.nombre_completo}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{p.correo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {canEditThisWorker && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="p-1 text-slate-500 hover:text-[#10b981] hover:bg-emerald-500/10 rounded transition-all cursor-pointer"
                        title="Editar Trabajador"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                    )}
                    {currentUser?.id_personal !== p.id_personal && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Está seguro que desea dar de BAJA definitiva al trabajador ${p.nombre_completo} del sistema?`)) {
                            onDeletePersonal(p.id_personal);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                        title="Eliminar Trabajador"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wide font-mono ${
                      isAdmin ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {p.rol.replace(' (Full Acceso)', '')}
                    </span>
                  </div>
                </div>

                {/* Modules panel list */}
                <div className="space-y-1.5 py-2.5 border-t border-b border-slate-800">
                  <p className="text-[8px] uppercase font-bold tracking-wider text-slate-500 mb-1 font-mono">Módulos Autorizados</p>
                  {isAdmin ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">shield</span>
                      TODOS (Acceso Maestro)
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {userModules.length === 0 ? (
                        <span className="text-[10px] text-slate-500 italic font-mono">Sin accesos asignados</span>
                      ) : (
                        userModules.map(m => (
                          <span key={m.id_modulo} className="bg-slate-950 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] font-medium font-mono">
                            {m.nombre_modulo}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle switch state details */}
              <div className="flex justify-between items-center mt-3 pt-1 select-none">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.estado === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
                    {p.estado === 1 ? 'Activo' : 'Suspendido'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStatus(p.id_personal)}
                  className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded transition-all active:scale-95 border ${
                    p.estado === 1
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                      : 'bg-[#10b981] text-slate-950 border-transparent hover:bg-[#6ee7b7]'
                  }`}
                >
                  {p.estado === 1 ? 'Suspender' : 'Activar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW PERSONAL FORM MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-sans text-sm font-black text-slate-100 uppercase tracking-wider">Registrar Trabajador (nuevo)</h3>
                <p className="text-[10px] text-slate-400 font-mono">Alta administrativa en el sistema de flota Petro Mapi S.A.C.</p>
              </div>
              <button 
                onClick={() => setShowAdd(false)} 
                className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nombre Completo del Colaborador</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Kefren Chuquitapa Flores"
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#10b981] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Usuario (ID Login)</label>
                  <input
                    type="text"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Ej. kchuqui"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="mail@petromapi.com"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Contraseña de Acceso</label>
                  <input
                    type="text"
                    required
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">ROL ASIGNADO OPERATIVO</label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#10b981] transition-all cursor-pointer"
                  >
                    <option value="Administradores (Full Acceso)">Administradores (Full Acceso)</option>
                    <option value="Supervisor de Control">Supervisor de Control</option>
                    <option value="Controlador de Mando (Despachador)">Controlador de Mando (Despachador)</option>
                    <option value="Conductor de Ruta (Chofer de unidad)">Conductor de Ruta (Chofer de unidad)</option>
                  </select>
                </div>
              </div>

              {/* Modules selection */}
              {rol !== 'Administradores (Full Acceso)' && rol !== 'Administrador' && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Asignar Módulos Autorizados</p>
                  <div className="grid grid-cols-2 gap-2">
                    {modulos.map(m => (
                      <label key={m.id_modulo} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(m.id_modulo)}
                          onChange={() => handleToggleModule(m.id_modulo)}
                          className="accent-[#10b981]"
                        />
                        <span className="text-[10px] text-slate-350 font-sans">{m.nombre_modulo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 -mx-5 -mb-5 bg-slate-950/60 p-4">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3.5 py-1.5 uppercase text-slate-500 hover:text-slate-200 font-bold tracking-tight text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 uppercase bg-primary text-slate-950 font-black rounded hover:bg-[#6ee7b7] transition-all cursor-pointer text-xs"
                >
                  Registrar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PERSONAL FORM MODAL */}
      {editingWorker && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-sans text-sm font-black text-slate-100 uppercase tracking-wider">Modificar Ficha de Trabajador</h3>
                <p className="text-[10px] text-slate-400 font-mono">Actualización de registros operacionales y accesos.</p>
              </div>
              <button 
                onClick={() => setEditingWorker(null)} 
                className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nombre Completo del Trabajador</label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  placeholder="Ej. Nombre Apellido"
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#10b981] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Usuario (ID Login)</label>
                  <input
                    type="text"
                    required
                    value={editUsuario}
                    onChange={(e) => setEditUsuario(e.target.value)}
                    placeholder="Ej. kchuqui"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={editCorreo}
                    onChange={(e) => setEditCorreo(e.target.value)}
                    placeholder="mail@petromapi.com"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Contraseña de Acceso</label>
                  <input
                    type="text"
                    required
                    value={editContrasena}
                    onChange={(e) => setEditContrasena(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Rol de Cuenta</label>
                  <select
                    value={editRol}
                    disabled={!(currentUser?.rol === 'Administrador' || currentUser?.rol === 'Administradores (Full Acceso)')}
                    onChange={(e) => setEditRol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#10b981] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Administradores (Full Acceso)">Administradores (Full Acceso)</option>
                    <option value="Supervisor de Control">Supervisor de Control</option>
                    <option value="Controlador de Mando (Despachador)">Controlador de Mando (Despachador)</option>
                    <option value="Conductor de Ruta (Chofer de unidad)">Conductor de Ruta (Chofer de unidad)</option>
                  </select>
                </div>
              </div>

              {/* Modules selection */}
              {editRol !== 'Administradores (Full Acceso)' && editRol !== 'Administrador' && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Asignar Módulos Autorizados</p>
                  <div className="grid grid-cols-2 gap-2">
                    {modulos.map(m => {
                      const isDisabled = !(currentUser?.rol === 'Administrador' || currentUser?.rol === 'Administradores (Full Acceso)');
                      return (
                        <label key={m.id_modulo} className={`flex items-center gap-2 p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded select-none ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            checked={editSelectedModules.includes(m.id_modulo)}
                            disabled={isDisabled}
                            onChange={() => handleToggleEditModule(m.id_modulo)}
                            className="accent-[#10b981]"
                          />
                          <span className="text-[10px] text-slate-350 font-sans">{m.nombre_modulo}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 -mx-5 -mb-5 bg-slate-950/60 p-4">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-3.5 py-1.5 uppercase text-slate-500 hover:text-slate-200 font-bold tracking-tight text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 uppercase bg-primary text-slate-950 font-black rounded hover:bg-[#6ee7b7] transition-all cursor-pointer text-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
