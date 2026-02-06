import { create } from "zustand";
import { db, auth } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export const useUserState = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });
    try {
      set({ isLoading: true });
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        set({ currentUser: userData, isLoading: false });
        return;
      }

      const currentAuthUser = auth.currentUser;

      if (!currentAuthUser) {
        set({ currentUser: null, isLoading: false });
        return;
      }

      // default user data
      const defaultUserData = {
        username:
          currentAuthUser.displayName ||
          currentAuthUser.email?.split("@")[0] ||
          "User",
        email: currentAuthUser.email,
        avatar: currentAuthUser.photoURL || "/avatar.png",
        id: uid,
        blocked: [],
      };

      await setDoc(doc(db, "users", uid), defaultUserData);
      await setDoc(doc(db, "userChats", uid), { chats: [] });
      set({ currentUser: defaultUserData, isLoading: false });
    } catch (error) {
      console.error("Error fetching user info:", error);
      set({ currentUser: null, isLoading: false });
    }
  },
  blockUser: async (blockedUserId) => {
    const { currentUser } = useUserState.getState();
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        blocked: arrayUnion(blockedUserId),
      });
      set({
        currentUser: {
          ...currentUser,
          blocked: [...(currentUser.blocked || []), blockedUserId],
        },
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  },
  unblockUser: async (blockedUserId) => {
    const { currentUser } = useUserState.getState();
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        blocked: arrayRemove(blockedUserId),
      });
      set({
        currentUser: {
          ...currentUser,
          blocked: (currentUser.blocked || []).filter(
            (id) => id !== blockedUserId,
          ),
        },
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      throw error;
    }
  },
}));
