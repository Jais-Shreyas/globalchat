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
import type { PrivateUser } from './types/user'
import LandingPage from './LandingPage';
import { apiFetch } from './helpers/fetchHelper';
import ConversationDisplay from './ConversationDisplay';

function App() {
  const reconnectDelay = useRef(1000); // 1 second initial delay
  const reconnectTimer = useRef<number | null>(null);
  const manualCloseRef = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const [alert, setAlert] = useState<Alert | null>(null);
  const showAlert = (alert: Alert): void => {
    setAlert(alert);
    setTimeout(() => setAlert(null), 2500);
  };

  const [dark, setDark] = useState<boolean>(true);

  const [user, setUser] = useState<PrivateUser | null>(null);

  const initialFetchUser = async (): Promise<PrivateUser | null> => {
    try {
      if (!localStorage.getItem('globalchat-authToken')) {
        return null;
      }
      const data = await apiFetch('/me');
      return data.user as PrivateUser;
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        return null; // normal logged-out state
      }
      console.error(err.message);
      return null;
    }
  };


  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const fetchedUser = await initialFetchUser();
      if (mounted) setUser(fetchedUser);
    };
    fetchUser();

    return () => { mounted = false; };
  }, []);


  const connectWebSocket = (cancelled: boolean) => {
    if (cancelled) return;

    const token = localStorage.getItem('globalchat-authToken');
    if (!token) return;

    const wsUrl = import.meta.env.VITE_BACKEND_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      reconnectDelay.current = 1000; // reset delay on successful connection
    };

    ws.onerror = () => { ws.close(); }

    ws.onclose = (e) => {
      if (manualCloseRef.current) {
        manualCloseRef.current = false;
        console.log("WebSocket manually closed");
        return;
      }

      if (e.code === 1008) {
        localStorage.removeItem('globalchat-authToken');
        setUser(null);
        showAlert({ type: 'warning', message: 'Session expired. Please log in again.' });
        return;
      }
      
      if (cancelled || !user) return;
      
      console.log(`WebSocket disconnected, attempting to reconnect in ${reconnectDelay.current} ms`);
      showAlert({ type: 'warning', message: 'Disconnected from chat server. Reconnecting...' });

      reconnectTimer.current = window.setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // exponential backoff up to 30 seconds
        connectWebSocket(cancelled);
      }, reconnectDelay.current);
    };
  };

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    connectWebSocket(cancelled);

    return () => {
      cancelled = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user?._id]);

  const changeUser = (user: PrivateUser | null) => {
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
            <Navbar page='home' dark={dark} wsRef={wsRef} manualCloseRef={manualCloseRef} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
            <Chat wsRef={wsRef} dark={dark} user={user} showAlert={showAlert} />
          </>
    },
    {
      path: "/about",
      element:
        <>
          <Navbar page='about' dark={dark} wsRef={wsRef} manualCloseRef={manualCloseRef} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <About dark={dark} />
        </>
    },
    {
      path: "/login",
      element:
        <>
          <Navbar page='login' dark={dark} wsRef={wsRef} manualCloseRef={manualCloseRef} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Login changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/signup",
      element:
        <>
          <Navbar page='signup' dark={dark} wsRef={wsRef} manualCloseRef={manualCloseRef} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Signup changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/profile/:username",
      element:
        <>
          <Navbar page='profile' dark={dark} wsRef={wsRef} manualCloseRef={manualCloseRef} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <Profile user={user} changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "/conversation/:conversationId",
      element:
        <>
          <Navbar page='profile' dark={dark} wsRef={wsRef} manualCloseRef={manualCloseRef} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
          <ConversationDisplay user={user} changeUser={changeUser} showAlert={showAlert} />
        </>
    },
    {
      path: "*",
      element:
        <>
          <Navbar page='home' dark={dark} wsRef={wsRef} manualCloseRef={manualCloseRef} changeMode={changeMode} user={user} changeUser={changeUser} alert={alert} showAlert={showAlert} />
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