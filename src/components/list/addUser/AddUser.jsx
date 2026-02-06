import { useEffect, useState } from 'react';
import style from './AddUser.module.scss'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useUserState } from '../../../lib/useUserState';
import { toast } from 'react-toastify';

export default function AddUser() {
    const { currentUser } = useUserState();
    const [allUsers, setAllUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    useEffect(() => {
        getAllUsers();
    }, []);

    const getAllUsers = async () => {
        try {
            const usersCollection = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollection);
            const usersList = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllUsers(usersList);
            setResults(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const handelsearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const username = formData.get("username")?.trim().toLowerCase();
        if (!username) {
            setResults(allUsers);
            setIsSearching(false);
            return;
        } else {
            setIsSearching(true);
            const filterUser = allUsers.filter(user => user.username?.toLowerCase().includes(username) || user.email?.toLowerCase().includes(username));
            setResults(filterUser);

        }
    }
    const handleAdd = async (user) => {
        if (user.id === currentUser.id) {
            toast.error("Cannot add yourself!");
            return;
        }

        const chatRef = collection(db, "chats");
        const userChatRef = collection(db, "userChats");

        try {
            const newChatRef = doc(chatRef);
            // check if chat has already been exists
            const currentUserChatsDoc = await getDoc(doc(userChatRef, currentUser.id));
            if (currentUserChatsDoc.exists()) {
                const { chats } = currentUserChatsDoc.data();
                const chatExists = chats.some(chat => chat.receiverId === user.id);
                if (chatExists) {
                    toast.warning("is chat already exist");
                    return;
                }
            }
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
                participants: [currentUser.id, user.id]
            });

            await setDoc(doc(userChatRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: '',
                    receiverId: user.id,
                    updatedAt: Date.now()
                })
            }, { merge: true });

            toast.success("Chat created! Send a message to start the conversation.");
        } catch (error) {
            console.error("Error adding user to chat:", error);
            toast.error(`Failed to add user: ${error.message}`);
        }
    }
    const restSaerch = () => {
        setResults(allUsers);
        setIsSearching(false);
        document.querySelector(`.${style.search} input`).value = '';
    }
    return (
        <section className={style.addUserSec}>
            <form onSubmit={handelsearch} className={style.search}>
                <input type="text" placeholder='search by username' name='username' />
                <button type='submit'>search</button>
                {isSearching && <button type='button' onClick={restSaerch}>clear</button>}
            </form>

            <div className={style.users}>
                {results.length === 0 ?
                    <p className='text-center text-muted'>no users found</p> :
                    results
                        .filter(user => user.id !== currentUser?.id)
                        .map((user) => (

                            <div className={style.user} key={user.id}>
                                <div>
                                    <img src={user.avatar || "/avatar.png"} alt="add user" />
                                    <p>{user.username}</p>
                                </div>
                                <button onClick={() => handleAdd(user)}>add</button>
                            </div>


                        ))
                }
            </div>
        </section>
    )
}
