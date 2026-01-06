import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ContinueWithGoogleButton from './ContinueWithGoogleButton';
import { User } from './types/user';
import { Alert } from './types/alert';
import { apiFetch } from './helpers/fetchHelper';

type SignupProps = {
  changeUser: (user: User | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Signup({ changeUser, showAlert }: SignupProps) {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ name: "", username: "", email: "", password: "" });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const json = await apiFetch(`/signup`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(creds)
      });
      const { user, token } = json;
      localStorage.setItem('globalchat-authToken', token);
      changeUser(user);
      showAlert({ type: 'success', message: 'Welcome to Global Chat!' });
      navigate('/');
    } catch (err: any) {
      console.error("Signup Error: ", err);
      showAlert({ type: 'danger', message: err.message || 'Signup failed' });
      localStorage.removeItem('globalchat-authToken');
      changeUser(null);

    }
  }
  return (
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
  )
}
