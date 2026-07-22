'use client';

import React, { useState } from 'react';
import { Shield, Mail, Check, Loader2 } from 'lucide-react';
import { trpc } from '../../lib/trpc/react';
import Swal from 'sweetalert2';
import OtpInput from './otp-input';

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function TwoFactorSetup({ isEnabled, onToggle }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'idle' | 'code-sent' | 'verifying'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [sending, setSending] = useState(false);

  const sendOtpMutation = trpc.user.sendOtp.useMutation();
  const verifyOtpMutation = trpc.user.verifyOtp.useMutation();
  const disable2FAMutation = trpc.user.disable2FA.useMutation();

  const handleEnable = async () => {
    setSending(true);
    try {
      await sendOtpMutation.mutateAsync();
      setStep('code-sent');
      Swal.fire({
        title: 'Código enviado',
        text: 'Revisa tu correo electrónico para el código de verificación.',
        icon: 'info',
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo enviar el código', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      Swal.fire({ title: 'Error', text: 'Ingresá el código de 6 dígitos', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    try {
      await verifyOtpMutation.mutateAsync({ code: otpCode });
      setStep('idle');
      setOtpCode('');
      onToggle(true);
      Swal.fire({
        title: '2FA Activado',
        text: 'La autenticación de dos factores está ahora activa.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'Código incorrecto', icon: 'error', confirmButtonColor: '#dc2626' });
    }
  };

  const handleDisable = async () => {
    const { value: password } = await Swal.fire({
      title: 'Desactivar 2FA',
      text: 'Ingresá tu contraseña para confirmar',
      input: 'password',
      inputPlaceholder: 'Tu contraseña',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancelar',
    });
    if (!password) return;

    try {
      await disable2FAMutation.mutateAsync({ password });
      onToggle(false);
      Swal.fire({ title: '2FA Desactivado', text: 'La autenticación de dos factores fue desactivada.', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'Contraseña incorrecta', icon: 'error', confirmButtonColor: '#dc2626' });
    }
  };

  if (step === 'code-sent') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-xs text-gray-600">Se envió un código de 6 dígitos a tu correo electrónico.</p>
        </div>
        <OtpInput value={otpCode} onChange={setOtpCode} />
        <div className="flex gap-2">
          <button
            onClick={() => { setStep('idle'); setOtpCode(''); }}
            className="flex-1 px-4 py-2 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleVerify}
            disabled={otpCode.length !== 6 || verifyOtpMutation.isPending}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {verifyOtpMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Verificar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Shield className="h-4 w-4 text-gray-500" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-gray-900">Autenticación 2FA</p>
          {isEnabled ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
              <Check className="h-3 w-3" /> Activado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
              Desactivado
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {isEnabled
            ? 'Tu cuenta tiene una capa extra de seguridad con código por email.'
            : 'Añadí una capa extra de seguridad con autenticación de dos factores.'}
        </p>
        <div className="mt-2">
          {isEnabled ? (
            <button
              onClick={handleDisable}
              disabled={disable2FAMutation.isPending}
              className="px-3 py-1.5 rounded-md text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              Desactivar 2FA
            </button>
          ) : (
            <button
              onClick={handleEnable}
              disabled={sending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
              Activar 2FA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
