import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isAdminDomain = hostname.startsWith('admin.');
  const url = request.nextUrl.clone();
  
  // Redirigir www a non-www
  if (hostname.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '');
    url.host = newHostname;
    return NextResponse.redirect(url);
  }

  // Manejar dominio admin
  if (isAdminDomain) {
    // Si no está en /admin, redirigir a /admin
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.redirect(url);
    }
  } else {
    // Si está en el dominio principal y trata de acceder a /admin, redirigir al dominio admin
    if (url.pathname.startsWith('/admin')) {
      url.host = `admin.${hostname}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
