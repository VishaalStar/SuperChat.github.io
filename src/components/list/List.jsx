import Userinfo from "./UserInfo/Userinfo"
import ChatList from "./ChatList/ChatList"
import './list.css'; 
const List = () => {
  return (
    <div className='list'>
      <Userinfo/>
      <ChatList/>
    </div>
  );
};

export default List;
