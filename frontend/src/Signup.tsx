import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ContinueWithGoogleButton from './ContinueWithGoogleButton';
import { User } from './types/user';
import { Alert } from './types/alert';

type SignupProps = {
  changeUser: (user: User | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Signup({ changeUser, showAlert }: SignupProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ name: "", username: "", email: "", password: "" });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { name, username, email, password } = creds;
      const response = await fetch(`${backendUrl}/signup`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, username, email, password })
      });
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.message || 'SignUp failed');
      }
      showAlert({ type: 'success', message: 'Welcome to Global Chat!' });

      const { username: u, name: n, _id, email: e, photoURL: p } = json.user;
      changeUser({ username: u, name: n, _id, email: e, photoURL: p });
      navigate('/');
    } catch (e) {
      console.error("SignUp Error: ", e)
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
    </div>
  )
}
