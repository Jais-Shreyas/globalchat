import React, { useState } from 'react'
import { redirect, useNavigate } from 'react-router-dom';
import ContinueWithGoogleButton from './ContinueWithGoogleButton';

export default function Login({ dark, user, changeUser, showAlert }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ email: "", password: "" });
  const onChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e) => {
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
        showAlert('success', 'Welcome back!');
        changeUser({ username: json.user.username, name: json.user.name, id: json.user._id, email: json.user.email });
        navigate('/');
      } else {
        showAlert('danger', json.message);
        changeUser({ user: null, name: null, id: null, email: null });
        navigate('/login');
      }

    } catch (e) {
      console.log(e);
      showAlert('danger', e);
      changeUser({ user: null, name: null, id: null, email: null });
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
            <div className="d-grid mb-3">
              <ContinueWithGoogleButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
