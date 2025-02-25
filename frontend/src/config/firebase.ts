'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPJSHwjUcprH-j76EB_btmf94rFUq2QD8",
  authDomain: "artistsaid-app.firebaseapp.com",
  projectId: "artistsaid-app",
  storageBucket: "artistsaid-app.appspot.com",
  messagingSenderId: "536104599304",
  appId: "1:536104599304:web:07a8b47d89555ec7a276bd",
  measurementId: "G-531EJH4JRB"
};

let app;
let auth;
let db;
let storage;

try {
  // Initialize Firebase only if it hasn't been initialized yet
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  
  // Initialize Firestore with persistence enabled
  if (typeof window !== 'undefined') {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager()
      })
    });
  } else {
    db = getFirestore(app);
  }
  
  storage = getStorage(app);

  console.log('Firebase initialized successfully with project:', app.options.projectId);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

export { app, auth, db, storage };
