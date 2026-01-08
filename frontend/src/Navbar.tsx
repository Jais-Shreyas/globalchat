import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { Link } from "react-router-dom";
import Alert from './Alert';
import type { PrivateUser } from './types/user'
import type { Alert as AlertType } from './types/alert';
import './Navbar.css';

type NavbarProps = {
  dark: boolean;
  changeMode: () => void;
  wsRef: React.MutableRefObject<WebSocket | null>;
  manualCloseRef: React.MutableRefObject<boolean>;
  page?: 'home' | 'about' | 'login' | 'signup' | 'profile';
  user: PrivateUser | null;
  changeUser: (user: PrivateUser | null) => void;
  alert: AlertType | null;
  showAlert: (alert: AlertType) => void;
}

export default function Navbar({ dark, changeMode, wsRef, manualCloseRef, page = 'home', user, changeUser, alert, showAlert }: NavbarProps) {
  const logout = async () => {
    manualCloseRef.current = true;
    wsRef.current?.close();
    wsRef.current = null;

    localStorage.removeItem('globalchat-authToken');
    changeUser(null);

    showAlert({ type: 'success', message: 'Logged out successfully!' });
  }

  const closeNavbar = () => {
    const el = document.getElementById('navbarSupportedContent');
    if (!el) return;

    if (el.classList.contains('show')) {
      const bsCollapse = new (window as any).bootstrap.Collapse(el, {
        toggle: true
      });
      bsCollapse.hide();
    }
  };


  return (
    <>
      <nav className={`navbar sticky-top ${dark ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} navbar-expand-md`}
        style={{
          height: '4rem'
        }}
      >
        <div className="container-fluid">
          <Link onClick={closeNavbar} className="navbar-brand" to="/">
            <h4 className="d-flex align-items-center">
              <img style={{ width: '2rem', borderRadius: '20%' }} src='/android-chrome-512x512.png' alt="Logo" />
              &nbsp;Global Chat
            </h4>
          </Link>
          <button className={`navbar-toggler bg-${dark ? 'dark' : 'light'}`} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mb-2 mb-md-0 w-100 bg-dark mobile-outer rounded-3 p-2">
              <li className="nav-item mobile-border">
                <Link onClick={closeNavbar} className={`nav-link ${page === 'home' ? 'active' : ''}`} to="/">Home</Link>
              </li>
              <li className="nav-item mobile-border">
                <Link onClick={closeNavbar} className={`nav-link ${page === 'about' ? 'active' : ''}`} to="/about">About</Link>
              </li>
              <li className="nav-item ms-md-auto">
                {/* <div onClick={changeMode} className="nav-link" style={{ cursor: 'pointer' }}>
                  {dark ? <DarkModeIcon /> : <LightModeIcon />}
                </div> */}
              </li>
              {!user ? (
                <>
                  <li className="nav-item mobile-border">
                    <Link onClick={closeNavbar} className={`nav-link ${page === 'login' ? 'active' : ''}`} to="/login">Login</Link>
                  </li>
                  <li className="nav-item mobile-border">
                    <Link onClick={closeNavbar} className={`nav-link ${page === 'signup' ? 'active' : ''}`} to="/signup">Signup</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item mobile-border">
                    <Link onClick={closeNavbar} className={`nav-link ${page === 'home' ? 'active' : ''}`} to={`/profile/${user.username}`}>
                      {user.name}&nbsp;
                      <img
                        src={user.photoURL || "/defaultDP.jpg"}
                        alt="defaultDP"
                        style={{
                          margin: 'auto',
                          padding: '4px',
                          width: '2rem',
                          height: '2rem',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/defaultDP.jpg";
                        }}
                      />
                    </Link>
                  </li>
                  <li className="nav-item mobile-border">
                    <div className='nav-link text-left'
                      onClick={logout}
                      style={{ cursor: 'pointer' }}
                    >Logout</div>
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
