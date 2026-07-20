'use client';

import React, { useState } from 'react';
import { Dialog, DialogPanel, Text } from '@tremor/react';
import { X, Star, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import Swal from 'sweetalert2';

interface SupplierRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

export function SupplierRatingModal({ isOpen, onClose, supplierId, supplierName }: SupplierRatingModalProps) {
  const [manualRating, setManualRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: rating, isLoading } = trpc.purchasing.getSupplierRating.useQuery(
    { supplierId },
    { enabled: isOpen && !!supplierId }
  );

  const evaluateMutation = trpc.purchasing.evaluateSupplier.useMutation({
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Evaluación guardada',
        text: 'La calificación del proveedor se actualizó exitosamente.',
        confirmButtonColor: '#4F46E5',
        timer: 3000,
      });
      onClose();
      setManualRating(0);
      setComment('');
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la evaluación.',
        confirmButtonColor: '#4F46E5',
      });
    },
  });

  const handleSave = () => {
    if (manualRating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona una calificación',
        text: 'Debes seleccionar al menos 1 estrella.',
        confirmButtonColor: '#4F46E5',
      });
      return;
    }
    evaluateMutation.mutate({ supplierId, manualRating, comment });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-lg w-full bg-white rounded-xl shadow-xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Evaluar Proveedor</h3>
                <p className="text-xs text-gray-500">{supplierName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
            </div>
          ) : (
            <>
              {/* Rating Actual */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Rating Automático</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{rating?.autoRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">/ 5</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Basado en {rating?.totalOrders} órdenes
                  </p>
                </div>
                <div className={`p-4 rounded-xl border ${
                  rating?.manualRating 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}>
                  <p className="text-xs text-gray-500 mb-1">
                    {rating?.manualRating ? 'Rating Manual (Override)' : 'Sin Override'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      rating?.manualRating ? 'text-amber-700' : 'text-gray-400'
                    }`}>
                      {rating?.manualRating?.toFixed(1) || '-'}
                    </span>
                    {rating?.manualRating && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                        Manual
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {rating && rating.breakdown && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Desglose Automático</p>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricRow 
                      label="Entregas a Tiempo" 
                      value={rating.breakdown.onTimeScore} 
                      icon={<TrendingUp className="h-3.5 w-3.5" />}
                      weight={30}
                    />
                    <MetricRow 
                      label="Calidad" 
                      value={rating.breakdown.qualityScore} 
                      icon={<CheckCircle className="h-3.5 w-3.5" />}
                      weight={30}
                    />
                    <MetricRow 
                      label="Cantidad" 
                      value={rating.breakdown.quantityScore} 
                      icon={<BarChart3 className="h-3.5 w-3.5" />}
                      weight={20}
                    />
                    <MetricRow 
                      label="Éxito" 
                      value={rating.breakdown.successScore} 
                      icon={<AlertTriangle className="h-3.5 w-3.5" />}
                      weight={20}
                    />
                  </div>
                </div>
              )}

              {/* Manual Override */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Tu Evaluación Manual
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setManualRating(star)}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredStar || manualRating)
                            ? 'text-warning fill-warning'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm font-medium text-gray-700 mb-4">
                  {manualRating > 0 ? `${manualRating} estrella${manualRating > 1 ? 's' : ''}` : 'Selecciona una calificación'}
                </p>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Observaciones sobre el proveedor (opcional)..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={evaluateMutation.isPending || manualRating === 0}
                  className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {evaluateMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  );
}

function MetricRow({ label, value, icon, weight }: { label: string; value: number; icon: React.ReactNode; weight: number }) {
  const color = value >= 80 ? 'text-emerald-600' : value >= 60 ? 'text-amber-600' : 'text-red-600';
  const barColor = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={color}>{icon}</span>
          <span className="text-xs text-gray-600">{label}</span>
        </div>
        <span className={`text-xs font-bold ${color}`}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <p className="text-[9px] text-gray-400 mt-1">Peso: {weight}%</p>
    </div>
  );
}
