import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getApiBaseUrl } from '../../../../lib/auth/config';

export async function GET() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const baseUrl = getApiBaseUrl();
  try {
    const apiRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!apiRes.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const profile = await apiRes.json();

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        notificationEmail: profile.notificationEmail,
        fullName: profile.fullName,
        role: profile.role?.name ?? profile.role,
        companyId: profile.companyId ?? null,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 502 });
  }
}
