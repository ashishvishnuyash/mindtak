'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from '@/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          // Fetch additional user data from Firestore
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Merge auth user data with Firestore user data
            const userDataFromFirestore = userDocSnap.data();
            const combinedUserData: User = {
              id: authUser.uid, // Use Firebase UID as id
              email: authUser.email || '',
              ...userDataFromFirestore, // Spread data from Firestore
            } as User;

            setUser(combinedUserData);
          } else {
            // Handle case where user document doesn't exist
            console.warn('User document not found in Firestore');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, []);

  return { user, loading };
}