'use client';

import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  OAuthProvider,
  GoogleAuthProvider,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  role?: string;
  permissions?: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeUser = async (firebaseUser: User) => {
    try {
      // Primero creamos el documento si no existe
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const newUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          emailVerified: firebaseUser.emailVerified,
          phoneVerified: false,
          role: 'user',
          permissions: [],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await setDoc(userRef, newUser);
        setUser(newUser);
      } else {
        const userData = userDoc.data();
        // Actualizar lastLogin
        await setDoc(userRef, {
          ...userData,
          lastLogin: new Date().toISOString()
        }, { merge: true });

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          emailVerified: firebaseUser.emailVerified,
          phoneVerified: userData.phoneVerified || false,
          role: userData.role || 'user',
          permissions: userData.permissions || []
        });
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      setError('Error al inicializar usuario');
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await initializeUser(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError('Error en la autenticación');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleError = (error: any) => {
    console.error('Auth Error:', error);
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('Este correo electrónico ya está registrado');
        break;
      case 'auth/invalid-email':
        setError('El correo electrónico no es válido');
        break;
      case 'auth/operation-not-allowed':
        setError('Operación no permitida');
        break;
      case 'auth/weak-password':
        setError('La contraseña es demasiado débil');
        break;
      case 'auth/user-disabled':
        setError('Esta cuenta ha sido deshabilitada');
        break;
      case 'auth/user-not-found':
        setError('Usuario no encontrado');
        break;
      case 'auth/wrong-password':
        setError('Contraseña incorrecta');
        break;
      case 'auth/popup-closed-by-user':
        setError('Inicio de sesión cancelado');
        break;
      default:
        setError('Ha ocurrido un error durante la autenticación');
    }
  };

  const createUserDocument = async (user: User, additionalData?: any) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email, displayName, phoneNumber } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          email,
          displayName,
          phoneNumber,
          createdAt,
          emailVerified: user.emailVerified,
          phoneVerified: false,
          ...additionalData,
        });
      } catch (error) {
        console.error('Error creating user document', error);
      }
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string
  ) => {
    try {
      setError(null);
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(user, { displayName });
      await sendEmailVerification(user);
      
      await createUserDocument(user, { displayName, phoneNumber });
      
      return user;
    } catch (error: any) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error: any) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    try {
      setError(null);
      setLoading(true);
      
      let authProvider;
      
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
      } else if (provider === 'apple') {
        authProvider = new OAuthProvider('apple.com');
        authProvider.addScope('email');
        authProvider.addScope('name');
      } else {
        throw new Error('Proveedor no soportado');
      }

      const result = await signInWithPopup(auth, authProvider);
      await createUserDocument(result.user);
      
      return result.user;
    } catch (error: any) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      handleError(error);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'superadmin';
  const userProfile = user;

  return {
    user,
    loading,
    error,
    signUpWithEmail,
    signInWithEmail,
    handleSocialSignIn,
    logout,
    isAdmin,
    isSuperAdmin,
    userProfile,
  };
};
