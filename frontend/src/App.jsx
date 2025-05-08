import './App.css'
import Navbar from './Navbar'
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import { useEffect, useState } from 'react';
import About from './About';
import Login from './Login';
import Signup from './Signup';
import Chat from './Chat';
import Dashboard from './Dashboard';
import Profile from './Profile';
function App() {
  const [dark, setDark] = useState(localStorage.getItem('dark') == 'true' ? true : false);
  const initialFetchUser = () => {
    try {
      const checkUser = JSON.parse(localStorage.getItem('user'));
      if (checkUser) {
        return (checkUser);
      } else {
        return ({ username: null, name: null, id: null, email: null });
      }
    } catch (e) {
      console.log(e);
      return ({ username: null, name: null, id: null, email: null });
    }
  }
  const [user, setUser] = useState(initialFetchUser);
  const [alert, setAlert] = useState(null);
  const showAlert = (type, message) => {
    setAlert({
      message: message,
      type: type
    })
    setTimeout(() => {
      setAlert(null);
    }, 2500);
  }
  const changeUser = (userr) => {
    if (!userr) {
      localStorage.removeItem('user');
      setUser({ username: null, name: null, id: null, email: null });
    } else {
      localStorage.setItem('user', JSON.stringify(userr));
      setUser(userr);
    }
  }
  useEffect(() => {
    if (dark) {
      document.body.style.backgroundColor = "#212529";
    } else {
      document.body.style.backgroundColor = "#f8f9fa";
    }
  }, [])
  const changeMode = () => {
    if (dark) {
      document.body.style.backgroundColor = "#f8f9fa";
    }
    else {
      document.body.style.backgroundColor = "#212529";
    }
    localStorage.setItem('dark', !dark);
    setDark(!dark);
  }
  const router = Router([
    {
      path: "/",
      element:
        <>
          <Navbar page='home' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Chat dark={dark} user={user} showAlert={showAlert} />
        </>
    },
    {
      path: "/about",
      element:
        <>
          <Navbar page='about' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <About dark={dark} />
        </>
    },
    {
      path: "/login",
      element:
        <>
          <Navbar page='login' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Login dark={dark} user={user} changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/signup",
      element:
        <>
          <Navbar page='signup' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Signup dark={dark} user={user} changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/dashboard",
      element:
        <>
          <Navbar page='dashboard' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Dashboard dark={dark} user={user} changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/profile/:username",
      element:
        <>
          <Navbar page='profile' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Profile dark={dark} user={user} changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "*",
      element:
        <>
          <Navbar page='home' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Chat dark={dark} user={user} showAlert={showAlert} />
        </>
    }
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
