'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OtpInput from '../../../components/auth/otp-input';
import { trpc } from '../../../lib/trpc/react';
import Swal from 'sweetalert2';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const tempToken = typeof window !== 'undefined' ? sessionStorage.getItem('otp_temp_token') : null;
  const otpEmail = typeof window !== 'undefined' ? sessionStorage.getItem('otp_email') : null;

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      Swal.fire({ title: 'Error', text: 'Ingresá el código de 6 dígitos', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    if (!tempToken) {
      Swal.fire({ title: 'Sesión expirada', text: 'Volvé a iniciar sesión', icon: 'warning', confirmButtonColor: '#dc2626' });
      router.push('/login');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otpCode }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        sessionStorage.removeItem('otp_temp_token');
        sessionStorage.removeItem('otp_email');
        window.location.assign('/dashboard');
      } else {
        Swal.fire({ title: 'Código incorrecto', text: data.message || 'Verificá el código e intentá de nuevo', icon: 'error', confirmButtonColor: '#dc2626' });
      }
    } catch {
      Swal.fire({ title: 'Error', text: 'No se pudo verificar. Intentá de nuevo.', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verificación 2FA</h1>
          <p className="text-sm text-gray-500 mt-2">
            Ingresá el código de 6 dígitos enviado a<br />
            <span className="font-semibold text-gray-700">{otpEmail || 'tu correo'}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
          <OtpInput value={otpCode} onChange={setOtpCode} disabled={verifying} />
          <button
            onClick={handleVerify}
            disabled={otpCode.length !== 6 || verifying}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {verifying ? 'Verificando…' : 'Verificar'}
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al login
          </button>
        </div>
      </div>
    </div>
  );
}
