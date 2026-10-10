import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logOut,
  testConnection,
  seedInitialProductsIfEmpty,
  purgeAndSeed15Products,
  subscribeToProducts,
  subscribeToOrders,
  placeOrderInFirestore,
  saveProductInFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  updateOrderStatusInFirestore,
  syncUserProfileInFirestore,
  getUserProfileFromFirestore,
  toggleProductFavoriteInFirestore,
} from '../firebase';
import { Product, Order, UserProfile } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

interface FirebaseContextType {
  user: User | null;
  userProfile: UserProfile | null;
  savedProductIds: string[];
  isAuthReady: boolean;
  isAdminUser: boolean;
  products: Product[];
  orders: Order[];
  isLoadingProducts: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  placeOrder: (order: Order) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], notes?: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  purgeAndSeedProducts: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const ADMIN_EMAIL = 'sujith13022005@gmail.com';

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Connection test on boot per Firebase skill guidelines
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to auth state changes and sync user profile to Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        try {
          const profile = await syncUserProfileInFirestore(currentUser);
          setUserProfile(profile);
          setSavedProductIds(profile.savedProductIds || []);
        } catch (err) {
          console.warn('Failed to sync profile to Firestore:', err);
        }
      } else {
        setUserProfile(null);
        setSavedProductIds([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize and subscribe to products
  useEffect(() => {
    let unsubscribeProducts: (() => void) | undefined;

    const initData = async () => {
      try {
        setIsLoadingProducts(true);
        // Seed if empty or load from Firestore
        const initialList = await seedInitialProductsIfEmpty();
        if (initialList && initialList.length > 0) {
          setProducts(initialList);
        }
      } catch (err) {
        console.warn('Fallback to local products:', err);
      } finally {
        setIsLoadingProducts(false);
      }

      // Realtime listener
      try {
        unsubscribeProducts = subscribeToProducts((updated) => {
          if (updated && updated.length > 0) {
            setProducts(updated);
          }
        });
      } catch (err) {
        console.warn('Realtime subscription fallback:', err);
      }
    };

    initData();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, []);

  // Subscribe to real-time orders
  useEffect(() => {
    let unsubscribeOrders: (() => void) | undefined;
    try {
      unsubscribeOrders = subscribeToOrders((updatedOrders) => {
        setOrders(updatedOrders);
      });
    } catch (err) {
      console.warn('Order subscription error:', err);
    }

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    }
  };

  const handlePlaceOrder = async (order: Order) => {
    await placeOrderInFirestore(order);
  };

  const handleSaveProduct = async (product: Product) => {
    await saveProductInFirestore(product);
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    await updateProductInFirestore(productId, updates);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductFromFirestore(productId);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    notes?: string
  ) => {
    await updateOrderStatusInFirestore(orderId, status, notes);
  };

  const refreshProducts = async () => {
    try {
      const seeded = await seedInitialProductsIfEmpty();
      setProducts(seeded);
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  };

  const purgeAndSeedProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const seeded = await purgeAndSeed15Products();
      setProducts(seeded);
    } catch (err) {
      console.error('Failed to purge and seed products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!user) {
      await handleSignInGoogle();
      return;
    }
    try {
      const updatedFavorites = await toggleProductFavoriteInFirestore(user.uid, productId);
      setSavedProductIds(updatedFavorites);
      setUserProfile((prev) => (prev ? { ...prev, savedProductIds: updatedFavorites } : null));
    } catch (err) {
      console.warn('Failed to toggle favorite in Firestore:', err);
    }
  };

  const isFavorite = (productId: string) => savedProductIds.includes(productId);

  const isAdminUser = Boolean(user && user.email === ADMIN_EMAIL);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        userProfile,
        savedProductIds,
        isAuthReady,
        isAdminUser,
        products,
        orders,
        isLoadingProducts,
        signInWithGoogle: handleSignInGoogle,
        logout: handleLogout,
        toggleFavorite: handleToggleFavorite,
        isFavorite,
        placeOrder: handlePlaceOrder,
        saveProduct: handleSaveProduct,
        updateProduct: handleUpdateProduct,
        deleteProduct: handleDeleteProduct,
        updateOrderStatus: handleUpdateOrderStatus,
        refreshProducts,
        purgeAndSeedProducts,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
