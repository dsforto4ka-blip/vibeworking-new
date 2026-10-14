import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0591838063",
  appId: "1:374330509519:web:96cc6dd887a6e957a00fba",
  apiKey: "AIzaSyDQryncO_F_Qevr3UQT07yHgJzmqgN8MHw",
  authDomain: "gen-lang-client-0591838063.firebaseapp.com",
  storageBucket: "gen-lang-client-0591838063.firebasestorage.app",
  messagingSenderId: "374330509519",
  measurementId: "",
  oAuthClientId: "374330509519-0kjggi84g3n1prt4kn908bp2bkig6qn8.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account'
});

function signInWithGIS(): Promise<{ uid: string; displayName: string; email: string; photoURL: string }> {
  return new Promise((resolve, reject) => {
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        return reject(new Error('GIS not loaded'));
      }
      const client = google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: SCOPES.join(' '),
        callback: async (response: any) => {
          if (response.error) {
            return reject(response);
          }
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });
            const info = await userInfoRes.json();
            try {
              const credential = GoogleAuthProvider.credential(null, response.access_token);
              await signInWithCredential(auth, credential);
            } catch (fbErr) {
              console.warn('Firebase link notice:', fbErr);
            }
            resolve({
              uid: info.sub,
              displayName: info.name || 'Пользователь Google',
              email: info.email || '',
              photoURL: info.picture || ''
            });
          } catch (fetchErr) {
            reject(fetchErr);
          }
        },
        error_callback: (err: any) => {
          reject(err);
        }
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (e) {
      reject(e);
    }
  });
}

export async function signInWithGoogleOAuth() {
  // If Google Identity Services is available, try direct Google token client
  if ((window as any).google?.accounts?.oauth2) {
    try {
      return await signInWithGIS();
    } catch (gisErr: any) {
      console.warn('GIS attempt error, trying Firebase popup:', gisErr);
      if (gisErr && gisErr.type === 'token_failed') {
        // user closed popup or cancelled
        throw gisErr;
      }
    }
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      uid: user.uid,
      displayName: user.displayName || 'Пользователь Google',
      email: user.email || '',
      photoURL: user.photoURL || ''
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error && error.code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname || window.location.host;
      error.friendlyMessage = `Домен "${currentDomain}" не разрешён в Firebase. Добавьте "${currentDomain}" в Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    } else if (
      error &&
      (error.code === 'auth/operation-not-allowed' ||
       error.code === 'auth/configuration-not-found' ||
       error.message?.includes('invalid') ||
       error.message?.includes('action'))
    ) {
      error.friendlyMessage = `Вход через Google не включён в Firebase Console! В Firebase Console перейдите в Authentication -> Sign-in method -> Google, включите его (Enable), укажите email поддержки и нажмите Сохранить.`;
    }
    throw error;
  }
}

export async function signOutFromFirebase() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
}

// Sync Firebase Auth state with Vibe Working session
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    if (typeof (window as any).syncFirebaseUser === 'function') {
      (window as any).syncFirebaseUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Пользователь Google',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || ''
      });
    }
  }
});

// Bind to window for index.html integration
(window as any).signInWithGoogleOAuth = signInWithGoogleOAuth;
(window as any).signOutFromFirebase = signOutFromFirebase;
