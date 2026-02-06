import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Auth from "./components/Auth/Auth"
import Login from "./components/Auth/Login/Login"
import Register from "./components/Auth/Register/Register"
import Layout from "./components/layout/layout"
import { ToastContainer } from "react-toastify"
import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"
import { useUserState } from "./lib/useUserState"

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserState();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid);
      } else {
        fetchUserInfo(null);
      }
    });
    return () => unsub();
  }, [fetchUserInfo])
  if (isLoading) {
    return <h1 className="loading">Loading...</h1>
  }
  return (
    <div className='container'>
      <BrowserRouter>
        <Routes>
          {currentUser ? (
            <>
              <Route path="/" element={<Layout />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <Route path="/" element={<Auth />}>
              <Route index element={<Login />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>


  )
}

export default App