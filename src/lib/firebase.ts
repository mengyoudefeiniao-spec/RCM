import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authentication Helpers
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google popup sign-in encountered an issue (may be blocked by iframe):', error);
    // If popup is blocked by sandbox iframe, fall back to anonymous / guest auth
    try {
      const anonResult = await signInAnonymously(auth);
      return anonResult.user;
    } catch (anonErr) {
      console.error('Anonymous auth fallback error:', anonErr);
      throw error;
    }
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// User Profile Sync
export async function syncUserProfile(user: FirebaseUser, role: 'citizen' | 'agent' | 'admin' | 'auditor' = 'citizen') {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email || 'guest@ration.gov.iq',
    displayName: user.displayName || '配给专员 / 公民用户',
    photoURL: user.photoURL || '',
    role,
    lastLogin: serverTimestamp()
  }, { merge: true });
}

// Export collections and utilities
export {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onAuthStateChanged
};
export type { FirebaseUser };
