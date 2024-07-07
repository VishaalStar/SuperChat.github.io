import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { updateDoc, arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useState } from "react";
import useUserStore from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        userData.id = querySnapshot.docs[0].id;  // Ensure we have the user ID
        setUser(userData);
      } else {
        setUser(null);
        setError("User not found");
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred while searching for the user");
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchat");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),  
        messages: [],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),  // Set updatedAt with server timestamp
        }),
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now()  // Set updatedAt with server timestamp
        }),
      });

      console.log("Chat added successfully:", newChatRef.id);
    } catch (err) {
      console.log(err);
      setError("An error occurred while adding the chat");    
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" required />
        <button>Search</button>
      </form>
      {error && <div className="error">{error}</div>}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
