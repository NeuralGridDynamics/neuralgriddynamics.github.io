import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDocFromServer,
  onSnapshot,
  collection,
  writeBatch
} from 'firebase/firestore';
import { SiteConfig, Project, Client, Service } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'site_config', 'main'));
    console.log('Connected to Cloud Firestore');
  } catch (error) {
    console.warn('Firestore connection note:', error);
  }
}
testConnection();

/**
 * Realtime Subscription for Site Configuration
 */
export function subscribeToSiteConfig(
  onData: (data: SiteConfig | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'site_config', 'main');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as SiteConfig);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Firestore site_config subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save Site Configuration to Cloud Firestore
 */
export async function saveSiteConfigToCloud(config: SiteConfig): Promise<void> {
  const docRef = doc(db, 'site_config', 'main');
  await setDoc(docRef, config, { merge: true });
}

/**
 * Realtime Subscription for Projects
 */
export function subscribeToProjects(
  onData: (data: Project[] | null) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'projects');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project));
        onData(projects);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Firestore projects subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save Projects to Cloud Firestore
 */
export async function saveProjectsToCloud(projects: Project[]): Promise<void> {
  const batch = writeBatch(db);
  projects.forEach((proj) => {
    const docRef = doc(db, 'projects', proj.id);
    batch.set(docRef, proj, { merge: true });
  });
  await batch.commit();
}

/**
 * Realtime Subscription for Clients
 */
export function subscribeToClients(
  onData: (data: Client[] | null) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'clients');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const clients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Client));
        onData(clients);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Firestore clients subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save Clients to Cloud Firestore
 */
export async function saveClientsToCloud(clients: Client[]): Promise<void> {
  const batch = writeBatch(db);
  clients.forEach((c) => {
    const docRef = doc(db, 'clients', c.id);
    batch.set(docRef, c, { merge: true });
  });
  await batch.commit();
}

/**
 * Realtime Subscription for Services
 */
export function subscribeToServices(
  onData: (data: Service[] | null) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'services');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Service));
        onData(services);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Firestore services subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save Services to Cloud Firestore
 */
export async function saveServicesToCloud(services: Service[]): Promise<void> {
  const batch = writeBatch(db);
  services.forEach((s) => {
    const docRef = doc(db, 'services', s.id);
    batch.set(docRef, s, { merge: true });
  });
  await batch.commit();
}
