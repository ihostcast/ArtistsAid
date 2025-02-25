import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { requestNotificationPermission, onMessageListener } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { BellIcon } from '@heroicons/react/24/outline';

export const AuthButtons = () => {
  const { user, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if notifications are already enabled
      if (Notification.permission === 'granted') {
        setNotificationEnabled(true);
      }

      // Listen for messages when app is in foreground
      const unsubscribe = onMessageListener();
      return () => unsubscribe();
    }
  }, [user]);

  const handleNotificationToggle = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationEnabled(true);
      // Mostrar mensaje de éxito
      alert('¡Notificaciones activadas correctamente!');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => signInWithGoogle()}
          className="flex items-center justify-center gap-2"
          variant="outline"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Iniciar sesión con Google
        </Button>

        <Button
          onClick={() => signInWithApple()}
          className="flex items-center justify-center gap-2"
          variant="outline"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.38 4.38 0 0 0-2.91 1.5 4.1 4.1 0 0 0-1.03 2.97 3.63 3.63 0 0 0 2.88-1.78M16 8.63c1.03-.05 2.47.41 3.34 1.22.87.81 1.22 1.97 1.19 2.97-.03 1-.44 2.16-1.19 2.97-.75.81-2.19 1.27-3.22 1.22-.53-.03-1.41-.27-2.06-.68-.66-.41-1.19-.95-1.19-.95s-.53.54-1.19.95c-.66.41-1.53.65-2.06.68-1.03.05-2.47-.41-3.22-1.22-.75-.81-1.16-1.97-1.19-2.97-.03-1 .31-2.16 1.19-2.97.87-.81 2.31-1.27 3.34-1.22.53.03 1.41.27 2.06.68.66.41 1.19.95 1.19.95s.53-.54 1.19-.95c.66-.41 1.53-.65 2.06-.68h.75Z" />
          </svg>
          Iniciar sesión con Apple
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Usuario'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium">
          {user.displayName}
        </span>
      </div>
      
      <div className="flex gap-2">
        {!notificationEnabled && (
          <Button
            onClick={handleNotificationToggle}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BellIcon className="h-5 w-5" />
            <span>Activar notificaciones</span>
          </Button>
        )}
        
        <Button
          onClick={() => signOut()}
          variant="destructive"
          size="sm"
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};
