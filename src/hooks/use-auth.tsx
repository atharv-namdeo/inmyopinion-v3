
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { type UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<any>;
  register: (username: string, pass: string, gender: UserProfile['gender']) => Promise<any>;
  logout: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DUMMY_DOMAIN = 'feedback-flow-app.com';

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
             setUserProfile(null);
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = (username: string, pass: string) => {
    const email = `${username}@${DUMMY_DOMAIN}`;
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (username: string, pass: string, gender: UserProfile['gender']) => {
    // Check if username already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error('Username already taken');
    }
    
    const email = `${username}@${DUMMY_DOMAIN}`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    const userProfileData: UserProfile = {
      uid: newUser.uid,
      email,
      username,
      gender,
    };
    await setDoc(doc(db, "users", newUser.uid), userProfileData);
    setUserProfile(userProfileData);
    return userCredential;
  };

  const logout = () => {
    signOut(auth).then(() => {
        router.push('/');
    });
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function ClientAuthProvider({ children }: { children: ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return <AuthProvider>{children}</AuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
