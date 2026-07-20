import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getApiBaseUrl } from '../../../../lib/auth/config';

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email y contraseña son obligatorios' },
      { status: 400 },
    );
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json(
      {
        message:
          'No se pudo conectar con la API. Asegúrate de tener el backend activo (puerto 4000). Ejecuta: pnpm dev',
      },
      { status: 503 },
    );
  }

  const data = await apiRes.json().catch(() => ({}));

  if (!apiRes.ok) {
    return NextResponse.json(
      { message: data.message ?? 'Credenciales inválidas' },
      { status: apiRes.status },
    );
  }

  const response = NextResponse.json({
    user: data.user,
  });

  response.cookies.set(AUTH_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return response;
}
