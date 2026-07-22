'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OtpInput from '../../../components/auth/otp-input';
import Swal from 'sweetalert2';
import { Shield, Loader2, ArrowLeft, RefreshCw, BarChart3, Truck, Globe, Warehouse, Package, TrendingUp, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const maskEmail = (email: string | null) => {
  if (!email) return 'tu correo';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  const visiblePart = localPart.slice(0, 2);
  return `${visiblePart}****@${domain}`;
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setTempToken(sessionStorage.getItem('otp_temp_token'));
    setOtpEmail(sessionStorage.getItem('otp_email'));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!tempToken) {
      Swal.fire({ title: 'Sesion expirada', text: 'Volve a iniciar sesion', icon: 'warning', confirmButtonColor: '#dc2626' });
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCooldown(60);
        Swal.fire({
          title: 'Codigo reenviado',
          text: 'Revisa tu correo electronico.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ title: 'Error', text: data.message || 'No se pudo reenviar el codigo', icon: 'error', confirmButtonColor: '#dc2626' });
      }
    } catch {
      Swal.fire({ title: 'Error', text: 'No se pudo conectar con el servidor', icon: 'error', confirmButtonColor: '#dc2626' });
    }
  }, [tempToken, router]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      Swal.fire({ title: 'Error', text: 'Ingresa el código de 6 dígitos', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    if (!tempToken) {
      Swal.fire({ title: 'Sesión expirada', text: 'Volvé a iniciar sesión', icon: 'warning', confirmButtonColor: '#dc2626' });
      router.push('/login');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otpCode }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setSuccess(true);
        sessionStorage.removeItem('otp_temp_token');
        sessionStorage.removeItem('otp_email');
        // Esperar 1.5 segundos para mostrar la animación antes de navegar
        setTimeout(() => {
          window.location.assign('/dashboard');
        }, 1500);
      } else {
        Swal.fire({ title: 'Código incorrecto', text: data.message || 'Verifica el código e intenta de nuevo', icon: 'error', confirmButtonColor: '#dc2626' });
        setVerifying(false);
      }
    } catch {
      Swal.fire({ title: 'Error', text: 'No se pudo verificar. Intenta de nuevo.', icon: 'error', confirmButtonColor: '#dc2626' });
      setVerifying(false);
    }
  };

  const features = [
    { icon: BarChart3, label: 'KPIs en Tiempo Real', desc: 'Monitorea indicadores clave de desempeño logístico al instante.' },
    { icon: Truck, label: 'Gestión de Transporte', desc: 'Control total de flotas, conductores y costos operativos.' },
    { icon: Warehouse, label: 'Inventarios Inteligentes', desc: 'Seguimiento preciso de stock, movimientos y auditorías.' },
    { icon: Globe, label: 'Comercio Exterior', desc: 'Importaciones y exportaciones con análisis de costos unitarios.' },
    { icon: Package, label: 'Órdenes de Compra', desc: 'Aprobaciones, proveedores y certificaciones integradas.' },
    { icon: TrendingUp, label: 'Reportes Ejecutivos', desc: 'Descarga informes profesionales en PDF y Excel.' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Sección izquierda — Info del sistema */}
      <div className="relative flex-1 bg-slate-900 flex items-center justify-center px-8 py-10 lg:px-12 xl:px-16 lg:py-0 min-h-[50vh] lg:min-h-screen">
        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 w-full max-w-lg">
          {/* Logo / Marca */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white tracking-tight">BI Logístico</h2>
              <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">SCILIP</p>
            </div>
          </div>

          {/* Titular */}
          <h1 className="text-2xl lg:text-[1.75rem] xl:text-3xl font-bold text-white leading-snug mb-3">
            Inteligencia de Negocio para tu Cadena de Suministro
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-md">
            Centraliza la gestión logística de tu empresa en una sola plataforma.
            Desde inventarios hasta comercio exterior, todo con datos claros y decisiones rápidas.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/[0.08] hover:bg-white/10 transition-colors"
                >
                  <div className="h-7 w-7 rounded-md bg-indigo-600/20 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-indigo-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white">{f.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats footer */}
          <div className="mt-8 flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-slate-300">Seguridad CASL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] text-slate-300">Datos en Tiempo Real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección derecha — Verify OTP */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-sm">
          {/* Header always visible */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Verificación 2FA</h1>
            <p className="text-sm text-gray-500 mt-2">
              Ingresa el código de 6 dígitos enviado a<br />
              <span className="font-semibold text-gray-700">{maskEmail(otpEmail)}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 min-h-[300px] relative flex flex-col justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <OtpInput value={otpCode} onChange={setOtpCode} disabled={verifying} />

                  <button
                    onClick={handleVerify}
                    disabled={otpCode.length !== 6 || verifying}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {verifying ? 'Verificando...' : 'Verificar'}
                  </button>

                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || verifying}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
                    {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
                  </button>

                  <button
                    onClick={() => router.push('/login')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver al login
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-4 py-4"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-500"
                  >
                    <motion.circle
                      cx="12"
                      cy="12"
                      r="10"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M8 12l3 3 5-6"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
                    />
                  </motion.svg>
                  <p className="text-lg font-bold text-gray-900">¡Verificación exitosa!</p>
                  <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer SCILIP */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Truck className="h-4 w-4 text-gray-300" />
            <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
              SCILIP — Business Intelligence Logístico
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
