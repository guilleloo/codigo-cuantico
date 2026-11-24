import type { DataProvider } from "./provider";
import { MockProvider } from "./mock-provider";
import { firebaseEnabled, auth, firestore } from "@/lib/firebase/config";
import { FirebaseProvider } from "./firebase/firebase-provider";

// Selección del proveedor de datos. Si hay credenciales de Firebase en
// .env.local se usa Firestore; si no, el proveedor mock con localStorage.
// Es el único punto que decide el backend; las pantallas no cambian.
function createProvider(): DataProvider {
  if (firebaseEnabled && auth && firestore) {
    return new FirebaseProvider(firestore, auth);
  }
  return new MockProvider();
}

export const db: DataProvider = createProvider();
export type { DataProvider };
