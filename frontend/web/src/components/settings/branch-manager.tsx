'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X, Search, ChevronDown } from 'lucide-react';
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  React.useEffect(() => {
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
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm bg-white dark:bg-dark-tremor-background cursor-pointer hover:border-gray-300 transition-colors"
      >
        <span className={value ? 'text-gray-900 dark:text-dark-tremor-content-strong' : 'text-gray-400 dark:text-dark-tremor-content-subtle'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-tremor-background border border-gray-200 dark:border-dark-tremor-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-dark-tremor-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-dark-tremor-content-subtle" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-tremor-content-subtle hover:text-gray-600 dark:hover:text-dark-tremor-content"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 dark:text-dark-tremor-content-subtle text-center">Sin resultados</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition-colors ${opt === value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 dark:text-dark-tremor-content'}`}
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

interface BranchForm {
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  isMain: boolean;
}

const emptyForm: BranchForm = { code: '', name: '', address: '', city: '', country: '', phone: '', email: '', isMain: false };

export default function BranchManager() {
  const { data: branches, refetch } = trpc.company.listBranches.useQuery();
  const { data: company } = trpc.company.getMyCompany.useQuery();
  const createMutation = trpc.company.createBranch.useMutation({ onSuccess: () => { refetch(); setForm(emptyForm); setEditing(null); Swal.fire({ title: 'Sucursal creada', icon: 'success', timer: 1500, showConfirmButton: false }); } });
  const updateMutation = trpc.company.updateBranch.useMutation({ onSuccess: () => { refetch(); setForm(emptyForm); setEditing(null); Swal.fire({ title: 'Sucursal actualizada', icon: 'success', timer: 1500, showConfirmButton: false }); } });
  const deleteMutation = trpc.company.deleteBranch.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);

  const availableCities = useMemo(() => {
    if (!form.country) return [];
    return COUNTRIES_CITIES[form.country] || [];
  }, [form.country]);

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      Swal.fire({ title: 'Error', text: 'Codigo y nombre son obligatorios', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing, ...form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (branch: any) => {
    setForm({ code: branch.code, name: branch.name, address: branch.address || '', city: branch.city || '', country: branch.country || '', phone: branch.phone || '', email: branch.email || '', isMain: branch.isMain });
    setEditing(branch.id);
    setShowForm(true);
  };

  const handleOpenNew = () => {
    const companyCountry = (company as any)?.country || '';
    setForm({ ...emptyForm, country: companyCountry });
    setEditing(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({ title: `Eliminar "${name}"?`, text: 'Esta accion no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar' });
    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#dc2626' });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Sucursales</h3>
            <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">{branches?.length || 0} registradas</p>
          </div>
        </div>
        <button onClick={handleOpenNew} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800/30 transition-colors">
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>

      {showForm && (
        <div className="border border-gray-200 dark:border-dark-tremor-border rounded-xl p-4 bg-gray-50/50 dark:bg-dark-tremor-background-subtle/50 space-y-3">
          <AddressPickerModal
            isOpen={isAddressPickerOpen}
            onClose={() => setIsAddressPickerOpen(false)}
            initialAddress={form.address}
            onSelect={(address) => {
              setForm({ ...form, address });
              setIsAddressPickerOpen(false);
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong">{editing ? 'Editar Sucursal' : 'Nueva Sucursal'}</p>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }} className="text-gray-400 dark:text-dark-tremor-content-subtle hover:text-gray-600 dark:hover:text-dark-tremor-content"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content uppercase mb-1">Codigo *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm bg-white dark:bg-dark-tremor-background focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="BOG-01" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content uppercase mb-1">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm bg-white dark:bg-dark-tremor-background focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="Sede Bogota" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content uppercase mb-1">Pais</label>
              <Combobox
                value={form.country}
                options={ALL_COUNTRIES}
                placeholder="Seleccionar pais..."
                onChange={(country) => setForm({ ...form, country, city: '' })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content uppercase mb-1">Ciudad</label>
              <Combobox
                value={form.city}
                options={availableCities}
                placeholder={form.country ? 'Seleccionar ciudad...' : 'Primero selecciona un pais'}
                onChange={(city) => setForm({ ...form, city })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content uppercase mb-1">Telefono</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm bg-white dark:bg-dark-tremor-background focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="+57 601 000 0000" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content uppercase mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm bg-white dark:bg-dark-tremor-background focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="sucursal@email.com" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content uppercase mb-1">Direccion</label>
              <div className="flex">
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-l-lg text-sm bg-white dark:bg-dark-tremor-background focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400"
                  placeholder="Calle 123 #45-67"
                />
                <button
                  type="button"
                  onClick={() => setIsAddressPickerOpen(true)}
                  className="px-3 rounded-r-lg border border-l-0 border-gray-200 dark:border-dark-tremor-border bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 dark:hover:bg-dark-tremor-background-subtle text-gray-600 dark:text-dark-tremor-content hover:text-green-600 transition-colors shrink-0 flex items-center justify-center"
                  title="Buscar en mapa"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isMain} onChange={(e) => setForm({ ...form, isMain: e.target.checked })} className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
            <span className="text-xs text-gray-700 dark:text-dark-tremor-content font-medium">Sucursal principal</span>
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-600 dark:text-dark-tremor-content bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 dark:hover:bg-dark-tremor-background-subtle">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(!branches || branches.length === 0) ? (
          <div className="py-6 text-center border border-dashed border-gray-200 dark:border-dark-tremor-border rounded-xl">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">No hay sucursales registradas</p>
          </div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-dark-tremor-border hover:border-gray-200 transition-colors bg-white dark:bg-dark-tremor-background">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong">{branch.name}</p>
                    {branch.isMain && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-dark-tremor-content-subtle">{branch.code} {branch.city ? `\u00B7 ${branch.city}` : ''} {branch.country ? `\u00B7 ${branch.country}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(branch)} className="p-1.5 rounded-md text-gray-400 dark:text-dark-tremor-content-subtle hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                {!branch.isMain && (
                  <button onClick={() => handleDelete(branch.id, branch.name)} className="p-1.5 rounded-md text-gray-400 dark:text-dark-tremor-content-subtle hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
