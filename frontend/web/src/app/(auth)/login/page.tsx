'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../components/providers/auth-provider';
import {
  Mail,
  Lock,
  ArrowRight,
  BarChart3,
  Truck,
  Globe,
  Warehouse,
  Package,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

function MailboxAnimation() {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
      {/* Mailbox base */}
      <svg className="w-4 h-4 text-indigo-300 absolute bottom-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" />
        <path d="M2 13h20" />
      </svg>
      {/* Animated Envelope */}
      <motion.svg
        className="w-3 h-3 text-white absolute"
        viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        initial={{ y: -10, opacity: 0, scale: 0.8 }}
        animate={{ y: [ -10, -2, 2 ], opacity: [0, 1, 0], scale: [0.8, 1, 0.7] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="white" />
        <polyline points="22,6 12,13 2,6" stroke="currentColor" fill="none" strokeWidth="2" />
      </motion.svg>
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@demo.local',
      password: 'demo123',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim(), password: data.password }),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Credenciales inválidas');
      }

      if (result.requiresOtp) {
        sessionStorage.setItem('otp_temp_token', result.tempToken);
        sessionStorage.setItem('otp_email', result.email);
        setSendingOtp(true);
        setTimeout(() => {
          window.location.assign('/verify-otp');
        }, 1500);
        return;
      }

      const from = searchParams.get('from') || '/dashboard';
      window.location.assign(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setSubmitting(false);
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

      {/* Sección derecha — Login */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-600 mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Bienvenido de Vuelta</h2>
            <p className="mt-1.5 text-sm text-gray-500">Ingresá tus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
                  <span className="mt-0.5 h-3.5 w-3.5 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-bold text-red-600 shrink-0">!</span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`block w-full pl-9 pr-3 py-2 border ${
                      errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                    } rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50`}
                    placeholder="admin@demo.local"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={`block w-full pl-9 pr-3 py-2 border ${
                      errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                    } rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50`}
                    placeholder="••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={submitting || sendingOtp}
                className="group relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                {sendingOtp ? (
                  <>
                    <MailboxAnimation />
                    Enviando código...
                  </>
                ) : submitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando…
                  </>
                ) : (
                  <>
                    Entrar al Sistema
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-medium">Demo</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Demo credentials */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Usuario:</span>
                <span className="font-mono text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">admin@demo.local</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500">Contraseña:</span>
                <span className="font-mono text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">demo123</span>
              </div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/register"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 transition-colors"
                >
                  Regístrate ahora
                </Link>
              </p>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="h-8 w-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
