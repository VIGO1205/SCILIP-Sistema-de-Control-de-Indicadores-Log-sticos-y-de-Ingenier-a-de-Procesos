'use client';

import React, { useState } from 'react';
import { Shield, Mail, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { trpc } from '../../lib/trpc/react';
import Swal from 'sweetalert2';
import OtpInput from './otp-input';

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

import { motion, AnimatePresence } from 'framer-motion';

function MailboxAnimation() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      {/* Mailbox base */}
      <svg className="w-7 h-7 text-gray-300 absolute bottom-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" />
        <path d="M2 13h20" />
      </svg>
      {/* Animated Envelope */}
      <motion.svg
        className="w-5 h-5 text-indigo-500 absolute"
        viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        initial={{ y: -15, opacity: 0, scale: 0.8 }}
        animate={{ y: [ -15, -2, 5 ], opacity: [0, 1, 0], scale: [0.8, 1, 0.7] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="white" />
        <polyline points="22,6 12,13 2,6" stroke="currentColor" fill="none" strokeWidth="2" />
      </motion.svg>
    </div>
  );
}

export default function TwoFactorSetup({ isEnabled, onToggle }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'idle' | 'code-sent' | 'verifying' | 'disable-confirm'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [sending, setSending] = useState(false);
  
  // Disable 2FA form state
  const [disablePassword, setDisablePassword] = useState('');
  const [disableConfirmPassword, setDisableConfirmPassword] = useState('');
  const [showDisablePassword, setShowDisablePassword] = useState(false);

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

  const submitDisable = async () => {
    if (!disablePassword || disablePassword !== disableConfirmPassword) {
      Swal.fire({ title: 'Error', text: 'Las contraseñas no coinciden o están vacías', icon: 'error', confirmButtonColor: '#dc2626' });
      return;
    }
    try {
      await disable2FAMutation.mutateAsync({ password: disablePassword });
      setStep('idle');
      setDisablePassword('');
      setDisableConfirmPassword('');
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

  if (step === 'disable-confirm') {
    return (
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Desactivar 2FA</p>
            <p className="text-[11px] text-gray-500">Por seguridad, confirmá tu contraseña actual.</p>
          </div>
        </div>

        <div className="space-y-3 max-w-sm">
          <div className="relative">
            <input
              type={showDisablePassword ? 'text' : 'password'}
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowDisablePassword(!showDisablePassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {showDisablePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showDisablePassword ? 'text' : 'password'}
              value={disableConfirmPassword}
              onChange={(e) => setDisableConfirmPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              placeholder="Confirmar contraseña"
            />
          </div>
        </div>

        <div className="flex gap-2 max-w-sm mt-3">
          <button
            onClick={() => { setStep('idle'); setDisablePassword(''); setDisableConfirmPassword(''); }}
            className="flex-1 px-4 py-2 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={submitDisable}
            disabled={disable2FAMutation.isPending || !disablePassword || disablePassword !== disableConfirmPassword}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {disable2FAMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Desactivar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 relative">
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
              onClick={() => setStep('disable-confirm')}
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
              <Shield className="h-3 w-3" />
              {sending ? 'Enviando...' : 'Activar 2FA'}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center ml-2"
          >
            <MailboxAnimation />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
