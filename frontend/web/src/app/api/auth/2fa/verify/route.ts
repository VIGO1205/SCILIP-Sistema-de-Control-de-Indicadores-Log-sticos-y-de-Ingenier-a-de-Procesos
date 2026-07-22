import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
  }
}
