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
import LandingPage from './LandingPage';

function App() {
  const reconnectDelay = useRef(1000); // 1 second initial delay
  const reconnectTimer = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [alert, setAlert] = useState<Alert | null>(null);
  const showAlert = (alert: Alert): void => {
    setAlert(alert);
    setTimeout(() => setAlert(null), 2500);
  };

  const [dark, setDark] = useState<boolean>(true);

  const [user, setUser] = useState<User | null>(null);

  const initialFetchUser = async (): Promise<User | null> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      return json.user as User;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await initialFetchUser();
      setUser(fetchedUser);
    };

    fetchUser();
  }, [user?._id]);


  const connectWebSocket = () => {
    if (!user) return;

    const wsUrl = import.meta.env.VITE_BACKEND_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      reconnectDelay.current = 1000; // reset delay on successful connection
      ws.send(JSON.stringify({ type: 'AUTH', userId: user._id })); // id remains same even after user changes username
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected, attempting to reconnect in ${reconnectDelay.current} ms`);
      showAlert({ type: 'warning', message: 'Disconnected from chat server. Reconnecting...' });
      reconnectTimer.current = window.setTimeout(() => {
        connectWebSocket();
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // exponential backoff up to 30 seconds
      }, reconnectDelay.current);
    };
  };

  useEffect(() => {
    if (!user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    connectWebSocket();

    return () => {  // cleanup on unmount or user change
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [user?._id]);

  const changeUser = (user: User | null) => {
    if (!user) {
      setUser(null);
    } else {
      setUser(user);
    }
  }

  useEffect(() => {
    if (dark) {
      document.body.style.backgroundColor = "#212529";
    } else {
      document.body.style.backgroundColor = "#f8f9fa";
    }
  }, [dark])
  const changeMode = () => {
    if (dark) {
      document.body.style.backgroundColor = "#f8f9fa";
    }
    else {
      document.body.style.backgroundColor = "#212529";
    }
    setDark(!dark);
  }
  const router = Router([
    {
      path: "/",
      element:
        (!user) ?
          <LandingPage />
          :
          <>
            <Navbar page='home' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
            <Chat wsRef={wsRef} dark={dark} user={user} showAlert={showAlert} />
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
      path: '/chat/:username',
      element:
        <>
          <Navbar page='home' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Chat wsRef={wsRef} dark={dark} user={user} showAlert={showAlert} />
        </>
    },
    {
      path: "*",
      element:
        <>
          <Navbar page='home' dark={dark} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Chat wsRef={wsRef} dark={dark} user={user} showAlert={showAlert} />
        </>
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;