import './App.css'
import Navbar from './Navbar'
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import { useEffect, useState } from 'react';
import About from './About';
import Login from './Login';
import Signup from './Signup';
import Chat from './Chat';
import Profile from './Profile';
function App() {
  const [dark, setDark] = useState(localStorage.getItem('dark') == 'true' ? true : false);
  const getUser = async () => {
    const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    });
    const user = await userRes.json();
    if (user.good) {
      return({ username: user.username, name: user.name, id: user._id, email: user.email });
    } else {
      return ({ username: null, name: null, id: null, email: null });
    }
  }
  const initialFetchUser = async () => {
    try {
      const checkUser = await JSON.parse(localStorage.getItem('user'));
      if (checkUser.username) {
        console.log("checkUser", checkUser)
        return (checkUser);
      } else {
        const user = await getUser();
        console.log("here", user);
        if (user.username) {
          console.log("User found from google login");
          localStorage.setItem('user', JSON.stringify({ username: user.username, name: user.name, id: user._id, email: user.email }));
          return (user);
        } else {
          console.log("No user found");
          return ({ username: null, name: null, id: null, email: null });
        }
      }
    } catch (e) {
      console.log(e);
      return ({ username: null, name: null, id: null, email: null });
    }
  }
  
  const [user, setUser] = useState({ username: null, name: null, id: null, email: null });
  useEffect(() => {
    const fetchUser = async () => {
      const user = await initialFetchUser();
      setUser(user);
    }
    fetchUser();
  }, []);
  // console.log("User found from local storage", user]=);
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
    // {
    //   path: "/dashboard",
    //   element:
    //     <>
    //       <Navbar page='dashboard' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
    //       <Dash dark={dark} user={user} changeUser={changeUser} showAlert={showAlert} />
    //     </>
    // },
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
