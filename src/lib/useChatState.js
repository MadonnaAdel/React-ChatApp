import { create } from "zustand";
import { useUserState } from "./useUserState";

export const useChatState = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changChat: (chatId, user) => {
    const { currentUser } = useUserState.getState();
    if (user.blocked?.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }
    if (currentUser.blocked?.includes(user.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    }
    set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },
  changeBlockStatus: async () => {
    const state = useChatState.getState();
    const { blockUser, unblockUser } = useUserState.getState();

    if (!state.user) return;

    try {
      if (state.isReceiverBlocked) {
        await unblockUser(state.user.id);
        set({ isReceiverBlocked: false });
      } else {
        await blockUser(state.user.id);
        set({ isReceiverBlocked: true });
      }
    } catch (error) {
      console.error("Error changing block status:", error);
      throw error;
    }
  },
}));
