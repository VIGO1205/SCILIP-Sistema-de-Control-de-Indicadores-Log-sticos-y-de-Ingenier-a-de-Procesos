'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, ChevronDown, Menu, Sun, Moon } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../providers/auth-provider';
import { useTheme } from '../providers/theme-provider';
import NotificationCenter from '../notifications/notification-center';
import GlobalSearch from './global-search';

export default function Header({
  collapsed,
  onToggleSidebar,
}: {
  collapsed?: boolean;
  onToggleSidebar?: () => void;
}) {
  const { user, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que querés salir del sistema?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });
    if (result.isConfirmed) {
      await logout();
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  return (
    <header className="bg-white dark:bg-dark-tremor-background shadow-header h-14 flex items-center justify-between px-6 z-10 flex-shrink-0 border-b border-transparent dark:border-dark-tremor-border transition-colors">
      <div className="flex items-center flex-1">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mr-3 p-2 rounded-lg text-gray-500 dark:text-dark-tremor-content-subtle hover:text-gray-700 dark:hover:text-dark-tremor-content-emphasis hover:bg-gray-100 dark:hover:bg-dark-tremor-background-subtle transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <GlobalSearch />
      </div>

      <div className="flex items-center space-x-2">
        <NotificationCenter />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-dark-tremor-content-subtle hover:text-gray-700 dark:hover:text-dark-tremor-content-emphasis hover:bg-gray-100 dark:hover:bg-dark-tremor-background-subtle transition-colors"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 border-l border-gray-100 dark:border-dark-tremor-border pl-4 pr-1 py-1 hover:bg-gray-50 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong leading-none">
                {isLoading ? '…' : user?.fullName ?? 'Usuario'}
              </p>
              <p className="text-[9px] font-semibold text-gray-400 dark:text-dark-tremor-content-subtle uppercase tracking-wider mt-1">
                {isLoading ? '' : user?.role ?? 'Administrador'}
              </p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white text-[10px] font-bold">
              {initials}
            </div>
            <ChevronDown className={`h-3 w-3 text-gray-400 dark:text-dark-tremor-content-subtle transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-tremor-background rounded-xl shadow-lg border border-gray-200 dark:border-dark-tremor-border py-1 z-50 origin-top-right transition-all duration-200">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-tremor-border">
                <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong truncate">{user?.fullName ?? 'Usuario'}</p>
                <p className="text-[10px] text-gray-500 dark:text-dark-tremor-content-subtle truncate">{user?.email ?? ''}</p>
              </div>

              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-dark-tremor-content hover:bg-gray-50 dark:hover:bg-dark-tremor-background-subtle flex items-center gap-2 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-gray-400 dark:text-dark-tremor-content-subtle" />
                Configuración
              </Link>

              <button
                type="button"
                onClick={() => { setDropdownOpen(false); router.push('/settings'); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-dark-tremor-content hover:bg-gray-50 dark:hover:bg-dark-tremor-background-subtle flex items-center gap-2 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-gray-400 dark:text-dark-tremor-content-subtle" />
                Mi Perfil
              </button>

              <div className="border-t border-gray-100 dark:border-dark-tremor-border my-1" />

              <button
                type="button"
                onClick={() => { setDropdownOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 text-xs text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
