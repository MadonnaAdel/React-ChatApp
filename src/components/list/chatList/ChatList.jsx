import { useEffect, useState } from 'react'
import style from './ChatList.module.scss'
import { useUserState } from '../../../lib/useUserState';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatState } from '../../../lib/useChatState';
export default function ChatList() {
    const [chats, setChats] = useState([]);
    const { currentUser } = useUserState();
    const { changChat } = useChatState();
    const getDateValue = (updatedAt) => {
        if (!updatedAt) return null;
        if (updatedAt instanceof Date) return updatedAt;
        if (typeof updatedAt === "number") return new Date(updatedAt);
        if (updatedAt?.toDate) return updatedAt.toDate();
        if (typeof updatedAt?.seconds === "number") return new Date(updatedAt.seconds * 1000);
        return null;
    };
    useEffect(() => {
        if (!currentUser?.id) return;
        const unSub = onSnapshot(
            doc(db, "userChats", currentUser.id), async (res) => {
                try {
                    const data = res.data();
                    if (!data || !data.chats) {
                        setChats([]);
                        return;
                    }
                    const items = data.chats;
                    const promises = items.map(async (item) => {
                        try {
                            const receiverId = item.receiverId || item.reciverId;
                            const userDocRef = doc(db, "users", receiverId);
                            const userDocSnap = await getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                const user = userDocSnap.data();
                                return { ...item, user };
                            } else {
                                return { ...item, user: null };
                            }
                        } catch (error) {
                            console.error("Error fetching user data:", error);
                            return { ...item, user: null };
                        }
                    });
                    const chats = await Promise.all(promises);
                    setChats(
                        chats.sort((a, b) => {
                            const aDate = getDateValue(a.updatedAt);
                            const bDate = getDateValue(b.updatedAt);
                            return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
                        })
                    );
                } catch (error) {
                    console.error("Error in chat listener:", error);
                    setChats([]);
                }
            }
        );
        return () => unSub()
    }, [currentUser?.id]);
    const handelChangeChat = (chat) => {
        changChat(chat.chatId, chat.user);
    }
    return (
        <section className={style.chatList}>
            <div className={style.search}>
                <img src="/search.png" alt="search icone" />
                <input type="text" placeholder='Search or start a new chat ' />
            </div>
            <hr />
            <div className={style.chats}>
                {chats.map((chat, i) => (
                    <div className={style.chat} key={chat.chatId }>
                        <div className={style.chatUserInfo} onClick={()=>handelChangeChat(chat)}>
                            <img src={chat.user?.avatar || "/avatar.png"} alt="chat" />
                            <div className={style.chatDetails}>
                                <h4>{chat.user?.username || `User ${(chat.receiverId || chat.reciverId)?.slice(0, 8)}`}</h4>
                                <p>{chat?.lastMessage }</p>
                            </div>
                        </div>
                        <div className={style.chatTime}>
                            <span>
                                {getDateValue(chat.updatedAt)
                                    ? getDateValue(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ""}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
