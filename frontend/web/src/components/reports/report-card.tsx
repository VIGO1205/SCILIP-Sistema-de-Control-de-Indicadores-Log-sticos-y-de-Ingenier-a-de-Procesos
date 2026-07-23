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
  const categoryColors: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string; darkBorder: string }> = {
    Transporte: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', darkBg: 'bg-blue-950/30', darkText: 'text-blue-400', darkBorder: 'border-blue-800/50' },
    KPIs: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', darkBg: 'bg-emerald-950/30', darkText: 'text-emerald-400', darkBorder: 'border-emerald-800/50' },
    'Comercio Exterior': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', darkBg: 'bg-cyan-950/30', darkText: 'text-cyan-400', darkBorder: 'border-cyan-800/50' },
    Compras: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', darkBg: 'bg-amber-950/30', darkText: 'text-amber-400', darkBorder: 'border-amber-800/50' },
  };
  const cc = categoryColors[category] || { 
    bg: 'bg-gray-50', 
    text: 'text-gray-700', 
    border: 'border-gray-200',
    darkBg: 'bg-dark-tremor-background-subtle', 
    darkText: 'text-dark-tremor-content', 
    darkBorder: 'border-dark-tremor-border' 
  };

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl ${cc.bg} ${cc.darkBg} flex items-center justify-center shrink-0`}>
          <FileText className="h-5 w-5 text-gray-500 dark:text-dark-tremor-content-subtle" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">{name}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cc.bg} ${cc.darkBg} ${cc.text} ${cc.darkText} border ${cc.border} ${cc.darkBorder}`}>
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
                  ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50'
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
