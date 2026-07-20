import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, getApiBaseUrl } from '../../../../lib/auth/config';

async function proxy(
  request: Request,
  { params }: { params: { trpc: string[] } },
) {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  const trpcPath = params.trpc.join('/');
  const url = new URL(request.url);
  const target = `${getApiBaseUrl()}/trpc/${trpcPath}${url.search}`;

  const res = await fetch(target, {
    method: request.method,
    headers: {
      'content-type': request.headers.get('content-type') ?? 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body:
      request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
  });

  const body = await res.text();
  if (res.status >= 400) {
    console.error(`[tRPC Proxy] ${request.method} ${trpcPath} → ${res.status}`, body.slice(0, 500));
  }
  return new Response(body, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/json',
    },
  });
}

export const GET = proxy;
export const POST = proxy;
