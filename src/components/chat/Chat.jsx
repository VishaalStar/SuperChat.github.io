import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './chat.css'; // Ensure to include necessary styles
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import useChatStore from '../../lib/chatStore';
import useUserStore from '../../lib/userStore';
import upload from '../../lib/upload';

const Chat = () => {
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChat(res.data());
      });
      return () => {
        unSub();
      };
    }
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleSend = async () => {
    if (img.file) {
      await handleSendPhoto();
    } else {
      await handleSendText();
    }
  };

  const handleSendText = async () => {
    if (text.trim() === "") return; // Exit if no text entered

    try {
      await updateChatMessages(text.trim(), null);

    } catch (err) {
      console.error("Error sending message:", err);
    }

    setText(""); // Reset text input after sending
  };

  const handleSendPhoto = async () => {
    if (!img.file) return; // Exit if no image selected

    try {
      const imgUrl = await upload(img.file);
      await updateChatMessages(null, imgUrl);

    } catch (err) {
      console.error("Error sending photo:", err);
    }

    setImg({
      file: null,
      url: ""
    });
  };

  const updateChatMessages = async (messageText, imageUrl) => {
    let message = {
      senderId: currentUser.id,
      createdAt: new Date(),
    };

    if (messageText) {
      message.text = messageText;
    }

    if (imageUrl) {
      message.img = imageUrl;
    }

    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion(message),
    });

    const userIds = [currentUser.id, user.id];

    userIds.forEach(async (id) => {
      const userChatsRef = doc(db, "userchat", id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

        userChatsData.chats[chatIndex].lastMessage = messageText || "Sent a photo";
        userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
        userChatsData.chats[chatIndex].updatedAt = Date.now();

        await updateDoc(userChatsRef, {
          chats: userChatsData.chats,
        });
      }
    });
  };

  return (
    <div className={`chat ${isCurrentUserBlocked || isReceiverBlocked ? 'disabled' : ''}`}>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{chat?.messages[chat?.messages.length - 1]?.text}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser.id ? "message own" : "message other"} key={message?.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message...."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <button
            className={img.url ? "SendButton SendPhotoButton" : "SendButton"}
            onClick={img.url ? handleSendPhoto : handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            {img.url ? "Send Photo" : "Send"}
          </button>
        </div>
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
