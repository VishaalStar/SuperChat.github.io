import { create } from 'zustand';
import useUserStore from './userStore';

const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isRecieverBlocked: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // CHECK IF CURRENT USER IS BLOCKED
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isRecieverBlocked: false,
      });
    }

    // CHECK IF RECEIVER IS BLOCKED
    if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isRecieverBlocked: true,
      });
    }

    set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isRecieverBlocked: false,
    });
  },
  changeBlock: () => {
    set((state) => ({ ...state, isRecieverBlocked: !state.isRecieverBlocked }));
  }
}));

export default useChatStore;
