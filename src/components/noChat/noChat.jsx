import style from './Chat.module.scss'

export default function NoChat() {

  return (
    <section className={style.chatSec} >
      <div className={style.chatBody}>
        <p className={style.noMessages}>No messages yet. Start the conversation!</p>
      </div>
    </section>
  )
}
