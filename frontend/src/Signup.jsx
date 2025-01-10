import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Signup({ dark, user, changeUser, alert, showAlert }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ name: "", username: "", email: "", password: "" });
  const onChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${backendUrl}/signup`, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ name: creds.name, email: creds.email, username: creds.username, password: creds.password })
    });
    try {
      const json = await response.json()
      if (!json.isValid) {
        showAlert('danger', json.message);
        changeUser({user: null, id: null});
        navigate('/signup');
      } else {
        showAlert('success', 'Welcome to Global Chat!');
        changeUser(json.user.username);
        navigate('/');
      }
    } catch (e) {
      console.log(e);
      showAlert('danger', e);
      changeUser({user: null, id: null});
    }
  }
  return (
    <div className="row">
      <div className="col col-md-6 offset-md-3 mt-5">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="text-center">SignUp</h3>
            <form className="container" onSubmit={(e) => handleSubmit(e)}>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon3">@</span>
                <input required value={creds.name} onChange={onChange} type="text" name="name" className="form-control" placeholder="Name" aria-label="name" aria-describedby="name" />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">@</span>
                <input required value={creds.username} onChange={onChange} type="text" name="username" className="form-control" placeholder="username" aria-label="Username" aria-describedby="username" />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon2">@</span>
                <input required value={creds.email} onChange={onChange} type="email" name="email" className="form-control" placeholder="example@xyz.com" aria-label="Email" aria-describedby="email" />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon4">#</span>
                <input required value={creds.password} onChange={onChange} type="password" name="password" className="form-control" autoComplete='Current Password' placeholder="Password" aria-label="password" aria-describedby="password" />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">SignUp</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
