import './App.css'
import Navbar from './Navbar'
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import About from './About';
import Login from './Login';
import Signup from './Signup';
import Chat from './Chat';
import Profile from './Profile';
import type { Alert } from './types/alert'
import type { User } from './types/user'

function App() {
  const wsRef = useRef<WebSocket | null>(null);

  const [dark, setDark] = useState<boolean>(localStorage.getItem('dark') === 'true' ? true : false);

  const [user, setUser] = useState<User | null>(null);
  const initialFetchUser = (): User | null => {
    const rawRead = localStorage.getItem("user");
    if (!rawRead) return null;

    try {
      const parsed = JSON.parse(rawRead);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof parsed.id === "string" &&
        typeof parsed.username === "string" &&
        typeof parsed.name === "string" &&
        typeof parsed.email === "string"
      ) {
        return parsed;
      }

      throw new Error("Invalid user shape");
    } catch {
      localStorage.removeItem("user"); // misformatted user data, removed
      return null;
    }
  };

  useEffect(() => {
    setUser(initialFetchUser());
    // const backendUrl = import.meta.env.VITE_BACKEND_URL;
    // const ws = new WebSocket(backendUrl.replace('http', 'ws'));
    // wsRef.current = ws;
    // ws.onopen = () => {
    //   console.log('WebSocket connection established');
    // };
  }, []);

  const [alert, setAlert] = useState<Alert | null>(null);
  const showAlert = (alert: Alert): void => {
    setAlert(alert);
    setTimeout(() => setAlert(null), 2500);
  };

  const changeUser = (user: User | null) => {
    if (!user) {
      localStorage.removeItem('user');
      setUser(null);
    } else {
      localStorage.setItem('user', JSON.stringify(user));
      // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      //   wsRef.current.send(JSON.stringify({ type: 'AUTH', user: user }));
      // }
      setUser(user);
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
    localStorage.setItem('dark', String(!dark));
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
          <Login changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/signup",
      element:
        <>
          <Navbar page='signup' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Signup changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/profile/:username",
      element:
        <>
          <Navbar page='profile' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Profile user={user} changeUser={changeUser} showAlert={showAlert} />
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

export default App;