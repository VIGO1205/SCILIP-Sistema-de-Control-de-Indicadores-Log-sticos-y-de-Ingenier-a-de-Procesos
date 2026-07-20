import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getApiBaseUrl } from '../../../../lib/auth/config';

export async function GET(req: Request) {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'No autenticado. Inicia sesión para descargar reportes.' },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'transport-vs-sales';
  const format = url.searchParams.get('format') || 'pdf';
  const year = url.searchParams.get('year') || new Date().getFullYear().toString();

  const target = `${getApiBaseUrl()}/reports/download?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}&year=${encodeURIComponent(year)}`;

  const apiRes = await fetch(target, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!apiRes.ok) {
    const body = await apiRes.json().catch(() => ({}));
    return NextResponse.json(
      { message: body.message || 'Error al generar reporte' },
      { status: apiRes.status }
    );
  }

  const blob = await apiRes.blob();
  const contentType = apiRes.headers.get('content-type') || 'application/octet-stream';
  const contentDisposition = apiRes.headers.get('content-disposition') || `attachment; filename="reporte.${format === 'pdf' ? 'pdf' : 'xlsx'}"`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': contentDisposition,
    },
  });
}
