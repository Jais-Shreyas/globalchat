import React, { useState } from 'react'
import { redirect, useNavigate } from 'react-router-dom';
import ContinueWithGoogleButton from './ContinueWithGoogleButton';
import type { Alert } from './types/alert'
import { User } from './types/user'

type LoginProps = {
  changeUser: (user: User | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Login({ changeUser, showAlert }: LoginProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ identifier: "", password: "" });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ identifier: creds.identifier, password: creds.password })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Login failed');
      }
      showAlert({ type: 'success', message: 'Logged in successfully!' });
      const { username, name, _id, email, photoURL } = json.user;
      changeUser({ username, name, _id, email, photoURL });
      navigate('/');
    } catch (e) {
      console.error("Login Error: ", e)
      if (e instanceof TypeError) {
        showAlert({ type: 'danger', message: "Unable to reach server, please try again later." });
      } else if (e instanceof Error) {
        showAlert({type: 'danger', message: e.message});
      } else {
        showAlert({type: 'danger', message: "Something went wrong"})
      }
      changeUser(null);
    }
  }

  return (
    <div className="row">
      <div className="col col-md-6 offset-md-3" style={{ marginTop: '5rem' }}>
        <div className="card shadow card-body">
          <h3 className="text-center">Login</h3>
          <form className="container needs-validation" onSubmit={(e) => handleSubmit(e)}>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">@</span>
              <input autoFocus value={creds.identifier} onChange={onChange} type="text" name="identifier" className="form-control" placeholder="Email / Username" aria-label="identifier" aria-describedby="identifier" required />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">#</span>
              <input value={creds.password} onChange={onChange} type="password" name="password" className="form-control" autoComplete='Current Password' placeholder="Password" aria-label="Password" aria-describedby="password" required />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Login</button>
            </div>
            <div className='d-flex justify-content-center mt-3'>
              <div className='' style={{ width: '35%', height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
              <p style={{ padding: '0 1rem' }}>Or</p>
              <div className='' style={{ width: '35%', height: '0.1rem', marginTop: '0.7rem', backgroundColor: 'black' }}></div>
            </div>
          </form>
          <div className="d-grid mb-3 mx-4">
            <ContinueWithGoogleButton changeUser={changeUser} showAlert={showAlert} />
          </div>
        </div>
      </div>
    </div>
  )
}
