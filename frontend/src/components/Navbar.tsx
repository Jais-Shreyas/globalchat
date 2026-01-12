import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Alert from './Alert';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Navbar.css';

type NavbarProps = {
  page?: 'home' | 'about' | 'login' | 'signup' | 'profile';
}

export default function Navbar({ page = 'home' }: NavbarProps) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { dark, changeMode } = useTheme();
  const { user, setUser } = useAuth();
  const { closeWS } = useWebSocket();

  const logout = async () => {
    closeWS();
    localStorage.removeItem('globalchat-authToken');
    setUser(null);

    showAlert({ type: 'success', message: 'Logged out successfully!' });
    navigate('/login', { replace: true });
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
            <ul className={`navbar-nav mb-2 mb-md-0 w-100 bg-${dark ? 'dark' : 'light'} mobile-outer rounded-3 p-2`}>
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
      <Alert />
    </>
  );
}
