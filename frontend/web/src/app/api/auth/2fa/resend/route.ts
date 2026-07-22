import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../../lib/auth/config';

export async function POST(request: Request) {
  const { tempToken } = await request.json().catch(() => ({}));

  if (!tempToken) {
    return NextResponse.json(
      { message: 'Token requerido' },
      { status: 400 },
    );
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${getApiBaseUrl()}/auth/2fa/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken }),
    });
  } catch {
    return NextResponse.json(
      { message: 'No se pudo conectar con la API.' },
      { status: 503 },
    );
  }

  const data = await apiRes.json().catch(() => ({}));

  if (!apiRes.ok) {
    return NextResponse.json(
      { message: data.message ?? 'Error al reenviar código' },
      { status: apiRes.status },
    );
  }

  return NextResponse.json(data);
}
