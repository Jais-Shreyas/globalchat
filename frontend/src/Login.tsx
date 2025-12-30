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
  const [creds, setCreds] = useState({ email: "", password: "" });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ email: creds.email, password: creds.password })
    });
    try {
      const json = await response.json();
      console.log("Login json", json);
      if (json.isValid) {
        showAlert({type: 'success', message: 'Welcome back!'});
        const {username, name, _id, email} = json.user;
        changeUser({ username, name, id: _id, email });
        navigate('/');
      } else {
        showAlert({type: 'danger', message: json.message});
        changeUser(null);
        navigate('/login');
      }
    } catch (e) {
      console.log(e);
      showAlert({type: 'danger', message: String(e)});
      changeUser(null);
      navigate('/login');
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
              <input autoFocus value={creds.email} onChange={onChange} type="text" name="email" className="form-control" placeholder="Email / Username" aria-label="email" aria-describedby="email" required />
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
