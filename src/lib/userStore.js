import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    console.log('Fetching user info for uid:', uid);
    if (!uid) {
      console.log('No UID provided, setting currentUser to null and isLoading to false');
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('User data found:', docSnap.data());
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        console.log('No user data found, setting currentUser to null');
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log('Error fetching user info:', err);
      set({ currentUser: null, isLoading: false });
    }
  },
  setCurrentUser: (user) => {
    console.log('Setting currentUser:', user);
    set({ currentUser: user, isLoading: false });
  },
}));

export default useUserStore;
