'use client';

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiInterpretation } from '@/hooks/use-ai-interpretation';

interface AiOverlayBaseProps {
  children: React.ReactNode;
  className?: string;
}

interface AiOverlayKpiProps extends AiOverlayBaseProps {
  type: 'kpi';
  kpiCode: string;
  kpiName: string;
  value: number;
  target: number;
  direction: 'up' | 'down';
  unit: string;
  status: 'good' | 'warning' | 'bad' | 'neutral';
  previousValue?: number;
  timeSeries?: { date: string; value: number }[];
  month?: string;
}

interface AiOverlayChartProps extends AiOverlayBaseProps {
  type: 'chart';
  chartType: 'donut' | 'bar' | 'trend';
  title: string;
  data: any;
  month?: string;
}

type AiOverlayProps = AiOverlayKpiProps | AiOverlayChartProps;

export function AiOverlay(props: AiOverlayProps) {
  const { children, className, ...queryProps } = props;
  const [isOpen, setIsOpen] = useState(false);

  const { text, isLoading } = useAiInterpretation({
    ...queryProps,
    enabled: isOpen,
  } as any);

  return (
    <div className={cn('relative group', className)}>
      {children}

      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/80 border border-gray-200/60 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-violet-50 hover:border-violet-300 hover:shadow-md cursor-pointer"
        title="Interpretacion IA"
      >
        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
      </button>

      {isOpen && (
        <div
          className="absolute inset-0 z-50 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl overflow-hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="rounded-2xl flex flex-col max-h-full max-w-[92%] w-full mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-bold text-white">
                  Interpretacion IA
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-3 bg-white/20 rounded-full animate-pulse w-full" />
                  <div className="h-3 bg-white/20 rounded-full animate-pulse w-4/5" />
                  <div className="h-3 bg-white/20 rounded-full animate-pulse w-3/5" />
                </div>
              ) : text ? (
                <p className="text-[13px] leading-relaxed text-white/95 whitespace-pre-line">
                  {text}
                </p>
              ) : (
                <p className="text-[13px] text-white/40 italic">
                  No se pudo generar la interpretacion.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-violet-300/60" />
                <span className="text-[10px] text-white/40 font-medium">
                  Generado con IA
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-medium text-white/50 hover:text-white/80 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
