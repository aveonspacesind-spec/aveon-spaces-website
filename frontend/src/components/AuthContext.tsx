"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let docUnsubscribe: () => void = () => {};

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Clean up previous doc listener if user changes/logs out
      docUnsubscribe();

      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Initial set with Firebase Auth user
      setUser(currentUser);

      // Listen to real-time Firestore updates for the user profile (photoURL, name, etc.)
      const userDocRef = doc(db, "users", currentUser.uid);
      docUnsubscribe = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const firestorePhotoURL = data.photoURL;
            const firestoreName = data.name || data.displayName;

            // Create a Proxy so user.photoURL and user.displayName automatically yield Firestore profile values if set
            const updatedUser = new Proxy(currentUser, {
              get(target, prop, receiver) {
                if (prop === "photoURL") {
                  return firestorePhotoURL !== undefined ? firestorePhotoURL : target.photoURL;
                }
                if (prop === "displayName") {
                  return firestoreName || target.displayName;
                }
                const value = Reflect.get(target, prop, receiver);
                return typeof value === "function" ? value.bind(target) : value;
              },
            });

            setUser(updatedUser);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user profile doc:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      authUnsubscribe();
      docUnsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
