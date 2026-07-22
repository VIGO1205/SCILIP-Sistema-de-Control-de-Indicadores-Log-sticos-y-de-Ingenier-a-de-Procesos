'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X } from 'lucide-react';
import { trpc } from '../../lib/trpc/react';
import { AddressPickerModal } from '../ui/address-picker-modal';
import Swal from 'sweetalert2';

interface BranchForm {
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  isMain: boolean;
}

const emptyForm: BranchForm = { code: '', name: '', address: '', city: '', phone: '', email: '', isMain: false };

export default function BranchManager() {
  const { data: branches, refetch } = trpc.company.listBranches.useQuery();
  const createMutation = trpc.company.createBranch.useMutation({ onSuccess: () => { refetch(); setForm(emptyForm); setEditing(null); Swal.fire({ title: 'Sucursal creada', icon: 'success', timer: 1500, showConfirmButton: false }); } });
  const updateMutation = trpc.company.updateBranch.useMutation({ onSuccess: () => { refetch(); setForm(emptyForm); setEditing(null); Swal.fire({ title: 'Sucursal actualizada', icon: 'success', timer: 1500, showConfirmButton: false }); } });
  const deleteMutation = trpc.company.deleteBranch.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      Swal.fire({ title: 'Error', text: 'Código y nombre son obligatorios', icon: 'error', confirmButtonColor: '#dc2626' });
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
    setForm({ code: branch.code, name: branch.name, address: branch.address || '', city: branch.city || '', phone: branch.phone || '', email: branch.email || '', isMain: branch.isMain });
    setEditing(branch.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({ title: `Eliminar "${name}"?`, text: 'Esta acción no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar' });
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
            <h3 className="text-sm font-bold text-gray-900">Sucursales</h3>
            <p className="text-xs text-gray-500">{branches?.length || 0} registradas</p>
          </div>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors">
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
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
            <p className="text-xs font-bold text-gray-900">{editing ? 'Editar Sucursal' : 'Nueva Sucursal'}</p>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Código *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="BOG-01" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="Sede Bogotá" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Ciudad</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="Bogotá" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Teléfono</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400" placeholder="+57 601 000 0000" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Dirección</label>
              <div className="flex">
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400"
                  placeholder="Calle 123 #45-67"
                />
                <button
                  type="button"
                  onClick={() => setIsAddressPickerOpen(true)}
                  className="px-3 rounded-r-lg border border-l-0 border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-green-600 transition-colors shrink-0 flex items-center justify-center"
                  title="Buscar en mapa"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isMain} onChange={(e) => setForm({ ...form, isMain: e.target.checked })} className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
            <span className="text-xs text-gray-700 font-medium">Sucursal principal</span>
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(!branches || branches.length === 0) ? (
          <div className="py-6 text-center border border-dashed border-gray-200 rounded-xl">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No hay sucursales registradas</p>
          </div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900">{branch.name}</p>
                    {branch.isMain && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[11px] text-gray-500">{branch.code} {branch.city ? `· ${branch.city}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(branch)} className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                {!branch.isMain && (
                  <button onClick={() => handleDelete(branch.id, branch.name)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
