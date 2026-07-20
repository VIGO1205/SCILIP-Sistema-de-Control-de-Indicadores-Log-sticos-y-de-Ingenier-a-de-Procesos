'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  BarChart3,
  Truck,
  Globe,
  Warehouse,
  Package,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import Swal from 'sweetalert2';

const registerSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.message || 'No se pudo registrar la cuenta');
      }
      setSuccess(true);
      Swal.fire({
        title: '¡Cuenta creada!',
        text: 'Tu cuenta fue registrada exitosamente. Iniciá sesión para continuar.',
        icon: 'success',
        confirmButtonText: 'Ir al Login',
        confirmButtonColor: '#4f46e5',
      }).then(() => {
        router.push('/login');
      });
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
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

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
          <p className="text-sm text-gray-500 mb-6">Tu cuenta fue creada. Ahora podés iniciar sesión.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Ir al Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Sección izquierda — Info del sistema */}
      <div className="relative flex-1 bg-slate-900 flex items-center justify-center px-8 py-10 lg:px-12 xl:px-16 lg:py-0 min-h-[50vh] lg:min-h-screen">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white tracking-tight">BI Logístico</h2>
              <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">SCILIP</p>
            </div>
          </div>

          <h1 className="text-2xl lg:text-[1.75rem] xl:text-3xl font-bold text-white leading-snug mb-3">
            Inteligencia de Negocio para tu Cadena de Suministro
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-md">
            Centraliza la gestión logística de tu empresa en una sola plataforma.
            Desde inventarios hasta comercio exterior, todo con datos claros y decisiones rápidas.
          </p>

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

      {/* Sección derecha — Registro */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-600 mb-4">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="mt-1.5 text-sm text-gray-500">Completá el formulario para registrarte</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
                <span className="mt-0.5 h-3.5 w-3.5 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-bold text-red-600 shrink-0">!</span>
                {error}
              </div>
            )}

            {/* Nombre */}
            <div>
              <label htmlFor="fullName" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  {...register('fullName')}
                  className={`block w-full pl-9 pr-3 py-2 border ${
                    errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                  } rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50`}
                  placeholder="Juan Pérez"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-600">{errors.fullName.message}</p>
              )}
            </div>

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
                  placeholder="tu@email.com"
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
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={`block w-full pl-9 pr-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                  } rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50`}
                  placeholder="••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando…
                </>
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tenés cuenta?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 transition-colors"
              >
                Iniciá sesión
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
