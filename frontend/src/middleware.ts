import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const isAdminDomain = hostname.startsWith('admin.')
  const url = request.nextUrl.clone()
  
  // Redirigir www a non-www
  if (hostname.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '')
    url.host = newHostname
    return NextResponse.redirect(url)
  }

  // Manejar dominio admin
  if (isAdminDomain) {
    // Si no está en /admin, redirigir a /admin
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`
      return NextResponse.redirect(url)
    }
  } else {
    // Si está en el dominio principal y trata de acceder a /admin, redirigir al dominio admin
    if (url.pathname.startsWith('/admin')) {
      url.host = `admin.${hostname}`
      return NextResponse.redirect(url)
    }
  }

  try {
    // Verificar si la ruta requiere autenticación de admin
    if (request.nextUrl.pathname.startsWith('/admin/settings/logs')) {
      const user = auth.currentUser;
      
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Verificar el rol del usuario
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
