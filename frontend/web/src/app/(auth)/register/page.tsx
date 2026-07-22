'use client';

import React, { useState, useMemo } from 'react';
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
  ArrowLeft,
  BarChart3,
  Truck,
  Globe,
  Warehouse,
  Package,
  TrendingUp,
  ShieldCheck,
  Zap,
  Building2,
  MapPin,
  Phone,
} from 'lucide-react';
import Swal from 'sweetalert2';

const COUNTRIES_CITIES: Record<string, string[]> = {
  Argentina: ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'Tucuman', 'La Plata', 'Mar del Plata', 'Salta'],
  Bolivia: ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'Sucre', 'Oruro', 'Potosi', 'Tarija', 'El Alto'],
  Brasil: ['Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Curitiba', 'Manaus'],
  Chile: ['Santiago', 'Valparaiso', 'Concepcion', 'Antofagasta', 'Vina del Mar', 'Temuco', 'Rancagua', 'Iquique'],
  Colombia: ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Cucuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibague'],
  'Costa Rica': ['San Jose', 'Alajuela', 'Cartago', 'Heredia', 'Limon', 'Puntarenas'],
  Cuba: ['La Habana', 'Santiago de Cuba', 'Camaguey', 'Holguin', 'Santa Clara', 'Guantanamo'],
  Ecuador: ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Machala', 'Duran', 'Manta', 'Portoviejo'],
  'El Salvador': ['San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Santa Tecla', 'Apopa'],
  Espana: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Malaga', 'Murcia', 'Palma'],
  'Estados Unidos': ['Nueva York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Antonio', 'Miami', 'Dallas'],
  Guatemala: ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla', 'Petapa'],
  Honduras: ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso', 'Comayagua'],
  Mexico: ['Ciudad de Mexico', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Leon', 'Merida', 'Cancun', 'Queretaro', 'Toluca'],
  Nicaragua: ['Managua', 'Leon', 'Masaya', 'Matagalpa', 'Chinandega', 'Esteli'],
  Panama: ['Ciudad de Panama', 'San Miguelito', 'Colon', 'David', 'La Chorrera', 'Arraijan'],
  Paraguay: ['Asuncion', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiata', 'Lambare'],
  Peru: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Iquitos', 'Cusco', 'Piura', 'Huancayo'],
  'Republica Dominicana': ['Santo Domingo', 'Santiago de los Caballeros', 'San Pedro de Macoris', 'La Romana', 'Puerto Plata'],
  Uruguay: ['Montevideo', 'Salto', 'Paysandu', 'Las Piedras', 'Rivera', 'Maldonado', 'Ciudad de la Costa'],
  Venezuela: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'Maturin', 'Barcelona'],
};

const ALL_COUNTRIES = Object.keys(COUNTRIES_CITIES).sort();

const registerSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email invalido').min(1, 'El email es obligatorio'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  companyName: z.string().min(2, 'El nombre de la empresa es obligatorio'),
  taxId: z.string().min(3, 'El NIT es obligatorio'),
  country: z.string().min(1, 'Selecciona un pais'),
  city: z.string().min(1, 'Selecciona una ciudad'),
  address: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Email invalido').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type Tab = 'account' | 'company';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { country: '', city: '' },
  });

  const selectedCountry = watch('country');
  const selectedCity = watch('city');

  const filteredCountries = useMemo(() => {
    if (!countryQuery.trim()) return ALL_COUNTRIES;
    const q = countryQuery.toLowerCase();
    return ALL_COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [countryQuery]);

  const availableCities = useMemo(() => {
    if (!selectedCountry) return [];
    const cities = COUNTRIES_CITIES[selectedCountry] || [];
    if (!cityQuery.trim()) return cities;
    const q = cityQuery.toLowerCase();
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [selectedCountry, cityQuery]);

  const handleNext = async () => {
    const valid = await trigger(['fullName', 'email', 'password', 'confirmPassword']);
    if (valid) {
      setActiveTab('company');
      setError(null);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          companyName: data.companyName,
          taxId: data.taxId,
          country: data.country,
          city: data.city,
          address: data.address || undefined,
          companyPhone: data.companyPhone || undefined,
          companyEmail: data.companyEmail || undefined,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.message || 'No se pudo registrar la cuenta');
      }
      setSuccess(true);
      Swal.fire({
        title: '¡Cuenta creada!',
        text: 'Tu empresa y cuenta fueron configuradas exitosamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push('/dashboard');
      });
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: BarChart3, label: 'KPIs en Tiempo Real', desc: 'Monitorea indicadores clave de desempeno logistico al instante.' },
    { icon: Truck, label: 'Gestion de Transporte', desc: 'Control total de flotas, conductores y costos operativos.' },
    { icon: Warehouse, label: 'Inventarios Inteligentes', desc: 'Seguimiento preciso de stock, movimientos y auditorias.' },
    { icon: Globe, label: 'Comercio Exterior', desc: 'Importaciones y exportaciones con analisis de costos unitarios.' },
    { icon: Package, label: 'Ordenes de Compra', desc: 'Aprobaciones, proveedores y certificaciones integradas.' },
    { icon: TrendingUp, label: 'Reportes Ejecutivos', desc: 'Descarga informes profesionales en PDF y Excel.' },
  ];

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-5">
            <Building2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
          <p className="text-sm text-gray-500 mb-6">Tu cuenta y empresa fueron creadas. Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Seccion izquierda — Info del sistema */}
      <div className="relative flex-1 bg-slate-900 flex items-center justify-center px-8 py-10 lg:px-12 xl:px-16 lg:py-0 hidden lg:flex">
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
              <h2 className="text-xl font-bold text-white tracking-tight">BI Logistico</h2>
              <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">SCILIP</p>
            </div>
          </div>

          <h1 className="text-2xl lg:text-[1.75rem] xl:text-3xl font-bold text-white leading-snug mb-3">
            Inteligencia de Negocio para tu Cadena de Suministro
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-md">
            Centraliza la gestion logistica de tu empresa en una sola plataforma.
            Desde inventarios hasta comercio exterior, todo con datos claros y decisiones rapidas.
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

      {/* Seccion derecha — Registro */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-6 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-indigo-600 mb-3">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="mt-1 text-sm text-gray-500">Registra tu empresa y comienza a usar SCILIP</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-5 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${
                activeTab === 'account'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              1. Tus Datos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${
                activeTab === 'company'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              2. Tu Empresa
            </button>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
                <span className="mt-0.5 h-3.5 w-3.5 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-bold text-red-600 shrink-0">!</span>
                {error}
              </div>
            )}

            {/* === TAB 1: TUS DATOS === */}
            {activeTab === 'account' && (
              <div className="space-y-3.5">
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
                      placeholder="Juan Perez"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Correo electronico
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
                    Contrasena
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
                    Confirmar contrasena
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
              </div>
            )}

            {/* === TAB 2: TU EMPRESA === */}
            {activeTab === 'company' && (
              <div className="space-y-3.5">
                {/* Nombre Empresa */}
                <div>
                  <label htmlFor="companyName" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Nombre de la empresa
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                      id="companyName"
                      type="text"
                      {...register('companyName')}
                      className={`block w-full pl-9 pr-3 py-2 border ${
                        errors.companyName ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50`}
                      placeholder="Mi Empresa S.A.S"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.companyName.message}</p>
                  )}
                </div>

                {/* NIT */}
                <div>
                  <label htmlFor="taxId" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    NIT / RIF
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                      id="taxId"
                      type="text"
                      {...register('taxId')}
                      className={`block w-full pl-9 pr-3 py-2 border ${
                        errors.taxId ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50`}
                      placeholder="900123456-7"
                    />
                  </div>
                  {errors.taxId && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.taxId.message}</p>
                  )}
                </div>

                {/* Pais + Ciudad */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Pais
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => { setCountryOpen(!countryOpen); setCountryQuery(''); }}
                        className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:border-gray-300"
                      >
                        <span className={selectedCountry ? 'text-gray-900' : 'text-gray-400'}>{selectedCountry || 'Seleccionar...'}</span>
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      {countryOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              type="text"
                              value={countryQuery}
                              onChange={(e) => setCountryQuery(e.target.value)}
                              placeholder="Buscar..."
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCountries.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setValue('country', c, { shouldValidate: true });
                                  setValue('city', '', { shouldValidate: true });
                                  setCountryOpen(false);
                                  setCountryQuery('');
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${c === selectedCountry ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.country && (
                      <p className="mt-1 text-[11px] text-red-600">{errors.country.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Ciudad
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => { if (selectedCountry) { setCityOpen(!cityOpen); setCityQuery(''); } }}
                        className={`flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white ${selectedCountry ? 'cursor-pointer hover:border-gray-300' : 'bg-gray-50 cursor-not-allowed'}`}
                      >
                        <span className={selectedCity ? 'text-gray-900' : 'text-gray-400'}>{selectedCity || (selectedCountry ? 'Seleccionar...' : 'Primero un pais')}</span>
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      {cityOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <input
                              type="text"
                              value={cityQuery}
                              onChange={(e) => setCityQuery(e.target.value)}
                              placeholder="Buscar..."
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {availableCities.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setValue('city', c, { shouldValidate: true });
                                  setCityOpen(false);
                                  setCityQuery('');
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${c === selectedCity ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-[11px] text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                {/* Direccion */}
                <div>
                  <label htmlFor="address" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Direccion <span className="text-gray-400">(opcional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                      id="address"
                      type="text"
                      {...register('address')}
                      className="block w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-indigo-400 focus:ring-indigo-50 rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50"
                      placeholder="Calle 123 #45-67"
                    />
                  </div>
                </div>

                {/* Telefono + Email empresa */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="companyPhone" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Telefono <span className="text-gray-400">(opc.)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </span>
                      <input
                        id="companyPhone"
                        type="tel"
                        {...register('companyPhone')}
                        className="block w-full pl-9 pr-3 py-2 border border-gray-200 focus:border-indigo-400 focus:ring-indigo-50 rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50"
                        placeholder="+57 601 000 0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="companyEmail" className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Email empresa <span className="text-gray-400">(opc.)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </span>
                      <input
                        id="companyEmail"
                        type="email"
                        {...register('companyEmail')}
                        className={`block w-full pl-9 pr-3 py-2 border ${
                          errors.companyEmail ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
                        } rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 bg-gray-50/50`}
                        placeholder="empresa@email.com"
                      />
                    </div>
                    {errors.companyEmail && (
                      <p className="mt-1 text-[11px] text-red-600">{errors.companyEmail.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {activeTab === 'account' ? (
              <button
                type="button"
                onClick={handleNext}
                className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
              >
                Siguiente
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atras
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      Crear Cuenta y Empresa
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Login link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tenes cuenta?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 transition-colors"
              >
                Inicia sesion
              </Link>
            </p>
          </div>

          {/* Footer SCILIP */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Truck className="h-4 w-4 text-gray-300" />
            <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
              SCILIP — Business Intelligence Logistico
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
