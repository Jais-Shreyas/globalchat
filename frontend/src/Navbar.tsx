import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { Link } from "react-router-dom";
import Alert from './Alert';
import type { User } from './types/user'
import type { Alert as AlertType } from './types/alert';

type NavbarProps = {
  dark: boolean;
  changeMode: () => void;
  page?: 'home' | 'about' | 'login' | 'signup' | 'profile';
  user: User | null;
  changeUser: (user: User | null) => void;
  alert: AlertType | null;
  showAlert: (alert: AlertType) => void;
}

export default function Navbar({ dark, changeMode, page = 'home', user, changeUser, alert, showAlert }: NavbarProps) {
  return (
    <>
      <nav className={`navbar sticky-top ${dark ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} navbar-expand-md`}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <h4 className="d-flex align-items-center">
              <img style={{ width: '2rem', borderRadius: '20%' }} src='/android-chrome-512x512.png' alt="Logo" />
              &nbsp;Global Chat
            </h4>
          </Link>
          <button className={`navbar-toggler bg-${dark ? 'dark' : 'light'}`} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mb-2 mb-md-0 w-100">
              <li className="nav-item">
                <Link className={`nav-link ${page === 'home' ? 'active' : ''}`} to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${page === 'about' ? 'active' : ''}`} to="/about">About</Link>
              </li>
              <li className="nav-item ms-md-auto">
                <div onClick={changeMode} className="nav-link" style={{ cursor: 'pointer' }}>
                  {dark ? <DarkModeIcon /> : <LightModeIcon />}
                </div>
              </li>
              {!user ? (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${page === 'login' ? 'active' : ''}`} to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${page === 'signup' ? 'active' : ''}`} to="/signup">Signup</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${page === 'home' ? 'active' : ''}`} to={`/profile/${user.username}`}>{user.name}</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/" onClick={() => {
                      changeUser(null);
                      showAlert({type: 'success', message: 'Successfully logged out!!'});
                    }}>Logout</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <Alert alert={alert} />
    </>
  );
}
