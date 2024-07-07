import React, { useState } from 'react';
import './detail.css';
import { auth, db } from '../../lib/firebase';
import useUserStore from '../../lib/userStore';
import useChatStore from '../../lib/chatStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isRecieverBlocked ,changeBlock} = useChatStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const [openSections, setOpenSections] = useState({
    chatSettings: false,
    privacyHelp: false,
    sharedPhotos: true,
    sharedFiles: false,
  });

  const handleToggle = (section) => {
    setOpenSections((prevSections) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  const handleLogout = async () => {
    await auth.signOut();
    setCurrentUser(null); // Update Zustand store directly
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop(); // Set the file name to the last part of the URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBlock =async() => {
    if(!user) return;
    
  const userDocRef =doc(db,"users",currentUser.id)
    
try{

  await updateDoc(userDocRef,{
    blocked:isRecieverBlocked ? arrayRemove(user.id): arrayUnion(user.id),
  });
changeBlock()
}catch(err){

  console.log(err)

}

    console.log("User blocked");
  };

  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{user?.username}</h2>
        <p>{user?.email}</p>
      </div>
      <div className="info">
        <div className="options">
          <div className="title" onClick={() => handleToggle('chatSettings')}>
            <span>Chat Settings</span>
            <img src={openSections.chatSettings ? "./arrowUp.png" : "./arrowDown.png"} alt="" />
          </div>
          {openSections.chatSettings && (
            <div className="content">
              <p>Notification Settings</p>
              <p>Theme</p>
              <p>Blocked Contacts</p>
            </div>
          )}
        </div>
        <div className="options">
          <div className="title" onClick={() => handleToggle('privacyHelp')}>
            <span>Privacy & Help</span>
            <img src={openSections.privacyHelp ? "./arrowUp.png" : "./arrowDown.png"} alt="" />
          </div>
          {openSections.privacyHelp && (
            <div className="content">
              <p>Privacy Policy</p>
              <p>Terms of Service</p>
              <p>Help Center</p>
            </div>
          )}
        </div>
        <div className="options">
          <div className="title" onClick={() => handleToggle('sharedPhotos')}>
            <span>Shared Photos</span>
            <img src={openSections.sharedPhotos ? "./arrowUp.png" : "./arrowDown.png"} alt="" />
          </div>
          {openSections.sharedPhotos && (
            <div className="photo">
              <div className="photoItem">
                <div className="photoDetail">
                  <img src="./photo1.png" alt="Photo" />
                  <span>Photo 1</span>
                </div>
                <img src="./download.png" alt="Download" className="icon" onClick={() => handleDownload('./photo1.png')} />
              </div>
              <div className="photoItem">
                <div className="photoDetail">
                  <img src="./photo2.png" alt="Photo" />
                  <span>Photo 2</span>
                </div>
                <img src="./download.png" alt="Download" className="icon" onClick={() => handleDownload('./photo2.png')} />
              </div>
            </div>
          )}
        </div>
        <div className="options">
          <div className="title" onClick={() => handleToggle('sharedFiles')}>
            <span>Shared Files</span>
            <img src={openSections.sharedFiles ? "./arrowUp.png" : "./arrowDown.png"} alt="" />
          </div>
          {openSections.sharedFiles && (
            <div className="content">
              <p onClick={() => handleDownload('/path/to/file1.pdf')}>File 1.pdf</p>
              <p onClick={() => handleDownload('/path/to/file2.docx')}>File 2.docx</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={handleBlock}>{
      
        isCurrentUserBlocked ? "You are blocked" : isRecieverBlocked ? "User Blocked" :"Block User"}

      </button>
      <button className="logout" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Detail;
