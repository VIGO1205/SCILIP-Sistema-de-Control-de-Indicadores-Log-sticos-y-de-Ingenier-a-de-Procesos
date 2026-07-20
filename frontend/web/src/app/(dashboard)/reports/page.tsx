'use client';

import React, { useState } from 'react';
import {
  Card,
  Grid,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
} from '@tremor/react';
import {
  FileText,
  BarChart3,
  Clock,
  Download,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';
import { KPICard } from '@/components/ui/kpi-card';
import { ReportCard } from '@/components/reports/report-card';
import { ReportsHistoryTable } from '@/components/reports/reports-history-table';

export default function ReportsPage() {
  const [loadingDownload, setLoadingDownload] = useState<{ reportId: string; format: string } | null>(null);

  const utils = trpc.useUtils();
  const { data: availableReports, isLoading: loadingReports } = trpc.report.getAvailableReports.useQuery();
  const { data: history, isLoading: loadingHistory } = trpc.report.getHistory.useQuery({ limit: 20 });
  const downloadMutation = trpc.report.downloadReport.useMutation({
    onSuccess: () => {
      utils.report.getHistory.invalidate();
    },
  });

  const currentYear = new Date().getFullYear();

  const handleDownload = async (reportId: string, format: string) => {
    setLoadingDownload({ reportId, format });
    try {
      const result = await downloadMutation.mutateAsync({
        type: reportId,
        format: format as 'pdf' | 'excel',
        year: currentYear,
      });

      const byteCharacters = atob(result.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.contentType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      Swal.fire({
        title: 'Error al descargar',
        text: err.message || 'No se pudo descargar el reporte',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingDownload(null);
    }
  };

  const totalReports = availableReports?.length ?? 0;
  const pdfReports = availableReports?.filter((r) => r.formats.includes('pdf')).length ?? 0;
  const excelReports = availableReports?.filter((r) => r.formats.includes('excel')).length ?? 0;
  const totalGenerated = history?.length ?? 0;

  return (
    <main className="p-4 sm:p-5 bg-gray-50 min-h-screen">
      {/* Header estilo Dashboard */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reportes Logísticos</h1>
            <p className="text-gray-500 mt-0.5 text-xs">
              Generación y descarga de informes técnicos de gestión en PDF y Excel
            </p>
          </div>
        </div>
        <Divider className="mt-4" />
      </div>

      {/* KPI Cards */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
        <KPICard
          title="Reportes Disponibles"
          value={totalReports}
          unit=""
          status="neutral"
          direction="up"
          subtitle="Categorías"
          loading={loadingReports}
        />
        <KPICard
          title="Con formato PDF"
          value={pdfReports}
          unit=""
          status="neutral"
          direction="up"
          subtitle="Reportes"
          loading={loadingReports}
        />
        <KPICard
          title="Con formato Excel"
          value={excelReports}
          unit=""
          status="neutral"
          direction="up"
          subtitle="Reportes"
          loading={loadingReports}
        />
        <KPICard
          title="Generados Este Año"
          value={totalGenerated}
          unit=""
          status="neutral"
          direction="up"
          subtitle="En historial"
          loading={loadingHistory}
        />
      </Grid>

      {/* Tabs estilo Dashboard */}
      <TabGroup className="mt-6">
        <TabList className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-t-xl border border-indigo-100/50 border-b-0 shadow-sm p-1.5 gap-1.5">
          <Tab
            icon={BarChart3}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-indigo-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-indigo-100 data-[selected]:border-b-[3px] data-[selected]:border-indigo-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Reportes Disponibles
          </Tab>
          <Tab
            icon={Clock}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-purple-600 hover:bg-white/60 rounded-lg transition-all duration-300 data-[selected]:bg-white data-[selected]:text-purple-600 data-[selected]:font-bold data-[selected]:shadow-md data-[selected]:shadow-purple-100 data-[selected]:border-b-[3px] data-[selected]:border-purple-500 data-[selected]:rounded-t-lg data-[selected]:rounded-b-none data-[selected]:translate-y-[-1px]"
          >
            Historial
          </Tab>
        </TabList>

        <TabPanels className="bg-white border border-gray-200 rounded-b-xl shadow-sm">
          {/* Reportes Disponibles */}
          <TabPanel>
            <div className="p-5 space-y-5">
              {loadingReports ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-gray-900">Resumen de Reportes</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatusCard label="Total" count={totalReports} color="indigo" icon={<BarChart3 className="h-4 w-4" />} />
                      <StatusCard label="PDF" count={pdfReports} color="red" icon={<FileText className="h-4 w-4" />} />
                      <StatusCard label="Excel" count={excelReports} color="emerald" icon={<Download className="h-4 w-4" />} />
                      <StatusCard label="Generados" count={totalGenerated} color="purple" icon={<Clock className="h-4 w-4" />} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableReports?.map((report) => (
                      <ReportCard
                        key={report.id}
                        id={report.id}
                        name={report.name}
                        description={report.description}
                        category={report.category}
                        formats={report.formats}
                        onDownload={handleDownload}
                        loading={loadingDownload}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabPanel>

          {/* Historial */}
          <TabPanel>
            <div className="p-5">
              <ReportsHistoryTable history={history || []} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

function StatusCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg ${c.bg} border ${c.border}`}>
      <span className={c.text}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className={`text-base font-bold ${c.text}`}>{count}</p>
      </div>
    </div>
  );
}
