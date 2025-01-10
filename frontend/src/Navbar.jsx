import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { Link } from "react-router-dom"
import { useState } from 'react';
import Alert from './Alert';
import rootShouldForwardProp from '@mui/material/styles/rootShouldForwardProp';
export default function Navbar({ dark, changeMode, page = 'home', user, changeUser, alert, showAlert }) {
  return (
    <>
    <nav className={`navbar sticky-top ${dark ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} navbar-expand-md`}>
      <div className="container-fluid">
        <a className="navbar-brand" href="#"><h4>Global Chat</h4></a>
        <button className={`navbar-toggler bg-${dark ? 'dark' : 'light'}`} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-sm-0">
            <li className="nav-item">
              <Link className={`nav-link ${page === 'home' ? 'active' : ''}`} aria-current="page" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${page === 'about' ? 'active' : ''}`} aria-current="page" to="/about">About</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto mb-2 mb-sm-0">
            <div className={`form-check form-switch nav-link ms-5 ${dark ? 'text-light' : 'text-dark'}`}>
              <div onClick={changeMode} className="form-check-label" htmlFor="flexSwitchCheckChecked">{dark ? <DarkModeIcon /> : <LightModeIcon />} </div>
            </div>
            {!user ? <>
              <li className="nav-item">
                <Link className={`nav-link ${page === 'login' ? 'active' : ''}`} aria-current="page" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${page === 'signup' ? 'active' : ''}`} aria-current="page" to="/signup">Signup</Link>
              </li>
            </> : <>
              <li className="nav-item">
                <Link className={`nav-link ${page === 'home' ? 'active' : ''}`} aria-current="page" to="/">{user}</Link>
              </li>
              <li className="nav-item">
                <Link onClick={() => {changeUser(null); showAlert('success', 'Successfully logged out!!')}} className={`nav-link ${page === 'about' ? 'active' : ''}`} aria-current="page" to="/">Logout</Link>
              </li>
            </>}
          </ul>
        </div>
      </div>
    </nav>
    <Alert alert={alert} />
    </>
  )
}