'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, Save, Loader2, MapPin, Search, X, ChevronDown } from 'lucide-react';
import { trpc } from '../../lib/trpc/react';
import { AddressPickerModal } from '../ui/address-picker-modal';
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

interface ComboboxProps {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}

function Combobox({ value, options, placeholder, onChange }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 cursor-pointer hover:border-gray-300 transition-colors"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">Sin resultados</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${opt === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompanySettings() {
  const { data: company, refetch } = trpc.company.getMyCompany.useQuery();
  const updateMutation = trpc.company.updateCompany.useMutation({
    onSuccess: () => {
      refetch();
      Swal.fire({ title: 'Guardado', text: 'Datos de la empresa actualizados.', icon: 'success', timer: 1500, showConfirmButton: false });
    },
    onError: (err: any) => Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#dc2626' }),
  });

  const [form, setForm] = useState({
    legalName: '', tradeName: '', taxId: '', email: '', phone: '', address: '', city: '', country: '', website: '', currency: 'COP', timezone: 'America/Bogota', fiscalYearStart: 1,
  });
  const [saving, setSaving] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        legalName: company.legalName || '',
        tradeName: company.tradeName || '',
        taxId: company.taxId || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        country: company.country || '',
        website: company.website || '',
        currency: (company as any).currency || 'COP',
        timezone: (company as any).timezone || 'America/Bogota',
        fiscalYearStart: (company as any).fiscalYearStart || 1,
      });
    }
  }, [company]);

  const availableCities = useMemo(() => {
    if (!form.country) return [];
    return COUNTRIES_CITIES[form.country] || [];
  }, [form.country]);

  const handleSave = async () => {
    if (!form.legalName.trim()) {
      Swal.fire({ title: 'Error', text: 'La razon social es obligatoria', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    setSaving(true);
    try {
      await updateMutation.mutateAsync({ id: company?.id, ...form });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <AddressPickerModal
        isOpen={isAddressPickerOpen}
        onClose={() => setIsAddressPickerOpen(false)}
        initialAddress={form.address}
        onSelect={(address) => {
          setForm({ ...form, address });
          setIsAddressPickerOpen(false);
        }}
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Datos de la Empresa</h3>
          <p className="text-xs text-gray-500">Informacion legal y de contacto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Razon Social *</label>
          <input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="Nombre legal de la empresa" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Nombre Comercial</label>
          <input value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="Nombre que usa la empresa" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">NIT/RIF</label>
          <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="900.000.000-0" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="empresa@email.com" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Telefono</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="+57 601 000 0000" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Pais</label>
          <Combobox
            value={form.country}
            options={ALL_COUNTRIES}
            placeholder="Seleccionar pais..."
            onChange={(country) => setForm({ ...form, country, city: '' })}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Ciudad</label>
          <Combobox
            value={form.city}
            options={availableCities}
            placeholder={form.country ? 'Seleccionar ciudad...' : 'Primero selecciona un pais'}
            onChange={(city) => setForm({ ...form, city })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Direccion</label>
          <div className="flex">
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50"
              placeholder="Direccion completa"
            />
            <button
              type="button"
              onClick={() => setIsAddressPickerOpen(true)}
              className="px-3 rounded-r-lg border border-l-0 border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition-colors shrink-0 flex items-center justify-center"
              title="Buscar en mapa"
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-900 mb-3">Configuracion General</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Moneda</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              <option value="COP">COP - Peso Colombiano</option>
              <option value="USD">USD - Dolar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="MXN">MXN - Peso Mexicano</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Zona Horaria</label>
            <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              <option value="America/Bogota">Bogota (GMT-5)</option>
              <option value="America/Mexico_City">Ciudad de Mexico (GMT-6)</option>
              <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Santiago">Santiago (GMT-4)</option>
              <option value="America/Lima">Lima (GMT-5)</option>
              <option value="America/Caracas">Caracas (GMT-4)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Ano Fiscal Inicia</label>
            <select value={form.fiscalYearStart} onChange={(e) => setForm({ ...form, fiscalYearStart: parseInt(e.target.value) })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Guardando...' : 'Guardar Empresa'}
        </button>
      </div>
    </div>
  );
}
