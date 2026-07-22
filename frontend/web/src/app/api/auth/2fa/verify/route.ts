import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../../lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const { tempToken, code } = await request.json();

    if (!tempToken || !code) {
      return NextResponse.json({ message: 'Token y código son requeridos' }, { status: 400 });
    }

    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/2fa/verify-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tempToken, code }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json({ message: data.message || 'Código inválido' }, { status: apiRes.status });
    }

    const response = NextResponse.json({ user: data.user });

    if (data.access_token) {
      response.cookies.set(AUTH_COOKIE_NAME, data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
