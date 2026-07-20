import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/auth/config';

export async function POST(request: Request) {
  const body = await request.json();

  let apiRes: Response;
  try {
    apiRes = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      {
        message:
          'No se pudo conectar con la API. Asegúrate de tener el backend activo.',
      },
      { status: 503 },
    );
  }

  const data = await apiRes.json().catch(() => ({}));

  if (!apiRes.ok) {
    return NextResponse.json(
      { message: data.message ?? 'Error al registrar' },
      { status: apiRes.status },
    );
  }

  return NextResponse.json(data);
}
