import ChatList from './chatList/ChatList'
import style from './List.module.scss'
import UserInfo from './userInfo/UserInfo'
export default function List() {
  return (
    <section className={style.listSec}>
      <UserInfo />
      <ChatList/>
    </section>
  )
}
