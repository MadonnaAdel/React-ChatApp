import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import style from './Chat.module.scss'
import { faFaceLaughBeam, faMicrophone, faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useChatState } from '../../lib/useChatState';
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUserState } from '../../lib/useUserState';
import { toast } from 'react-toastify';
export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const endRef = useRef(null);
  const { chatId, user, isReceiverBlocked, isCurrentUserBlocked } = useChatState();
  const { currentUser } = useUserState();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(
      doc(db, "chats", chatId),
      (res) => {
        setMessages(res.data()?.messages || []);
      }
    );
    return () => unSub();
  }, [chatId]);
  const handeleChange = (e) => {
    setMessage(e.target.value);
  }
  const handelEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji.emoji);
  }
  const handelSendMessage = async (text) => {
    if (isReceiverBlocked) {
      toast.error("Cannot send message. You have blocked this user.");
      return;
    }
    if (isCurrentUserBlocked) {
      toast.error("Cannot send message. This user has blocked you.");
      return;
    }


    if (text.trim() === "") return;
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date()
        })
      });

        // update last message in userChats for current user
        const userChatRef = doc(db, "userChats", currentUser.id);
        const userChatSnap = await getDoc(userChatRef);
        const userChatsData = userChatSnap.data();
        if (!userChatsData?.chats) {
          setMessage("");
          return;
        }
        const chatIndex = userChatsData.chats.findIndex(chat => chat.chatId === chatId);
        if (chatIndex === -1) {
          setMessage("");
          return;
        }
        userChatsData.chats[chatIndex].lastMessage = text;
        userChatsData.chats[chatIndex].updatedAt = Date.now();
        await updateDoc(userChatRef, { chats: userChatsData.chats });

        // Add chat to receiver's userChats if not exists
        const receiverChatRef = doc(db, "userChats", user.id);
        const receiverChatSnap = await getDoc(receiverChatRef);

        if (receiverChatSnap.exists()) {
          const receiverChatsData = receiverChatSnap.data();
          const receiverChatExists = receiverChatsData.chats?.some(chat => chat.chatId === chatId);

          if (!receiverChatExists) {
            // Add chat to receiver for the first time
            await setDoc(receiverChatRef, {
              chats: arrayUnion({
                chatId: chatId,
                lastMessage: text,
                receiverId: currentUser.id,
                updatedAt: Date.now()
              })
            }, { merge: true });
          } else {
            // Update existing chat
            const receiverChatIndex = receiverChatsData.chats.findIndex(chat => chat.chatId === chatId);
            if (receiverChatIndex !== -1) {
              receiverChatsData.chats[receiverChatIndex].lastMessage = text;
              receiverChatsData.chats[receiverChatIndex].updatedAt = Date.now();
              await updateDoc(receiverChatRef, { chats: receiverChatsData.chats });
            }
          }
        }

      setMessage("");
    } catch (error) {
      setMessage("");
      console.error("Error sending message:", error);
    }
  }
  return (
    <section className={style.chatSec} >
      <div className={style.chatHeader}>
        <div className={style.chatUserInfo}>
          <img src={user?.avatar || "/avatar.png"} alt="madonna" />
          <h3> {user?.username || "Unknown User"}</h3>
        </div>
        <div className={style.chatActions}>
          <img src="/phone.png" alt="more action" />
          <img src="/video.png" alt="more action" />
          <img src="/search.png" alt="search icone" />
        </div>
      </div>
      <div className={style.chatBody}>
        {messages.length > 0 ? messages?.map((msg, i) => (
          <div
            className={msg.senderId === currentUser?.id ? style.wonMessage : style.message}
            key={msg.createdAt.seconds}
          >
            {msg.img && <img src={msg.img} alt={msg.text} className={style.imageMessage} />}
            <p className={style.messageContent}>{msg.text}</p>
            <span className={style.messageTime}>
              {msg.createdAt instanceof Date
                ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(msg.createdAt.seconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            </span>
          </div>
        )) : <p className={style.noMessages}>No messages yet. Start the conversation!</p>}

        <div ref={endRef}></div>
        {(isReceiverBlocked || isCurrentUserBlocked) && (
          <div className={style.blockedWarning}>
            {isReceiverBlocked && <p>⛔ You have blocked this user. Unblock to send messages.</p>}
            {isCurrentUserBlocked && <p>⛔ This user has blocked you. You cannot send messages.</p>}
          </div>
        )}

      </div>
      <div className={style.chatFooter}>
        <div className={style.emojies}>
          <FontAwesomeIcon icon={faFaceLaughBeam} onClick={() => setIsEmojiOpen((prev) => !prev)} />
          {isEmojiOpen && <EmojiPicker className={style.picker} onEmojiClick={handelEmojiClick}
          />}
        </div>
        <FontAwesomeIcon icon={faPaperclip} />
        <input
          type="text"
          placeholder={isReceiverBlocked || isCurrentUserBlocked ? 'Cannot send messages' : 'Type a message'}
          value={message}
          onChange={handeleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handelSendMessage(message);
            }
          }}
          disabled={isReceiverBlocked || isCurrentUserBlocked}
        />
        <button
          className={style.sendBtn}
          onClick={() => { handelSendMessage(message) }}
          disabled={isReceiverBlocked || isCurrentUserBlocked}
        >
          {message.trim() ?
            <FontAwesomeIcon icon={faPaperPlane} />
            : <FontAwesomeIcon icon={faMicrophone} />
          }
        </button>
      </div>
    </section>
  )
}
