'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Save, Loader2, MapPin } from 'lucide-react';
import { trpc } from '../../lib/trpc/react';
import Swal from 'sweetalert2';

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

  const handleSave = async () => {
    if (!form.legalName.trim()) {
      Swal.fire({ title: 'Error', text: 'La razón social es obligatoria', icon: 'error', confirmButtonColor: '#dc2626' });
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
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Datos de la Empresa</h3>
          <p className="text-xs text-gray-500">Información legal y de contacto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Razón Social *</label>
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
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Teléfono</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="+57 601 000 0000" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">País</label>
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="Colombia" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Dirección</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50" placeholder="Dirección completa" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-900 mb-3">Configuración General</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Moneda</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              <option value="COP">COP - Peso Colombiano</option>
              <option value="USD">USD - Dólar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="MXN">MXN - Peso Mexicano</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Zona Horaria</label>
            <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              <option value="America/Bogota">Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Santiago">Santiago (GMT-4)</option>
              <option value="America/Lima">Lima (GMT-5)</option>
              <option value="America/Caracas">Caracas (GMT-4)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Año Fiscal Inicia</label>
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
          {saving ? 'Guardando…' : 'Guardar Empresa'}
        </button>
      </div>
    </div>
  );
}
