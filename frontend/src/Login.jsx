import React, { useState } from 'react'
import { redirect, useNavigate } from 'react-router-dom';

export default function Login({ dark, user, changeUser, showAlert }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: "", password: "" });
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
      body: JSON.stringify({ username: creds.username, password: creds.password })
    });
    try {
      const json = await response.json();
      console.log("json", json);
      if (json.isValid) {
        showAlert('success', 'Welcome back!');
        changeUser(json.user.username);
        navigate('/');
      } else {
        showAlert('danger', json.message);
        changeUser(null);
        navigate('/login');
      }

    } catch (e) {
      console.log(e);
      showAlert('danger', e);
      changeUser(null);
      navigate('/login');
    }
  }
  return (
    <div className="row">
      <div className="col col-md-6 offset-md-3" style={{ marginTop: '5rem' }}>
        <div className="card shadow">
          <div className="card-body">
            <h3 className="text-center">Login</h3>
            <form className="container needs-validation" onSubmit={(e) => handleSubmit(e)}>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">@</span>
                <input autoFocus value={creds.username} onChange={onChange} type="text" name="username" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="username" required />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">#</span>
                <input value={creds.password} onChange={onChange} type="password" name="password" className="form-control" autoComplete='Current Password' placeholder="Password" aria-label="Password" aria-describedby="password" required />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
