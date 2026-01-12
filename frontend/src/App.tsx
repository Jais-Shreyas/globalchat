import './App.css'
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'
import { useEffect } from 'react';
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

function App() {
  const { user, setUser } = useAuth();
    const {dark, changeMode} = useTheme();
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

    const fetchUser = async () => {
      const fetchedUser = await initialFetchUser();
      if (mounted) setUser(fetchedUser);
    };
    fetchUser();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (dark) {
      document.body.style.backgroundColor = "#212529";
    } else {
      document.body.style.backgroundColor = "#f8f9fa";
    }
  }, [dark])

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