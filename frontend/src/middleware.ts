import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function middleware(request: NextRequest) {
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
