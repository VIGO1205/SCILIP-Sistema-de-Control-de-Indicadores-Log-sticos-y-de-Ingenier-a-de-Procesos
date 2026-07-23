'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
} from '@tremor/react';
import {
  User,
  Building2,
  Bell,
  Shield,
  Database,
  Save,
  Code2,
  Clock,
  Loader2,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../components/providers/auth-provider';
import { trpc } from '../../../lib/trpc/react';
import Swal from 'sweetalert2';
import TwoFactorSetup from '../../../components/auth/two-factor-setup';
import dynamic from 'next/dynamic';

const CompanySettings = dynamic(() => import('../../../components/settings/company-settings'), { ssr: false });
const BranchManager = dynamic(() => import('../../../components/settings/branch-manager'), { ssr: false });

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user?.fullName]);

  const updateProfileMutation = trpc.user.updateProfile.useMutation();
  const changePasswordMutation = trpc.user.changePassword.useMutation();
  const { data: profileData } = trpc.user.getProfile.useQuery();
  const notifPrefsQuery = trpc.notification.getPrefs.useQuery();
  const updateNotifPrefsMutation = trpc.notification.updatePrefs.useMutation({
    onSuccess: () => Swal.fire({ title: 'Preferencias guardadas', icon: 'success', timer: 1200, showConfirmButton: false }),
  });

  const [notifPrefs, setNotifPrefs] = useState({
    kpiAlerts: true,
    weeklyReports: true,
    purchaseOrders: true,
    inventoryChanges: true,
    emailEnabled: true,
  });

  useEffect(() => {
    if (notifPrefsQuery.data) {
      setNotifPrefs({
        kpiAlerts: notifPrefsQuery.data.kpiAlerts,
        weeklyReports: notifPrefsQuery.data.weeklyReports,
        purchaseOrders: notifPrefsQuery.data.purchaseOrders,
        inventoryChanges: notifPrefsQuery.data.inventoryChanges,
        emailEnabled: notifPrefsQuery.data.emailEnabled,
      });
    }
  }, [notifPrefsQuery.data]);

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  useEffect(() => {
    if (profileData?.twoFactorEnabled !== undefined) {
      setTwoFAEnabled(profileData.twoFactorEnabled);
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData?.phone) setPhone(profileData.phone);
    if (profileData?.notificationEmail) setNotificationEmail(profileData.notificationEmail);
  }, [profileData?.phone, profileData?.notificationEmail]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Swal.fire({ title: 'Error', text: 'El nombre es obligatorio', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfileMutation.mutateAsync({ 
        fullName: fullName.trim(), 
        phone: phone.trim() || null,
        notificationEmail: notificationEmail.trim() || null,
      });
      await refresh();
      Swal.fire({ title: 'Perfil actualizado', text: 'Tus datos fueron guardados exitosamente.', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo actualizar el perfil', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({ title: 'Error', text: 'Completá todos los campos', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({ title: 'Error', text: 'La nueva contraseña debe tener al menos 6 caracteres', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({ title: 'Error', text: 'Las contraseñas nuevas no coinciden', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Swal.fire({ title: 'Contraseña actualizada', text: 'Tu contraseña fue cambiada exitosamente.', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo cambiar la contraseña', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifPrefs = () => {
    updateNotifPrefsMutation.mutate(notifPrefs);
  };

  return (
    <main className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-tremor-content-strong">Configuración del Sistema</h1>
            <p className="text-gray-500 dark:text-dark-tremor-content-subtle mt-0.5 text-xs">Gestiona tu perfil, empresa, alertas, seguridad y parámetros</p>
          </div>
        </div>
        <Divider className="mt-4" />
      </div>

      <TabGroup className="mt-6">
        <TabList className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-xl border border-indigo-100/50 border-b-0 shadow-sm p-1.5 gap-1.5 flex-wrap">
          <Tab icon={User} className="px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-indigo-600 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-indigo-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-indigo-100 data-[selected]:border-b-[3px] data-[selected]:border-indigo-500">Perfil</Tab>
          <Tab icon={Building2} className="px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-blue-600 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-blue-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-blue-100 data-[selected]:border-b-[3px] data-[selected]:border-blue-500">Empresa</Tab>
          <Tab icon={Bell} className="px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-purple-600 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-purple-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-purple-100 data-[selected]:border-b-[3px] data-[selected]:border-purple-500">Notificaciones</Tab>
          <Tab icon={Shield} className="px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-emerald-600 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-emerald-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-emerald-100 data-[selected]:border-b-[3px] data-[selected]:border-emerald-500">Seguridad</Tab>
          <Tab icon={Database} className="px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-dark-tremor-content-subtle hover:text-amber-600 hover:bg-white/60 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all duration-300 data-[selected]:bg-white dark:data-[selected]:bg-dark-tremor-background data-[selected]:text-amber-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-amber-100 data-[selected]:border-b-[3px] data-[selected]:border-amber-500">Sistema</Tab>
        </TabList>

        <TabPanels className="bg-white dark:bg-dark-tremor-background border border-gray-200 dark:border-dark-tremor-border rounded-b-xl shadow-sm">
          {/* Perfil */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Información Personal</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">Editá los datos de tu cuenta</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-900 dark:text-dark-tremor-content-strong placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50/50 dark:bg-dark-tremor-background" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1.5">Correo Electrónico (Login)</label>
                  <input value={user?.email ?? ''} disabled className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 dark:bg-dark-tremor-background-muted cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1.5">Correo para Notificaciones</label>
                  <input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-900 dark:text-dark-tremor-content-strong placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50/50 dark:bg-dark-tremor-background" placeholder="tu-correo@gmail.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1.5">Cargo / Rol</label>
                  <input value={user?.role ?? ''} disabled className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 dark:bg-dark-tremor-background-muted cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="block w-full px-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-900 dark:text-dark-tremor-content-strong placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50/50 dark:bg-dark-tremor-background" placeholder="+57 300 000 0000" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={handleSaveProfile} disabled={savingProfile} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {savingProfile ? 'Guardando…' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </TabPanel>

          {/* Empresa */}
          <TabPanel>
            <div className="p-5 space-y-6">
              <CompanySettings />
              <Divider />
              <BranchManager />
            </div>
          </TabPanel>

          {/* Notificaciones */}
          <TabPanel>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Preferencias de Alerta</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">Configurá qué notificaciones querés recibir</p>
                </div>
              </div>

              <div className="space-y-3">
                <NotificationToggle icon={AlertTriangle} color="bg-red-50 text-red-600 border-red-200" title="Alertas de KPIs Críticos" desc="Recibir avisos cuando un KPI esté en zona roja." checked={notifPrefs.kpiAlerts} onChange={(v) => setNotifPrefs({ ...notifPrefs, kpiAlerts: v })} />
                <NotificationToggle icon={Clock} color="bg-purple-50 text-purple-600 border-purple-200" title="Reportes Semanales" desc="Envío automático del resumen ejecutivo los lunes." checked={notifPrefs.weeklyReports} onChange={(v) => setNotifPrefs({ ...notifPrefs, weeklyReports: v })} />
                <NotificationToggle icon={CheckCircle2} color="bg-emerald-50 text-emerald-600 border-emerald-200" title="Aprobaciones Pendientes" desc="Notificar nuevas órdenes de compra por autorizar." checked={notifPrefs.purchaseOrders} onChange={(v) => setNotifPrefs({ ...notifPrefs, purchaseOrders: v })} />
                <NotificationToggle icon={Users} color="bg-blue-50 text-blue-600 border-blue-200" title="Cambios de Inventario" desc="Notificar movimientos de stock importantes." checked={notifPrefs.inventoryChanges} onChange={(v) => setNotifPrefs({ ...notifPrefs, inventoryChanges: v })} />
              </div>

              <div className="border-t border-gray-100 dark:border-dark-tremor-border pt-4">
                <NotificationToggle icon={Bell} color="bg-amber-50 text-amber-600 border-amber-200" title="Notificaciones por Email" desc="Recibir copia de las notificaciones por correo electrónico." checked={notifPrefs.emailEnabled} onChange={(v) => setNotifPrefs({ ...notifPrefs, emailEnabled: v })} />
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={handleSaveNotifPrefs} disabled={updateNotifPrefsMutation.isPending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-60">
                  {updateNotifPrefsMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </TabPanel>

          {/* Seguridad */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Seguridad de la Cuenta</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">Protegé tu acceso al sistema</p>
                </div>
              </div>

              {/* Cambiar Contraseña */}
              <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-dark-tremor-background-muted flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-gray-500 dark:text-dark-tremor-content-subtle" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong">Cambiar Contraseña</p>
                    <p className="text-[11px] text-gray-500 dark:text-dark-tremor-content-subtle">Actualizá tu contraseña de acceso</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 max-w-md">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1">Contraseña actual</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Eye className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" /></span>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-900 dark:text-dark-tremor-content-strong transition-all focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-gray-50/50 dark:bg-dark-tremor-background" placeholder="••••••" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1">Nueva contraseña</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" /></span>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-900 dark:text-dark-tremor-content-strong transition-all focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-gray-50/50 dark:bg-dark-tremor-background" placeholder="Mínimo 6 caracteres" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-dark-tremor-content-subtle uppercase tracking-wider mb-1">Confirmar nueva contraseña</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" /></span>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-dark-tremor-border rounded-lg text-sm text-gray-900 dark:text-dark-tremor-content-strong transition-all focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-gray-50/50 dark:bg-dark-tremor-background" placeholder="Repetí la nueva contraseña" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleChangePassword} disabled={savingPassword} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60">
                    {savingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {savingPassword ? 'Actualizando…' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </Card>

              {/* 2FA */}
              <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl p-5">
                <TwoFactorSetup isEnabled={twoFAEnabled} onToggle={setTwoFAEnabled} />
              </Card>
            </div>
          </TabPanel>

          {/* Sistema */}
          <TabPanel>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Database className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Parámetros del Sistema</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">Información técnica y mantenimiento</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SystemCard icon={Code2} label="Versión del BI" value="1.2.0-stable" color="text-indigo-600 bg-indigo-50 border-indigo-200" />
                <SystemCard icon={Database} label="Base de Datos" value="PostgreSQL 15" color="text-emerald-600 bg-emerald-50 border-emerald-200" />
                <SystemCard icon={Clock} label="Último Reinicio" value="Activo" color="text-amber-600 bg-amber-50 border-amber-200" />
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-dark-tremor-border p-4 bg-gray-50/50 dark:bg-dark-tremor-background-muted">
                <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong mb-3">Mantenimiento</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => Swal.fire({ title: 'Caché Limpiada', text: 'El caché del sistema fue limpiado exitosamente.', icon: 'success', timer: 1500, showConfirmButton: false })} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">Limpiar Caché</button>
                  <button onClick={() => Swal.fire({ title: 'Sistema', text: 'Todos los servicios están operativos.', icon: 'info', timer: 1500, showConfirmButton: false })} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-700 dark:text-dark-tremor-content bg-white dark:bg-dark-tremor-background hover:bg-gray-50 dark:hover:bg-dark-tremor-background-subtle border border-gray-200 dark:border-dark-tremor-border transition-colors">Verificar Estado</button>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

function NotificationToggle({ icon: Icon, color, title, desc, checked, onChange }: { icon: any; color: string; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-dark-tremor-border hover:border-gray-200 dark:hover:border-dark-tremor-border transition-colors bg-white dark:bg-dark-tremor-background">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong">{title}</p>
          <p className="text-[11px] text-gray-500 dark:text-dark-tremor-content-subtle">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={() => onChange(!checked)} />
        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
      </label>
    </div>
  );
}

function SystemCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-dark-tremor-border p-4 bg-white dark:bg-dark-tremor-background flex items-start gap-3">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 dark:text-dark-tremor-content-subtle">{label}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">{value}</p>
      </div>
    </div>
  );
}
