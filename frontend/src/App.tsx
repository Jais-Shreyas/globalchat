import './App.css'
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar'
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import Chat from './components/Chat';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import GroupProfile from './components/GroupProfile';
import type { PrivateUser } from './types/user'
import { apiFetch } from './helpers/fetchHelper';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { waitForBackend } from './helpers/backendHealth';

function App() {
  const { user, setUser } = useAuth();
  const { dark, changeMode } = useTheme();
  const [isInitializing, setIsInitializing] = useState(true);
  const initialFetchUser = async (): Promise<PrivateUser | null> => {
    try {
      const data = await apiFetch('/me');
      return data.user as PrivateUser;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      const ready = await waitForBackend();

      if (!ready) {
        if (mounted) {
          setIsInitializing(false);
          setUser(null);
        }
        return;
      }

      const fetchedUser = await initialFetchUser();

      if (mounted) {
        setUser(fetchedUser);
        setIsInitializing(false);
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (dark) {
      document.body.style.backgroundColor = "#212529";
    } else {
      document.body.style.backgroundColor = "#f8f9fa";
    }
  }, [dark])

  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '10px',
          color: 'white'
        }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <div>Connecting to GlobalChat . . .</div>
      </div>
    );
  }

  const router = Router([
    {
      path: "/",
      element:
        (!user) ?
          <LandingPage />
          :
          <>
            <Navbar page='home' />
            <Chat />
          </>
    },
    {
      path: "/about",
      element:
        <>
          <Navbar page='about' />
          <About />
        </>
    },
    {
      path: "/login",
      element:
        <>
          <Navbar page='login' />
          <Login />
        </>
    },
    {
      path: "/signup",
      element:
        <>
          <Navbar page='signup' />
          <Signup />
        </>
    },
    {
      path: "/profile/:username",
      element:
        <>
          <Navbar page='profile' />
          <Profile />
        </>
    },
    {
      path: "/conversation/:conversationId",
      element:
        <>
          <Navbar page='profile' />
          <GroupProfile />
        </>
    },
    {
      path: "*",
      element:
        <>
          <Navbar page='home' />
          <Chat />
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