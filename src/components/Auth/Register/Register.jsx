import { useState } from 'react';
import style from './Register.module.scss'
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { toast } from 'react-toastify';
import { doc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../../../lib/uploadToCloudinary';
import { useUserState } from '../../../lib/useUserState';
export default function Register() {
    const { fetchUserInfo } = useUserState();
    const [isLoading, setIsLoading] = useState(false);
    const [avatar, setAvatar] = useState({
        file: null,
        url: "/avatar.png"
    })
    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar({ file: e.target.files[0], url: URL.createObjectURL(file) })
        }
    }
    const handelRegister = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            let imgURL;
            if (avatar.file) {
                imgURL = await uploadToCloudinary(avatar.file);
            } else {
                const defaultAvatar = await fetch("/avatar.png");
                const blob = await defaultAvatar.blob();
                imgURL = await uploadToCloudinary(blob);
            }
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgURL,
                id: res.user.uid,
                blocked: []
            });
            await fetchUserInfo(res.user.uid);
            await setDoc(doc(db, "userChats", res.user.uid), {
                chats: [],
            });
            toast.success("Account has been created successfully")
        } catch (err) {
            toast.error(err.message)
        }
        finally {
            setIsLoading(false);
        }
    }
    return (
        <section>
            <form onSubmit={handelRegister} >
                <h2>Create Account</h2>
                <div className={style.avatarBox}>
                    <img src={avatar.url} onError={e => e.currentTarget.src = "/avatar.png"} alt="avatar" />
                    <label htmlFor="Avatar" >upload Avatar</label>

                    <input id='Avatar' name='avatar' type="file" style={{ display: "none" }} onChange={handleAvatar} />
                </div>
                <div className={style.inputBox}>

                    <label htmlFor="username" >Username</label>

                    <input id='username' name="username" type="text" required="required" placeholder='Enter your username' />
                </div>
                <div className={style.inputBox}>
                    <label htmlFor="email" >Email</label>
                    <input id='email' name="email" type="email" required="required" placeholder="example@gmail.com" />

                </div>
                <div className={style.inputBox}>
                    <label htmlFor="password" >Password</label>
                    <input id='password' name="password" type="password" required="required" placeholder='******' />
                </div>
                <div className={style.links}>
                    already have an account?
                    <Link to={"/login"}>Login</Link>
                </div>
                <button className={style.btn} disabled={isLoading}>{isLoading ? "loading..." : "Sign Up"}</button>
            </form>
        </section>
    )
}
