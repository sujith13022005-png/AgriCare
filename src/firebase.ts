import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, Order, UserProfile } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Enum & Interface
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connected successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore: Client appears offline or initial check pinged.');
    }
  }
}

// Google Sign-In
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Firestore Database Service for Products and Orders
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

// Purge all product data and seed the 15 new curated products into Firestore
export async function purgeAndSeed15Products(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    // Delete all existing documents in products collection
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
    });
    await Promise.all(deletePromises);
    console.log(`Purged ${snapshot.size} existing product documents from Firestore.`);

    // Seed the 15 new products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
    }
    console.log(`Seeded ${INITIAL_PRODUCTS.length} new products into Firestore.`);
    return INITIAL_PRODUCTS;
  } catch (error) {
    console.warn('Error purging and seeding products in Firestore:', error);
    return INITIAL_PRODUCTS;
  }
}

// Seed initial products into Firestore if database is empty or has old legacy data
export async function seedInitialProductsIfEmpty(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const docs = snapshot.docs;
    const hasLegacyData = docs.some(
      (d) => d.id.startsWith('anth-') || !INITIAL_PRODUCTS.some((p) => p.id === d.id)
    );
    if (snapshot.empty || hasLegacyData || snapshot.size !== INITIAL_PRODUCTS.length) {
      console.log('Detected empty or legacy product catalog in Firestore. Purging and seeding 15 new products...');
      return await purgeAndSeed15Products();
    } else {
      const fetched: Product[] = [];
      snapshot.forEach((d) => {
        fetched.push(d.data() as Product);
      });
      return fetched;
    }
  } catch (error) {
    console.warn('Fallback to local INITIAL_PRODUCTS on list error:', error);
    return INITIAL_PRODUCTS;
  }
}

// Explicit sync to replace Firestore catalog with the 15 new products
export async function syncAllAnthiyurProductsToFirestore(): Promise<Product[]> {
  return await purgeAndSeed15Products();
}

// Subscribe to real-time products updates
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((d) => {
        prods.push(d.data() as Product);
      });
      onUpdate(prods);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

// Subscribe to real-time orders updates
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((d) => {
        ordersList.push(d.data() as Order);
      });
      onUpdate(ordersList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

// Place a new order into Firestore and decrement stock of purchased items
export async function placeOrderInFirestore(order: Order): Promise<void> {
  const orderPath = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, orderPath);
  }

  // Decrement stock for each item
  for (const item of order.items) {
    const prodDocRef = doc(db, PRODUCTS_COLLECTION, item.productId);
    try {
      const prodSnap = await getDoc(prodDocRef);
      if (prodSnap.exists()) {
        const currentData = prodSnap.data() as Product;
        const newStock = Math.max(0, currentData.stock - item.quantity);
        await updateDoc(prodDocRef, { stock: newStock });
      }
    } catch (err) {
      console.warn(`Could not update stock for product ${item.productId}:`, err);
    }
  }
}

// Save or Update Product in Firestore
export async function saveProductInFirestore(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update specific fields of a product in Firestore
export async function updateProductInFirestore(productId: string, updates: Partial<Product>): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Update order status in Firestore
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: Order['status'],
  notes?: string
): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const updates: Partial<Order> = { status };
    if (notes !== undefined) updates.notes = notes;
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// User Profile & Data Persistence in Firestore
const USERS_COLLECTION = 'users';

export async function syncUserProfileInFirestore(user: User): Promise<UserProfile> {
  const userDocRef = doc(db, USERS_COLLECTION, user.uid);
  try {
    const docSnap = await getDoc(userDocRef);
    const now = new Date().toISOString();
    if (docSnap.exists()) {
      const existing = docSnap.data() as UserProfile;
      const updated: UserProfile = {
        ...existing,
        displayName: user.displayName || existing.displayName || 'Farmer',
        email: user.email || existing.email,
        photoURL: user.photoURL || existing.photoURL || '',
        lastLogin: now,
      };
      await updateDoc(userDocRef, {
        displayName: updated.displayName,
        photoURL: updated.photoURL,
        lastLogin: now,
      });
      return updated;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Farmer',
        email: user.email || '',
        photoURL: user.photoURL || '',
        phone: user.phoneNumber || '',
        villageCity: 'Anthiyur, Erode',
        savedProductIds: [],
        lastLogin: now,
        createdAt: now,
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    console.warn('Error syncing user profile to Firestore:', error);
    return {
      uid: user.uid,
      displayName: user.displayName || 'Farmer',
      email: user.email || '',
      photoURL: user.photoURL || '',
      lastLogin: new Date().toISOString(),
    };
  }
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Error getting user profile from Firestore:', err);
    return null;
  }
}

export async function toggleProductFavoriteInFirestore(uid: string, productId: string): Promise<string[]> {
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  try {
    const docSnap = await getDoc(userDocRef);
    let favorites: string[] = [];
    if (docSnap.exists()) {
      favorites = (docSnap.data() as UserProfile).savedProductIds || [];
    }
    const idx = favorites.indexOf(productId);
    if (idx > -1) {
      favorites.splice(idx, 1);
    } else {
      favorites.push(productId);
    }
    await updateDoc(userDocRef, { savedProductIds: favorites });
    return favorites;
  } catch (err) {
    console.warn('Error toggling favorite in Firestore:', err);
    return [];
  }
}

