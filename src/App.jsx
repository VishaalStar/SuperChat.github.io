import  { useEffect } from 'react';
import List from './components/list/List';
import Chat from './components/chat/Chat';
import Detail from './components/Details/Detail';
import Login from './components/login/Login';
import Notification from './components/notification/Notification';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import useUserStore from './lib/userStore';
import useChatStore from './lib/chatStore';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo, setCurrentUser } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      if (user) {
        fetchUserInfo(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, setCurrentUser]);

  useEffect(() => {
    console.log('isLoading:', isLoading);
    console.log('currentUser:', currentUser);
  }, [isLoading, currentUser]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId &&<Chat />}
          {chatId &&<Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
