import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function Dash({ dark, user, changeUser, alert, showAlert }) {
  const Navigate = useNavigate();
  useEffect(() => {
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
        console.log("User found");
        changeUser({ username: user.username, name: user.name, id: user._id, email: user.email });
        localStorage.setItem('user', JSON.stringify({ username: user.username, name: user.name, id: user._id, email: user.email }));
        Navigate('/');
      } else {
        console.log("User not found");
        changeUser({ username: null, name: null, id: null, email: null });
        localStorage.removeItem('user');
        Navigate('/login');
      }
    }
    getUser();
  }, []);
  useEffect(() => {
    // Navigate('/');
  }, []);
  return (
    <div>
      {"You are not supposed to be here, kindly refresh the page."}
    </div>
  )
}

export default Dash