import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">404 - Página no encontrada</h2>
      <p className="text-gray-600 mb-8">Lo sentimos, la página que buscas no existe.</p>
      <Link 
        href="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}
