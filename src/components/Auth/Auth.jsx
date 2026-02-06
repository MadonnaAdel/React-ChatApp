import { Outlet } from 'react-router-dom'
import style from './Auth.module.scss'
import Login from './Login/Login'
import Register from './Register/Register'

export default function Auth() {
    return (
        <section>
            <div className={style.containerAuth}>
                <div className="leftSec">
                    <Outlet/>
                </div>
                <div className={style.speritor}>
                </div>
                <div className={style.rightSec}>
                    <img src="/login.svg" alt="login" />
                </div>
            </div>
        </section>
    )
}
