/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Personal } from '../types';
// @ts-ignore
import backgroundTruck from '../assets/images/heavy_duty_fleet_dusk_1781871049630.jpg';

interface LoginProps {
  onLoginSuccess: (user: Personal) => void;
  personales: Personal[];
}

export default function Login({ onLoginSuccess, personales }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const user = personales.find(
      (p) => p.usuario.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (!user) {
      triggerError('El operador ingresado no existe en los registros de Petro Mapi SAC.');
      return;
    }

    if (user.contrasena !== password) {
      triggerError('Código de seguridad / contraseña incorrecta. Intente nuevamente.');
      return;
    }

    if (user.estado !== 1) {
      triggerError('Esta cuenta se encuentra temporalmente INACTIVA. Póngase en contacto con el supervisor.');
      return;
    }

    onLoginSuccess(user);
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative select-none overflow-hidden font-sans">
      {/* Visual Ambient Grid and Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Double Frame Container */}
      <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10 backdrop-blur-md">
        
        {/* Left Informational Corporate Billboard Pane */}
        <div className="w-full md:w-1/2 relative bg-slate-950 flex flex-col justify-between p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800">
          {/* Background image overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={backgroundTruck} 
              alt="Heavy Duty Logistics Transport Background" 
              className="w-full h-full object-cover opacity-35"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
          </div>

          {/* Core Info Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
              <span className="font-sans text-lg font-black tracking-tighter text-[#eaeaea]">
                PETROMAPI<span className="text-[#a7f3d0] font-light">LOGISTICS</span>
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#a7f3d0] font-black italic">
              Sistemas de Control de Flota Pesada & Combustible
            </p>
          </div>

          <div className="relative z-10 mt-12 md:mt-0 space-y-4">
            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block mb-1">
                Monitoreo en Tiempo Real
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Acceso registrado y seguro para la administración de cisternas de tramo, alertas de incidencias, telemetría de despacho y control de personal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                <span className="block text-[8px] uppercase font-bold text-slate-500">RUC de Empresa</span>
                <span className="text-[11px] font-mono text-slate-300 font-bold block">20601234567</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                <span className="block text-[8px] uppercase font-bold text-slate-500">Servidor Activo</span>
                <span className="text-[11px] font-mono text-primary font-bold block">PETROMAPI_SECURE</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 text-[10px] text-slate-500 font-mono">
            Petro Mapi S.A.C. © Todos los derechos reservados.
          </div>
        </div>

        {/* Right Authentication Form Pane */}
        <div 
          id="login-card"
          className={`w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-slate-900/40 relative ${
            isShaking ? 'animate-shake border-rose-500 border rounded-r-lg bg-rose-500/5' : ''
          }`}
        >
          <div className="mb-6">
            <h2 className="text-lg font-extrabold tracking-tight text-white mb-1">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400 font-medium">Ingrese sus credenciales de seguridad asignadas.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border-l-3 border-[#f43f5e] text-rose-400 text-[11px] rounded flex gap-2 items-center select-none animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-base">error_outline</span>
              <p className="font-sans font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Usuario</label>
              <div className="relative">
                <span className="material-symbols-outlined text-sm absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">person</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-[#10b981] rounded pl-9 pr-4 py-2 text-slate-200 text-xs focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined text-sm absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-[#10b981] rounded pl-9 pr-4 py-2 text-slate-200 text-xs focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-slate-950 font-black text-xs uppercase tracking-wider rounded hover:bg-[#6ee7b7] active:scale-98 transition-all cursor-pointer font-sans duration-100"
            >
              Autenticar e Ingresar
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            SISTEMA PROTEGIDO © SECURE GATEWAY
          </div>
        </div>

      </div>
    </div>
  );
}

