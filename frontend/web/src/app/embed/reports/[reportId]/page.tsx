"use client";

import React from 'react';

export default function EmbeddedReportPage({ params }: { params: { reportId: string } }) {
	return (
		<main className="min-h-screen bg-gray-50 p-6">
			<div className="mx-auto max-w-5xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
				<h1 className="text-2xl font-semibold text-gray-900">Reporte embebido</h1>
				<p className="mt-2 text-sm text-gray-600">
					Visualización del reporte {params.reportId}.
				</p>
				<div className="mt-6 flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
					Contenido en desarrollo
				</div>
			</div>
		</main>
	);
}
