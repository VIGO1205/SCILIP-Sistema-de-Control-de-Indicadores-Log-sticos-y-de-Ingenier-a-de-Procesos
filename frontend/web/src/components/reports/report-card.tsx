'use client';

import React from 'react';
import { Card } from '@tremor/react';
import { FileText, Download, Loader2 } from 'lucide-react';

interface ReportCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  formats: string[];
  onDownload: (reportId: string, format: string) => void;
  loading?: { reportId: string; format: string } | null;
}

export function ReportCard({ id, name, description, category, formats, onDownload, loading }: ReportCardProps) {
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Transporte: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    KPIs: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Comercio Exterior': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    Compras: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  };
  const cc = categoryColors[category] || { bg: 'bg-gray-50 dark:bg-dark-tremor-background-subtle', text: 'text-gray-700 dark:text-dark-tremor-content', border: 'border-gray-200 dark:border-dark-tremor-border' };

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl ${cc.bg} flex items-center justify-center shrink-0`}>
          <FileText className="h-5 w-5 text-gray-500 dark:text-dark-tremor-content-subtle" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">{name}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cc.bg} ${cc.text} border ${cc.border}`}>
              {category}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {formats.map((fmt) => {
          const isLoading = loading?.reportId === id && loading?.format === fmt;
          const isPdf = fmt === 'pdf';
          return (
            <button
              key={fmt}
              onClick={() => onDownload(id, fmt)}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                isPdf
                  ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {isLoading ? 'Generando...' : `Descargar ${fmt.toUpperCase()}`}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
