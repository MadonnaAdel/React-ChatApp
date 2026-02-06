import { useState } from 'react';
import AddUser from '../addUser/AddUser'
import style from './UserInfo.module.scss'
import { useUserState } from '../../../lib/useUserState';
import { auth } from '../../../lib/firebase';
export default function UserInfo() {
    const [addMoreUser, setAddMoreUser] = useState(false);
    const [open, setOpen] = useState(false);
    const { currentUser } = useUserState();
    return (
        <section className={style.userInfoSec}>
            <div className={style.userInfo}>
                <img src={currentUser?.avatar || "/avatar.png"} alt="madonna" />
                <h3>{currentUser?.username}</h3>
            </div>
            <div className={style.userActions}>
                <div className={style.dropdown}>
                    <img
                        src="/more.png"
                        alt="more"
                        onClick={() => setOpen(!open)}
                        className={style.icon}
                    />

                    {open && (
                        <div className={style.menu}>
                            <button>Profile</button>
                            <button>Settings</button>
                            <button onClick={()=>auth.signOut()}>Logout</button>
                        </div>
                    )}
                </div>
                <img src="/edit.png" alt="edit action" onClick={() => setAddMoreUser((prev) => !prev)} />
            </div>
            {addMoreUser &&
                <AddUser />}
        </section>
    )
}
