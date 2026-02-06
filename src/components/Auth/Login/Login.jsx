import { Link, useNavigate } from 'react-router-dom'
import style from './Login.module.scss'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useUserState } from '../../../lib/useUserState';
export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const { fetchUserInfo } = useUserState();
    const handelLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            await fetchUserInfo(res.user.uid);
            toast.success("Welcome back!")
        } catch (err) {
            toast.error(err.message)
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <section>
            <form onSubmit={handelLogin} >
                <h2>Wellcome back</h2>
                <div className={style.inputBox}>
                    <label htmlFor="email" >Email</label>
                    <input id='email' name='email' type="email" required="required" placeholder='example@gmail.com' />
                </div>
                <div className={style.inputBox}>
                    <label htmlFor="password" >Password</label>
                    <input id='password' name="password" type="password" required="required" placeholder="enter your password" />
                </div>
                <div className={style.links}>
                    are you new here?
                    <Link to={"/register"}>Sign Up</Link>
                </div>
                <button className={style.btn} disabled={isLoading} aria-busy={isLoading}>
                    {isLoading ? "loading..." : "Login"}
                </button>
            </form>
        </section>
    )
}
