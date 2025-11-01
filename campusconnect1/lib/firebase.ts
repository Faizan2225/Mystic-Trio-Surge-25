import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Enable emulators in development (optional)
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  try {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`)
    }
    if (process.env.FIREBASE_FIRESTORE_EMULATOR_HOST) {
      const [host, port] = process.env.FIREBASE_FIRESTORE_EMULATOR_HOST.split(":")
      connectFirestoreEmulator(db, host, Number.parseInt(port))
    }
    if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
      const [host, port] = process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(":")
      connectStorageEmulator(storage, host, Number.parseInt(port))
    }
  } catch (error) {
    // Emulator already connected
  }
}

export default app
