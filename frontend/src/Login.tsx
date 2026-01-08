import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ContinueWithGoogleButton from './ContinueWithGoogleButton';
import type { Alert } from './types/alert'
import { PrivateUser } from './types/user'
import { apiFetch } from './helpers/fetchHelper';
import { Lock, Person } from '@mui/icons-material';

type LoginProps = {
  changeUser: (user: PrivateUser | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Login({ changeUser, showAlert }: LoginProps) {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ identifier: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value })
  }

  const isFormValid = (): boolean => {
    if (!creds.identifier) {
      showAlert({ type: 'danger', message: 'Email / Username is required' });
      return false;
    }
    if (!creds.password) {
      showAlert({ type: 'danger', message: 'Password is required' });
      return false;
    }
    if (creds.identifier.includes(' ')) {
      showAlert({ type: 'danger', message: 'Email / Username cannot contain spaces' });
      return false;
    }
    if (creds.password.includes(' ')) {
      showAlert({ type: 'danger', message: 'Password cannot contain spaces' });
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!isFormValid()) return;
    setIsSubmitting(true);
    try {
      const json = await apiFetch('/login', {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(creds)
      });
      const { token, user } = json;
      localStorage.setItem('globalchat-authToken', token);
      changeUser(user);
      showAlert({ type: 'success', message: 'Logged in successfully!' });
      navigate('/');
    } catch (err: any) {
      console.error("Login Error: ", err)
      showAlert({ type: 'danger', message: err.message || 'Login failed' });
      changeUser(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="col" style={{ marginTop: '5rem', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
      <div className="card shadow card-body">
        <h3 className="text-center">Login</h3>
        <form className="container needs-validation" onSubmit={(e) => handleSubmit(e)}>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1"><Person /></span>
            <input autoFocus value={creds.identifier} onChange={onChange} type="text" name="identifier" className="form-control" placeholder="Email / Username" aria-label="identifier" aria-describedby="identifier" />
          </div>
          <div className="input-group">
            <span className="input-group-text" id="basic-addon1"><Lock /></span>
            <input value={creds.password} onChange={onChange} type={passwordVisible ? 'text' : 'password'} name="password" className="form-control" autoComplete='Current Password' placeholder="Password" aria-label="Password" aria-describedby="password" />
          </div>
          <div className='form-check my-2'>
            <input className='form-check-input' type="checkbox" name="show-password" id="show-password"
              onChange={(e) => setPasswordVisible(e.target.checked)}
            />
            <label className='form-check-label' htmlFor="show-password">Show Password</label>
          </div>
          <div className="d-grid">
            <button type="submit"
              className={`btn btn-primary`}
              disabled={isSubmitting}
              style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >{isSubmitting ? 'Logging you in ...' : 'Login'}</button>
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
        New? <a href="/signup">Create an account</a>
      </div>
    </div>
  )
}
