'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Bell, Search, LogOut, Settings, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../providers/auth-provider';

export default function Header({ collapsed }: { collapsed?: boolean }) {
  const { user, isLoading, logout } = useAuth();
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
    <header className="bg-white shadow-header h-14 flex items-center justify-between px-6 z-10 flex-shrink-0">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            className="block w-full pl-10 pr-4 py-2 border-none rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all sm:text-sm"
            placeholder="Buscar indicadores, reportes..."
            type="search"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="hidden sm:inline-flex h-4 items-center gap-1 rounded border bg-white px-1 font-sans text-[9px] font-medium text-gray-400">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all relative"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger border-[1.5px] border-white" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 border-l border-gray-100 pl-4 pr-1 py-1 hover:bg-gray-50 rounded-lg transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-none">
                {isLoading ? '…' : user?.fullName ?? 'Usuario'}
              </p>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
                {isLoading ? '' : user?.role ?? 'Administrador'}
              </p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white text-[10px] font-bold">
              {initials}
            </div>
            <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 origin-top-right transition-all duration-200">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.fullName ?? 'Usuario'}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email ?? ''}</p>
              </div>

              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-gray-400" />
                Configuración
              </Link>

              <button
                type="button"
                onClick={() => { setDropdownOpen(false); router.push('/settings'); }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-gray-400" />
                Mi Perfil
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                type="button"
                onClick={() => { setDropdownOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-red-500" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
