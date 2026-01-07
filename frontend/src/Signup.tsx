import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ContinueWithGoogleButton from './ContinueWithGoogleButton';
import { PrivateUser } from './types/user';
import { Alert } from './types/alert';
import { apiFetch } from './helpers/fetchHelper';
import {
  AccountCircleOutlined, AlternateEmail,
  Password, PersonOutline,
} from '@mui/icons-material';

type SignupProps = {
  changeUser: (user: PrivateUser | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Signup({ changeUser, showAlert }: SignupProps) {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ name: "", username: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }

  type ValidationResult = {
    valid: boolean;
    message?: string;
  };

  const validateSignup = (): ValidationResult => {
    const name = creds.name.trim();
    const username = creds.username.trim();
    const email = creds.email.trim();
    const password = creds.password;

    if (!name) return { valid: false, message: 'Name is required' };
    if (!username) return { valid: false, message: 'Username is required' };
    if (!email) return { valid: false, message: 'Email is required' };
    if (!password) return { valid: false, message: 'Password is required' };

    if (username.includes(' ')) {
      return { valid: false, message: 'Username cannot contain spaces' };
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    if (password.includes(' ')) {
      return { valid: false, message: 'Password cannot contain spaces' };
    }

    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const validation = validateSignup();
    if (!validation.valid) {
      showAlert({ type: 'danger', message: validation.message || 'Invalid signup details' });
      return;
    }
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="col" style={{ marginTop: '5rem', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
      <div className="card shadow">
        <div className="card-body">
          <h3 className="text-center">SignUp</h3>
          <form className="container" onSubmit={(e) => handleSubmit(e)}>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1"><PersonOutline /></span>
              <input value={creds.name} onChange={onChange} type="text" name="name" className="form-control" placeholder="Name" aria-label="name" aria-describedby="name" />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon2"><AccountCircleOutlined /></span>
              <input value={creds.username} onChange={onChange} type="text" name="username" className="form-control" placeholder="username" aria-label="Username" aria-describedby="username" />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon3"><AlternateEmail /></span>
              <input value={creds.email} onChange={onChange} type="email" name="email" className="form-control" placeholder="example@xyz.com" aria-label="Email" aria-describedby="email" />
            </div>
            <div className="input-group">
              <span className="input-group-text" id="basic-addon4"><Password /></span>
              <input value={creds.password} onChange={onChange} type={passwordVisible ? 'text' : 'password'} name="password" className="form-control" autoComplete='Current Password' placeholder="Password" aria-label="password" aria-describedby="password" />
            </div>
            <div className='form-check my-2'>
              <input className='form-check-input' type="checkbox" name="show-password" id="show-password"
                onChange={(e) => setPasswordVisible(e.target.checked)}
              />
              <label className='form-check-label' htmlFor="show-password">Show Password</label>
            </div>
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                SignUp</button>
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
